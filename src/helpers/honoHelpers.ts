import type { Context } from "hono";
import { setResponseError } from "./error";
import http from "http";

function setErrorMessage(key: string, validValue: string[]): string {
    return `masukkan query parameter: ?${key}=${validValue.join("|")}`;
}

export function getOrderParam(c: Context): string {
    const order = c.req.query("order");
    const orders = ["title", "title-reverse", "update", "latest", "popular"];

    if (typeof order === "string") {
        if (orders.includes(order)) {
            if (order === "title-reverse") return "titlereverse";
            return order;
        } else {
            setResponseError(400, setErrorMessage("order", orders));
            return "title"; // This won't be reached due to throw, but keeps TypeScript happy
        }
    }

    return "title";
}

export function getPageParam(c: Context): number {
    const pageQuery = c.req.query("page");
    const page = Number(pageQuery) || 1;
    const error = {
        status: 400,
        message: setErrorMessage("page", ["number +"]),
    };

    if (page < 1) {
        setResponseError(error.status, error.message);
        return 1; // This won't be reached due to throw, but keeps TypeScript happy
    }

    if (isNaN(Number(pageQuery)) && pageQuery !== undefined) {
        setResponseError(error.status, error.message);
        return 1; // This won't be reached due to throw, but keeps TypeScript happy
    }

    return page;
}

export function getQParam(c: Context): string {
    const q = c.req.query("q");

    if (q === undefined) {
        setResponseError(400, setErrorMessage("q", ["string"]));
        return ""; // This won't be reached due to throw, but keeps TypeScript happy
    }

    if (typeof q === "string") return q;

    return "";
}

export function getUrlParam(c: Context): string {
    const url = c.req.query("url");

    if (!url) {
        setResponseError(400, setErrorMessage("url", ["string"]));
        return ""; // This won't be reached due to throw, but keeps TypeScript happy
    }

    if (typeof url === "string") return url;

    return "";
}

export interface Pagination {
    currentPage?: number;
    totalPages?: number;
    hasPrevPage?: boolean;
    prevPage?: number | null;
    hasNextPage?: boolean;
    nextPage?: number | null;
}

export interface PayloadProps {
    message?: string;
    data?: any;
    pagination?: Pagination;
}

export interface Payload {
    statusCode: number;
    statusMessage: string;
    message: string;
    ok: boolean;
    data: any;
    pagination: Pagination | null;
}

export function generateHonoPayload(statusCode: number, props?: PayloadProps): Payload {
    const payload: Payload = {
        statusCode: 500,
        statusMessage: "",
        message: "",
        ok: false,
        data: null,
        pagination: null,
    };

    const isOk = (statusCode: number) => {
        const strStatusCode = statusCode.toString();

        if (strStatusCode.startsWith("4") || strStatusCode.startsWith("5")) {
            return false;
        }

        return true;
    };

    payload.statusCode = statusCode;
    payload.statusMessage = http.STATUS_CODES[statusCode] || "";
    payload.message = props?.message || "";
    payload.data = props?.data || null;
    payload.pagination = props?.pagination || null;
    payload.ok = isOk(statusCode);

    return payload;
}