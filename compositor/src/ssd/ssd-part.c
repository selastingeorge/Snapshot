// SPDX-License-Identifier: GPL-2.0-only

#include <assert.h>
#include "common/list.h"
#include "common/mem.h"
#include "labwc.h"
#include "node.h"
#include "ssd-internal.h"

/* Internal helpers */
static void
ssd_button_destroy_notify(struct wl_listener *listener, void *data)
{
	struct ssd_button *button = wl_container_of(listener, button, destroy);
	wl_list_remove(&button->destroy.link);
	free(button);
}

/*
 * Create a new node_descriptor containing a link to a new ssd_button struct.
 * Both will be destroyed automatically once the scene_node they are attached
 * to is destroyed.
 */
static struct ssd_button *
ssd_button_descriptor_create(struct wlr_scene_node *node)
{
	/* Create new ssd_button */
	struct ssd_button *button = znew(*button);

	/* Let it destroy automatically when the scene node destroys */
	button->destroy.notify = ssd_button_destroy_notify;
	wl_signal_add(&node->events.destroy, &button->destroy);

	/* And finally attach the ssd_button to a node descriptor */
	node_descriptor_create(node, LAB_NODE_DESC_SSD_BUTTON, button);
	return button;
}

/* Internal API */
struct ssd_part *
add_scene_part(struct wl_list *part_list, enum ssd_part_type type)
{
	struct ssd_part *part = znew(*part);
	part->type = type;
	wl_list_append(part_list, &part->link);
	return part;
}

struct ssd_part *
add_scene_rect(struct wl_list *list, enum ssd_part_type type,
	struct wlr_scene_tree *parent, int width, int height,
	int x, int y, float color[4])
{
	/*
	 * When initialized without surface being mapped,
	 * size may be negative. Just set to 0, next call
	 * to ssd_*_update() will update the rect to use
	 * its correct size.
	 */
	width = width >= 0 ? width : 0;
	height = height >= 0 ? height : 0;

	struct ssd_part *part = add_scene_part(list, type);
	part->node = &wlr_scene_rect_create(
		parent, width, height, color)->node;
	wlr_scene_node_set_position(part->node, x, y);
	return part;
}

struct ssd_part *
add_scene_buffer(struct wl_list *list, enum ssd_part_type type,
	struct wlr_scene_tree *parent, struct wlr_buffer *buffer,
	int x, int y)
{
	struct ssd_part *part = add_scene_part(list, type);
	part->node = &wlr_scene_buffer_create(parent, buffer)->node;
	wlr_scene_node_set_position(part->node, x, y);
	return part;
}

static struct wlr_box
get_scale_box(struct wlr_buffer *buffer, double container_width,
		double container_height)
{
	struct wlr_box icon_geo = {
		.width = buffer->width,
		.height = buffer->height
	};

	/* Scale down buffer if required */
	if (icon_geo.width && icon_geo.height) {
		double scale = MIN(container_width / icon_geo.width,
			container_height / icon_geo.height);
		if (scale < 1.0f) {
			icon_geo.width = (double)icon_geo.width * scale;
			icon_geo.height = (double)icon_geo.height * scale;
		}
	}

	/* Center buffer on both axis */
	icon_geo.x = (container_width - icon_geo.width) / 2;
	icon_geo.y = (container_height - icon_geo.height) / 2;

	return icon_geo;
}

struct ssd_part *
add_scene_button(struct wl_list *part_list, enum ssd_part_type type,
		struct wlr_scene_tree *parent, struct wlr_buffer *icon_buffer,
		struct wlr_buffer *hover_buffer, int x, struct view *view)
{
	struct ssd_part *button_root = add_scene_part(part_list, type);
	parent = wlr_scene_tree_create(parent);
	button_root->node = &parent->node;
	wlr_scene_node_set_position(button_root->node, x, 0);

