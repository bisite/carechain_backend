/* Pagination utils */

"use strict";

import Express from "express";

/* Max pagination. Skip pagination is slow but more user-friendly. Requires a limit */
const MAX_PAGINATION_ELEMENTS = 20000;

/**
 * Parses paginated list request.
 * @param request Request
 * @param count Max count
 */
export function makePaginated(page: number, pageSize: number, count: number): { page: number; skip: number; limit: number; page_count: number; total: number } {
    count = Math.min(count, MAX_PAGINATION_ELEMENTS);
    if (isNaN(page)) {
        page = 0;
    }
    if (isNaN(pageSize)) {
        pageSize = 1;
    }

    if (page < 0) {
        page = 0;
    }

    if (pageSize < 1) {
        pageSize = 1;
    }

    if (pageSize > 500) {
        pageSize = 500;
    }

    let totalPages = Math.floor(count / pageSize);
    if (count % pageSize > 0) {
        totalPages++;
    }

    if (totalPages <= 0) {
        totalPages = 1;
    }

    if (page >= totalPages) {
        page = totalPages - 1;
    }

    return {
        page,
        skip: page * pageSize,
        limit: pageSize,
        page_count: totalPages,
        total: count,
    };
}

export function makeMongoOrder(order, orderDir, mapping, defaultOrder) {
    const dir = (orderDir === "asc") ? 1 : -1;
    if (mapping[order]) {
        const result: any = {};
        result[mapping[order]] = dir;
        return result;
    } else {
        const result: any = {};
        result[defaultOrder] = dir;
        return result;
    }
}
