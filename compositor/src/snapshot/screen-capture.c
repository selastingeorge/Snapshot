#include <drm_fourcc.h>
#include <cjson/cJSON.h>
#include <png.h>
#include "websocket/websocket.h"
#include "snapshot/screen-capture.h"

struct capture_config capture_config  = {0};
struct capture_state capture_state  = {0};
struct screenshot *screenshots = NULL;
struct timespec last_measure_time = {0};

cJSON *capture_progress = NULL;
cJSON *capture_response = NULL;
cJSON *capture_progress_object = NULL;

cJSON *save_progress = NULL;
cJSON *save_response = NULL;
cJSON *save_progress_object = NULL;

size_t screenshot_count = 0;
static size_t screenshots_capacity = SCREENSHOT_CAPACITY;
pthread_mutex_t screenshots_mutex = PTHREAD_MUTEX_INITIALIZER;

void init_capturing(void)
{
    // initialize capture configuration
    capture_config.delay = 500;
    capture_config.duration = 30000;
    capture_config.output_directory = NULL;

    capture_progress = cJSON_CreateObject();
    capture_response = cJSON_AddArrayToObject(capture_progress,"message");
    capture_progress_object = cJSON_CreateObject();
    cJSON_AddStringToObject(capture_progress, "type", "response");
    cJSON_AddStringToObject(capture_progress, "id", "CAPTURE_PROGRESS");
    cJSON_AddNumberToObject(capture_progress_object, "delay", 300);
    cJSON_AddNumberToObject(capture_progress_object, "duration", 3000);
    cJSON_AddNumberToObject(capture_progress_object, "captured_screenshots", 0);
    cJSON_AddNumberToObject(capture_progress_object, "elapsed_duration", 0);
    cJSON_AddItemToArray(capture_response, capture_progress_object);

    save_progress = cJSON_CreateObject();
    save_response = cJSON_AddArrayToObject(save_progress,"message");
    save_progress_object = cJSON_CreateObject();
    cJSON_AddStringToObject(save_progress, "type", "response");
    cJSON_AddStringToObject(save_progress, "id", "SAVE_PROGRESS");
    cJSON_AddNumberToObject(save_progress_object, "captured", 0);
    cJSON_AddNumberToObject(save_progress_object, "saved", 0);
    cJSON_AddItemToArray(save_response, save_progress_object);

    screenshots = (struct screenshot *)malloc(screenshots_capacity * sizeof(struct screenshot));
    if (!screenshots) 
    {
        wlr_log(WLR_ERROR,"Unable to allocate memory for screenshots array.");
        exit(EXIT_FAILURE);
    }
}

void handle_capture_screenshot(int duration, int delay, char *output_directory)
{
    screenshot_count = 0;
    if(!screenshots)
    {
        screenshots = (struct screenshot *)malloc(screenshots_capacity * sizeof(struct screenshot));
        if (!screenshots) 
        {
            wlr_log(WLR_ERROR,"Unable to allocate memory for screenshots array.");
            exit(EXIT_FAILURE);
        }
    }


    capture_config.delay = delay;
    capture_config.duration = duration;
    capture_config.output_directory = output_directory;

    wlr_log(WLR_INFO,"Duration %d",duration);

    cJSON_ReplaceItemInObject(capture_progress_object, "delay", cJSON_CreateNumber(delay));
    cJSON_ReplaceItemInObject(capture_progress_object, "duration", cJSON_CreateNumber(duration));

    capture_state.captured_screenshots = 0;
    capture_state.elapsed_duration = 0;
    capture_state.saving = false;
    capture_state.capturing = true;
}

void stop_capturing(void)
{
    pthread_mutex_lock(&screenshots_mutex);
    capture_state.capturing = false;
    capture_state.captured_screenshots = 0;
    capture_state.elapsed_duration = 0;
    capture_state.saving = false;
    wlr_log(WLR_ERROR,"Stopping capturing sequence %d",capture_state.capturing);
    pthread_mutex_unlock(&screenshots_mutex);
}

