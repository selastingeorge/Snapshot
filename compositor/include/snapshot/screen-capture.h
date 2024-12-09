#ifndef SCREEN_CAPTURE_H
#define SCREEN_CAPTURE_H

#include "labwc.h"

#define SCREENSHOT_CAPACITY 400

struct capture_config
{
    char *output_directory;
    double duration;
    double delay;
};

struct capture_state
{
    bool capturing;
    bool saving;
    double captured_screenshots;
    double elapsed_duration;
};

struct screenshot 
{
    unsigned char *image;
    int width;
    int height;
    int browser;
    int time;
};

extern struct capture_config capture_config;
extern struct capture_state capture_state;

void init_capturing(void);
void handle_capture_screenshot(int duration, int delay, char *output_directory);
void stop_capturing(void);
void capture_frames(struct timespec now, struct server *server);
void capture_toplevels(long ms, struct server *server);
int create_directory(const char *path);
int create_directories(const char *path);
char* create_path(int time, int browser);
void* save_screenshots_thread(void* arg);

#endif