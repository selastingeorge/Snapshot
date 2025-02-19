#include "gtk4-layer-shell/gtk4-layer-shell.h"
#include <gtk/gtk.h>
#include <time.h>

static gboolean
update_timer(GtkLabel *label)
{
    // Get the current time
    struct timespec ts;
    clock_gettime(CLOCK_REALTIME, &ts);

    // Format the time string
    char time_str[64];
    snprintf(time_str, sizeof(time_str), "%02d:%02d:%02d.%03ld",
             (int)(ts.tv_sec / 3600) % 24,
             (int)(ts.tv_sec / 60) % 60,
             (int)(ts.tv_sec % 60),
             ts.tv_nsec / 1000000);

    // Update the label text
    gtk_label_set_text(label, time_str);

    return G_SOURCE_CONTINUE; // Continue the timeout function
}

static void
activate(GtkApplication *app, gpointer _data)
{
    (void)_data;

    // Create a normal GTK window
    GtkWindow *gtk_window = GTK_WINDOW(gtk_application_window_new(app));

    // Maximize the window completely
    gtk_window_maximize(gtk_window);

    // Initialize the window as a layer surface
    gtk_layer_init_for_window(gtk_window);

    // Set layer position to background
    gtk_layer_set_layer(gtk_window, GTK_LAYER_SHELL_LAYER_BACKGROUND);

    // Enable auto-exclusive zone for the window
    gtk_layer_auto_exclusive_zone_enable(gtk_window);

    // Ensure the window is anchored to all edges
    gtk_layer_set_anchor(gtk_window, GTK_LAYER_SHELL_EDGE_LEFT, TRUE);
    gtk_layer_set_anchor(gtk_window, GTK_LAYER_SHELL_EDGE_RIGHT, TRUE);
    gtk_layer_set_anchor(gtk_window, GTK_LAYER_SHELL_EDGE_TOP, TRUE);
    gtk_layer_set_anchor(gtk_window, GTK_LAYER_SHELL_EDGE_BOTTOM, TRUE);

    // Set all margins to 0
    gtk_layer_set_margin(gtk_window, GTK_LAYER_SHELL_EDGE_LEFT, 0);
    gtk_layer_set_margin(gtk_window, GTK_LAYER_SHELL_EDGE_RIGHT, 0);
    gtk_layer_set_margin(gtk_window, GTK_LAYER_SHELL_EDGE_TOP, 0);
    gtk_layer_set_margin(gtk_window, GTK_LAYER_SHELL_EDGE_BOTTOM, 0);

    // Create an overlay
    GtkWidget *overlay = gtk_overlay_new();

    // Load the image and set its properties to fill the entire window and crop to fit
    GdkPixbuf *pixbuf = gdk_pixbuf_new_from_file("/usr/share/backgrounds/ubuntu-wallpaper-d.png", NULL);
    if (!pixbuf) {
        g_error("Failed to load image.");
    }

    GtkWidget *image = gtk_picture_new_for_pixbuf(pixbuf);
    gtk_picture_set_content_fit(GTK_PICTURE(image), FALSE);
    
    g_object_unref(pixbuf); // Free the pixbuf after use

    gtk_widget_set_hexpand(image, TRUE); // Expand horizontally to fill the width
    gtk_widget_set_halign(image, GTK_ALIGN_FILL); // Fill horizontally
    gtk_widget_set_valign(image, GTK_ALIGN_FILL); // Fill vertically

    // Add the image to the overlay
    gtk_overlay_add_overlay(GTK_OVERLAY(overlay), image);

    // Create the timer label
    GtkWidget *timer_label = gtk_label_new("00:00:00.000");
    gtk_widget_set_halign(timer_label, GTK_ALIGN_END); // Align to the top-right corner
    gtk_widget_set_valign(timer_label, GTK_ALIGN_START); // Align to the top
    gtk_widget_set_margin_top(timer_label, 10); // Add some margin
    gtk_widget_set_margin_end(timer_label, 10);

    // Add the timer label to the overlay
    gtk_overlay_add_overlay(GTK_OVERLAY(overlay), timer_label);

    // Set up the overlay as the window's child
    gtk_window_set_child(gtk_window, overlay);

    // Show the window
    gtk_window_present(gtk_window);

    // Start the timer update function
    g_timeout_add(5, (GSourceFunc)update_timer, GTK_LABEL(timer_label));
}

int
main(int argc, char **argv)
{
    // Create a new GTK application
    GtkApplication *app = gtk_application_new("com.snapshot.desktop", G_APPLICATION_DEFAULT_FLAGS);
    g_signal_connect(app, "activate", G_CALLBACK(activate), NULL);
    
    // Run the application
    int status = g_application_run(G_APPLICATION(app), argc, argv);
    g_object_unref(app);

    return status;
}