void capture_frames(struct timespec now, struct server *server)
{
    if(capture_state.elapsed_duration >= capture_config.duration && !capture_state.saving && capture_config.duration > 0)
    {
        capture_state.capturing = false;
        capture_state.saving = true;

        wlr_log(WLR_INFO,"Capture Completed, Saving screenshots");

        pthread_t screenshot_save_thread;
        if (pthread_create(&screenshot_save_thread, NULL, save_screenshots_thread, NULL) != 0)
        {
            wlr_log(WLR_ERROR,"Failed to create screeenshot saving thread");
            return;
        }

        pthread_detach(screenshot_save_thread);
    }

    
    if(capture_state.capturing)
    {
        long seconds = now.tv_sec - last_measure_time.tv_sec;
        long nanoseconds = now.tv_nsec - last_measure_time.tv_nsec;
        long elapsed_ms = (seconds * 1000) + (nanoseconds / 1000000);
        if (elapsed_ms >= capture_config.delay)
        {
            capture_toplevels(capture_state.elapsed_duration, server);
            last_measure_time = now;
            capture_state.elapsed_duration+=500;
        }
    }
}

void capture_toplevels(long ms, struct server *server)
{
    int browser = 1;
    clock_t start_time, end_time;
    double elapsed_time = 0;
    start_time = clock();

    struct view *view;

    wl_list_for_each(view, &server->views, link) 
    {
        const char *app_id = view_get_string_prop(view, "app_id");
        const char *title = view->toplevel.handle->title;
        wlr_log(WLR_ERROR,"%s",app_id);
        wlr_log(WLR_ERROR,"%s",title);
        
        if(strcmp(app_id,"google-chrome") == 0)
        {
            struct wlr_surface *surface = view->surface;
            struct wlr_client_buffer *buffer = surface->buffer;
            struct wlr_texture *texture = buffer->texture;

            int width = texture->width;
            int height = texture->height;
            unsigned char *image = (unsigned char *)malloc(4 * width * height);

            if (!image) 
            {
                wlr_log(WLR_ERROR,"Unable to allocate memory for image");
                return;
            }

            struct wlr_texture_read_pixels_options options = {
                .data = image,
                .format = DRM_FORMAT_ABGR8888,
                .stride = width * 4,
                .dst_x = 0,
                .dst_y = 0,
                .src_box = {
                    .x = 0,
                    .y = 0,
                    .width = width,
                    .height = height
                }
            };

            if (!wlr_texture_read_pixels(texture, &options)) 
            {
                wlr_log(WLR_ERROR,"Failed to read pixels from the texture");
                free(image);
                return;
            }

            struct screenshot screenshot = {
                .image = image,
                .width = width,
                .height = height,
                .browser = browser,
                .time = ms,
                .title = title
            };

            pthread_mutex_lock(&screenshots_mutex);
            if (screenshot_count >= screenshots_capacity)
            {
                screenshots_capacity *= 2;
                screenshots = (struct screenshot *)realloc(screenshots, screenshots_capacity * sizeof(struct screenshot));
                if (!screenshots) 
                {
                    wlr_log(WLR_ERROR,"Unable to reallocate screenshots array.");
                    return;
                }
            }
            screenshots[screenshot_count++] = screenshot;
            pthread_mutex_unlock(&screenshots_mutex); 

            capture_state.captured_screenshots += 1;
            browser++;
        }
    }

    end_time = clock();
    elapsed_time = (double)(end_time - start_time) / CLOCKS_PER_SEC;

    cJSON_ReplaceItemInObject(capture_progress_object, "elapsed_duration", cJSON_CreateNumber(ms));
    cJSON_ReplaceItemInObject(capture_progress_object, "captured_screenshots", cJSON_CreateNumber(capture_state.captured_screenshots));

    char *progress = cJSON_Print(capture_progress);
    ws_emit_response(progress);
    wlr_log(WLR_INFO,"Capturing Task completed for %ld th millisecond. Elaspsed : %f ms",ms,elapsed_time);
}

