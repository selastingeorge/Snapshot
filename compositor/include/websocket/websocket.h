#ifndef WEBSOCKET_H
#define WEBSOCKET_H

#include <pthread.h>
#include <libwebsockets.h>

#define WEBSOCKET_PORT 8125


extern pthread_t websocket_thread;
extern struct lws_context *context;
extern struct lws *websocket;
extern size_t length;

void init_websocket(void);
void *websocket_server_thread(void *arg);
void ws_handle_requests(char *data);
void ws_emit_response(char *data);
int websocket_callback(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len);


#endif