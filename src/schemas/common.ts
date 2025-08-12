import { z } from "zod";

// Common query parameter schemas
export const PageQuerySchema = z.object({
    page: z.coerce.number().int().min(1, "Page must be a positive integer").optional().default(1),
});

export const SearchQuerySchema = z.object({
    q: z.string().min(1, "Search query is required"),
});

export const OrderQuerySchema = z.object({
    order: z.enum(["title", "title-reverse", "update", "latest", "popular"]).optional().default("title"),
});

export const UrlQuerySchema = z.object({
    url: z.string().url("Valid URL is required"),
});

// Combined schemas for common patterns
export const PaginationQuerySchema = PageQuerySchema;

export const SearchWithPaginationSchema = SearchQuerySchema.merge(PageQuerySchema);

export const OrderWithPaginationSchema = OrderQuerySchema.merge(PageQuerySchema);

// Common route parameter schemas
export const IdParamSchema = z.object({
    id: z.string().min(1, "ID parameter is required"),
});

export const AnimeIdParamSchema = z.object({
    animeId: z.string().min(1, "Anime ID parameter is required"),
});

export const EpisodeIdParamSchema = z.object({
    episodeId: z.string().min(1, "Episode ID parameter is required"),
});

export const ServerIdParamSchema = z.object({
    serverId: z.string().min(1, "Server ID parameter is required"),
});

export const BatchIdParamSchema = z.object({
    batchId: z.string().min(1, "Batch ID parameter is required"),
});

export const GenreIdParamSchema = z.object({
    genreId: z.string().min(1, "Genre ID parameter is required"),
});

// Type exports for use in controllers
export type PageQuery = z.infer<typeof PageQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;
export type UrlQuery = z.infer<typeof UrlQuerySchema>;
export type SearchWithPagination = z.infer<typeof SearchWithPaginationSchema>;
export type OrderWithPagination = z.infer<typeof OrderWithPaginationSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
export type AnimeIdParam = z.infer<typeof AnimeIdParamSchema>;
export type EpisodeIdParam = z.infer<typeof EpisodeIdParamSchema>;
export type ServerIdParam = z.infer<typeof ServerIdParamSchema>;
export type BatchIdParam = z.infer<typeof BatchIdParamSchema>;
export type GenreIdParam = z.infer<typeof GenreIdParamSchema>;