char* create_path(int time, int browser, char* filename)
{
    char *output_directory = capture_config.output_directory;
    int size = strlen(output_directory) + 50;
    char *full_path = (char *)malloc(size * sizeof(char));
    if (!full_path) 
    {
        wlr_log(WLR_ERROR,"%s", "Failed to allocate memory for output path");
        return NULL;
    }
    snprintf(full_path, size, "%s/browser %d/%s-%d.png", output_directory, browser, filename, time);
    return full_path;
}

int create_directory(const char *path) 
{
    struct stat st = {0};
    if (stat(path, &st) == -1) 
    {
        if (mkdir(path, 0700) != 0) 
        {
            if (errno != EEXIST) 
            {
                fprintf(stderr, "Error creating directory %s: %s\n", path, strerror(errno));
                return -1;
            }
        }
    }

    return 0;
}

int create_directories(const char *path) {
    char temp_path[1024];
    size_t len = strlen(path);
    strncpy(temp_path, path, sizeof(temp_path));
    for (size_t i = 1; i < len; i++) {
        if (temp_path[i] == '/') 
        {
            temp_path[i] = '\0'; 
            if (strlen(temp_path) > 0) 
            {
                if (create_directory(temp_path) != 0) {
                    return -1;
                }
            }

            temp_path[i] = '/';
        }
    }

    return 0;
}

void* save_screenshots_thread(void* arg)
{
    capture_state.saving = true;
    pthread_mutex_lock(&screenshots_mutex);
    for (size_t i = 0; i < capture_state.captured_screenshots; i++)
    {
        char *path = create_path(screenshots[i].time, screenshots[i].browser, screenshots[i].title);

        if(create_directories(path) == 0)
        {
            FILE *file = fopen(path, "wb");
            if (!file) 
            {
                wlr_log(WLR_ERROR,"Failed to create image file.");
                return NULL;
            }

            png_structp png = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
            if (!png) 
            {
                wlr_log(WLR_ERROR,"Failed to create png file struct.");
                fclose(file);
                return NULL;
            }

            png_infop info = png_create_info_struct(png);
            if (!info) 
            {
                wlr_log(WLR_ERROR,"Failed to create png info struct.");
                png_destroy_write_struct(&png, NULL);
                fclose(file);
                return NULL;
            }

            if (setjmp(png_jmpbuf(png))) 
            {
                wlr_log(WLR_ERROR,"Failed to setjmp.");
                png_destroy_write_struct(&png, &info);
                fclose(file);
                return NULL;
            }

            png_init_io(png, file);
            png_set_IHDR(png, info, screenshots[i].width, screenshots[i].height, 8, PNG_COLOR_TYPE_RGBA, PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT);
            png_write_info(png, info);

            for (int y = 0; y < screenshots[i].height; y++) 
            {
                png_write_row(png, screenshots[i].image + y * screenshots[i].width * 4);
            }
            png_write_end(png, NULL);
            png_destroy_write_struct(&png, &info);
            fclose(file);
        }

        cJSON_ReplaceItemInObject(save_progress_object, "saved", cJSON_CreateNumber(i+1));
        cJSON_ReplaceItemInObject(save_progress_object, "captured", cJSON_CreateNumber(capture_state.captured_screenshots));

        char *progress = cJSON_Print(save_progress);
        ws_emit_response(progress);
        wlr_log(WLR_INFO,"Saving screenshot %zu/%.0f",i+1,capture_state.captured_screenshots);
    }

    free(screenshots);
    capture_state.saving = false;
    capture_state.captured_screenshots = 0;
    capture_state.elapsed_duration = 0;
    screenshots_capacity = SCREENSHOT_CAPACITY;
    screenshots = NULL;
    pthread_mutex_unlock(&screenshots_mutex);
    return NULL;
}