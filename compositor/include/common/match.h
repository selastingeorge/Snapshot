/* SPDX-License-Identifier: GPL-2.0-only */
#ifndef LABWC_MATCH_H
#define LABWC_MATCH_H

#include <stdbool.h>

/**
 * match_glob() - Pattern match using '*' wildcards and '?' jokers.
 * @pattern: Pattern to match against.
 * @string: String to search.
 * Note: Comparison case-insensitive.
 */
bool match_glob(const char *pattern, const char *string);

#endif /* LABWC_MATCH_H */