	/* Hitbox */
	float invisible[4] = { 0, 0, 0, 0 };
	add_scene_rect(part_list, type, parent,
		rc.theme->window_button_width, rc.theme->title_height, 0, 0,
		invisible);

	/* Icon */
	struct wlr_scene_tree *icon_tree = wlr_scene_tree_create(parent);
	struct wlr_box icon_geo = get_scale_box(icon_buffer,
		rc.theme->window_button_width, rc.theme->title_height);
	struct ssd_part *icon_part = add_scene_buffer(part_list, type,
		icon_tree, icon_buffer, icon_geo.x, icon_geo.y);

	/* Make sure big icons are scaled down if necessary */
	wlr_scene_buffer_set_dest_size(
		wlr_scene_buffer_from_node(icon_part->node),
		icon_geo.width, icon_geo.height);

	/* Hover icon */
	struct wlr_scene_tree *hover_tree = wlr_scene_tree_create(parent);
	wlr_scene_node_set_enabled(&hover_tree->node, false);
	struct wlr_box hover_geo = get_scale_box(hover_buffer,
		rc.theme->window_button_width, rc.theme->title_height);
	struct ssd_part *hover_part = add_scene_buffer(part_list, type,
		hover_tree, hover_buffer, hover_geo.x, hover_geo.y);

	/* Make sure big icons are scaled down if necessary */
	wlr_scene_buffer_set_dest_size(
		wlr_scene_buffer_from_node(hover_part->node),
		hover_geo.width, hover_geo.height);

	struct ssd_button *button = ssd_button_descriptor_create(button_root->node);
	button->type = type;
	button->view = view;
	button->normal = icon_part->node;
	button->hover = hover_part->node;
	button->toggled = NULL;
	button->toggled_hover = NULL;
	button->icon_tree = icon_tree;
	button->hover_tree = hover_tree;
	return button_root;
}

void
add_toggled_icon(struct ssd_button *button, struct wl_list *part_list,
		enum ssd_part_type type, struct wlr_buffer *icon_buffer,
		struct wlr_buffer *hover_buffer)
{
	/* Alternate icon */
	struct wlr_box icon_geo = get_scale_box(icon_buffer,
		rc.theme->window_button_width, rc.theme->title_height);

	struct ssd_part *alticon_part = add_scene_buffer(part_list, type,
		button->icon_tree, icon_buffer, icon_geo.x, icon_geo.y);

	wlr_scene_buffer_set_dest_size(
		wlr_scene_buffer_from_node(alticon_part->node),
		icon_geo.width, icon_geo.height);

	wlr_scene_node_set_enabled(alticon_part->node, false);

	struct wlr_box hover_geo = get_scale_box(hover_buffer,
		rc.theme->window_button_width, rc.theme->title_height);
	struct ssd_part *althover_part = add_scene_buffer(part_list, type,
		button->hover_tree, hover_buffer, hover_geo.x, hover_geo.y);

	wlr_scene_buffer_set_dest_size(
		wlr_scene_buffer_from_node(althover_part->node),
		hover_geo.width, hover_geo.height);

	wlr_scene_node_set_enabled(althover_part->node, false);

	button->toggled = alticon_part->node;
	button->toggled_hover = althover_part->node;
}

struct ssd_part *
ssd_get_part(struct wl_list *part_list, enum ssd_part_type type)
{
	struct ssd_part *part;
	wl_list_for_each(part, part_list, link) {
		if (part->type == type) {
			return part;
		}
	}
	return NULL;
}

void
ssd_destroy_parts(struct wl_list *list)
{
	struct ssd_part *part, *tmp;
	wl_list_for_each_reverse_safe(part, tmp, list, link) {
		if (part->node) {
			wlr_scene_node_destroy(part->node);
			part->node = NULL;
		}
		/* part->buffer will free itself along the scene_buffer node */
		part->buffer = NULL;
		wl_list_remove(&part->link);
		free(part);
	}
	assert(wl_list_empty(list));
}
