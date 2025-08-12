import type { Context } from "hono";
import { z } from "zod";
import { setResponseError } from "./error";
import {
    PageQuerySchema,
    SearchQuerySchema,
    OrderQuerySchema,
    UrlQuerySchema,
    AnimeIdParamSchema,
    EpisodeIdParamSchema,
    ServerIdParamSchema,
    BatchIdParamSchema,
    GenreIdParamSchema,
} from "@schemas/common";

/**
 * Validated version of getPageParam that uses Zod validation
 */
export function getValidatedPageParam(c: Context): number {
    try {
        const query = c.req.query();
        const result = PageQuerySchema.parse(query);
        return result.page;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "masukkan query parameter: ?page=number+");
        }
        throw error;
    }
}

/**
 * Validated version of getQParam that uses Zod validation
 */
export function getValidatedQParam(c: Context): string {
    try {
        const query = c.req.query();
        const result = SearchQuerySchema.parse(query);
        return result.q;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "masukkan query parameter: ?q=string");
        }
        throw error;
    }
}

/**
 * Validated version of getOrderParam that uses Zod validation
 */
export function getValidatedOrderParam(c: Context): string {
    try {
        const query = c.req.query();
        const result = OrderQuerySchema.parse(query);
        // Handle the title-reverse transformation
        return result.order === "title-reverse" ? "titlereverse" : result.order;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "masukkan query parameter: ?order=title|title-reverse|update|latest|popular");
        }
        throw error;
    }
}

/**
 * Validated version of getUrlParam that uses Zod validation
 */
export function getValidatedUrlParam(c: Context): string {
    try {
        const query = c.req.query();
        const result = UrlQuerySchema.parse(query);
        return result.url;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "masukkan query parameter: ?url=string");
        }
        throw error;
    }
}

/**
 * Validated route parameter extraction for anime ID
 */
export function getValidatedAnimeId(c: Context): string {
    try {
        const params = { animeId: c.req.param("animeId") };
        const result = AnimeIdParamSchema.parse(params);
        return result.animeId;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "Invalid anime ID parameter");
        }
        throw error;
    }
}

/**
 * Validated route parameter extraction for episode ID
 */
export function getValidatedEpisodeId(c: Context): string {
    try {
        const params = { episodeId: c.req.param("episodeId") };
        const result = EpisodeIdParamSchema.parse(params);
        return result.episodeId;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "Invalid episode ID parameter");
        }
        throw error;
    }
}

/**
 * Validated route parameter extraction for server ID
 */
export function getValidatedServerId(c: Context): string {
    try {
        const params = { serverId: c.req.param("serverId") };
        const result = ServerIdParamSchema.parse(params);
        return result.serverId;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "Invalid server ID parameter");
        }
        throw error;
    }
}

/**
 * Validated route parameter extraction for batch ID
 */
export function getValidatedBatchId(c: Context): string {
    try {
        const params = { batchId: c.req.param("batchId") };
        const result = BatchIdParamSchema.parse(params);
        return result.batchId;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "Invalid batch ID parameter");
        }
        throw error;
    }
}

/**
 * Validated route parameter extraction for genre ID
 */
export function getValidatedGenreId(c: Context): string {
    try {
        const params = { genreId: c.req.param("genreId") };
        const result = GenreIdParamSchema.parse(params);
        return result.genreId;
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "Invalid genre ID parameter");
        }
        throw error;
    }
}

/**
 * Combined validation for search endpoints (q + page)
 */
export function getValidatedSearchParams(c: Context): { q: string; page: number } {
    try {
        const query = c.req.query();
        const searchResult = SearchQuerySchema.parse(query);
        const pageResult = PageQuerySchema.parse(query);
        return {
            q: searchResult.q,
            page: pageResult.page,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "masukkan query parameter: ?q=string&page=number+");
        }
        throw error;
    }
}

/**
 * Combined validation for genre endpoints (genreId + page)
 */
export function getValidatedGenreParams(c: Context): { genreId: string; page: number } {
    try {
        const params = { genreId: c.req.param("genreId") };
        const query = c.req.query();

        const genreResult = GenreIdParamSchema.parse(params);
        const pageResult = PageQuerySchema.parse(query);

        return {
            genreId: genreResult.genreId,
            page: pageResult.page,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            setResponseError(400, "Invalid genre ID or page parameter");
        }
        throw error;
    }
}