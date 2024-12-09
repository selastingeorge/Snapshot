
#include <wlr/util/log.h>
#include <cJSON.h>
#include <string.h>
#include "websocket/websocket.h"
#include "snapshot/screen-capture.h"

pthread_t websocket_thread;
struct lws_context *context;
struct lws *websocket;
size_t length;

struct lws_protocols protocols[] = {
    { "example-protocol", websocket_callback, 0, 4096 },
    { NULL, NULL, 0, 0 } 
};

void init_websocket(void)
{
    if (pthread_create(&websocket_thread, NULL, websocket_server_thread, NULL) != 0) 
    {
        wlr_log(WLR_ERROR,"Failed to create websocket thread");
        return;
    }
}

void *websocket_server_thread(void *arg)
{
    struct lws_context_creation_info info;
    memset(&info, 0, sizeof(info));
    info.port = WEBSOCKET_PORT;
    info.protocols = protocols;
    info.gid = -1;
    info.uid = -1;

    context = lws_create_context(&info);
    if (context == NULL) 
    {
        wlr_log(WLR_ERROR,"Failed to create websocket context");
        return NULL;
    }

    wlr_log(WLR_INFO,"Wesocket running on port %d",WEBSOCKET_PORT);

    while (1) 
    {
        lws_service(context, 1000);
    }

    lws_context_destroy(context);
    return NULL;
}

int websocket_callback(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len)
{
    switch (reason) 
    {
        case LWS_CALLBACK_ESTABLISHED:
            wlr_log(WLR_INFO,"A client has connected to the websocket");
            break;
        case LWS_CALLBACK_RECEIVE:
            websocket = wsi;
            length = len;

            char *trimmed_data = malloc(length + 1);
            if (trimmed_data == NULL) 
            {
                wlr_log(WLR_ERROR, "Memory allocation failed");
                return -1;
            }

            memcpy(trimmed_data, (char *)in, length);
            trimmed_data[length] = '\0';
            ws_handle_requests(trimmed_data);

            free(trimmed_data);
            break;
        case LWS_CALLBACK_CLOSED:
            wlr_log(WLR_INFO, "Connection Closed");
            break;
        default:
            break;
    }
    return 0;
}

void ws_handle_requests(char *data)
{
    cJSON *json = cJSON_Parse(data);
    if(json != NULL)
    {
        cJSON *type = cJSON_GetObjectItemCaseSensitive(json,"type");
        cJSON *id = cJSON_GetObjectItemCaseSensitive(json,"id");

        if(type != NULL && strcmp(type->valuestring, "request") == 0)
        {
            if(id!=NULL && strcmp(id->valuestring, "CAPTURE_SCREENSHOT") == 0)
            {
                cJSON *params = cJSON_GetObjectItemCaseSensitive(json,"params");
                if(params != NULL)
                {
                    cJSON *delay = cJSON_GetObjectItemCaseSensitive(params,"delay");
                    cJSON *duration = cJSON_GetObjectItemCaseSensitive(params,"duration");
                    cJSON *output_directory = cJSON_GetObjectItemCaseSensitive(params,"output_directory");

                    handle_capture_screenshot(duration->valueint,delay->valueint,output_directory->valuestring);

                    cJSON_free(delay);
                    cJSON_free(duration);
                    cJSON_free(output_directory);
                }
                cJSON_free(params);
            }
            else if(id!=NULL && strcmp(id->valuestring, "STOP_CAPTURE") == 0)
            {
                cJSON *response = cJSON_CreateObject();
                cJSON *type = cJSON_CreateString("response");
                cJSON *id = cJSON_CreateString("STOP_CAPTURE");
                cJSON *message = cJSON_CreateObject();
                cJSON *capture_terminated = cJSON_CreateBool(true);

                cJSON_AddItemToObject(response,"type",type);
                cJSON_AddItemToObject(response,"id",id);
                cJSON_AddItemToObject(response,"message",message);
                cJSON_AddItemToObject(message,"capture_terminated",capture_terminated);

                stop_capturing();
                char *response_json = cJSON_Print(response);
                ws_emit_response(response_json);

                cJSON_free(message);
                cJSON_free(id);
                cJSON_free(type);
                cJSON_free(response);
            }
            else if(id!=NULL && strcmp(id->valuestring, "GET_SOCKET") == 0)
            {
                cJSON *response = cJSON_CreateObject();
                cJSON *type = cJSON_CreateString("response");
                cJSON *id = cJSON_CreateString("GET_SOCKET");
                cJSON *message = cJSON_CreateObject();
                cJSON *socket = cJSON_CreateString("wayland-0");

                cJSON_AddItemToObject(response,"type",type);
                cJSON_AddItemToObject(response,"id",id);
                cJSON_AddItemToObject(response,"message",message);
                cJSON_AddItemToObject(message,"socket",socket);

                char *response_json = cJSON_Print(response);
                ws_emit_response(response_json);

                cJSON_free(message);
                cJSON_free(id);
                cJSON_free(type);
                cJSON_free(response);
            }
        }

        cJSON_free(id);
        cJSON_free(type);
    }

    cJSON_free(json);
}

void ws_emit_response(char *data)
{
    if (websocket != NULL)
    {
        size_t length = strlen(data);
        size_t buffer_size = LWS_PRE + length;
        unsigned char *buf = malloc(buffer_size);

        if (buf == NULL) 
        {
            wlr_log(WLR_ERROR, "Failed to allocate memory for WebSocket buffer");
            return;
        }

        memset(buf, 0, buffer_size);
        memcpy(&buf[LWS_PRE], data, length);

        int bytes_written = lws_write(websocket, &buf[LWS_PRE], length, LWS_WRITE_TEXT);
        if (bytes_written < 0) 
        {
            wlr_log(WLR_ERROR, "Failed to write to WebSocket with error code %d", bytes_written);
        }

        free(buf);
    }
    else
    {
        wlr_log(WLR_INFO, "No clients have been attached to the websocket");
    }
}