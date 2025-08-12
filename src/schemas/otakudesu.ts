import { z } from "zod";
import {
    PageQuerySchema,
    SearchQuerySchema,
    OrderQuerySchema,
    AnimeIdParamSchema,
    EpisodeIdParamSchema,
    ServerIdParamSchema,
    BatchIdParamSchema,
    GenreIdParamSchema,
} from "./common";

// Otakudesu-specific query schemas
export const OtakudesuSearchSchema = SearchQuerySchema.merge(PageQuerySchema);

export const OtakudesuOngoingQuerySchema = PageQuerySchema;

export const OtakudesuCompletedQuerySchema = PageQuerySchema;

export const OtakudesuGenreQuerySchema = GenreIdParamSchema.merge(PageQuerySchema);

// Otakudesu route parameter schemas
export const OtakudesuAnimeParamSchema = AnimeIdParamSchema;

export const OtakudesuEpisodeParamSchema = EpisodeIdParamSchema;

export const OtakudesuServerParamSchema = ServerIdParamSchema;

export const OtakudesuBatchParamSchema = BatchIdParamSchema;

export const OtakudesuGenreParamSchema = GenreIdParamSchema;

// Combined schemas for specific endpoints
export const OtakudesuSearchEndpointSchema = {
    query: OtakudesuSearchSchema,
};

export const OtakudesuOngoingEndpointSchema = {
    query: OtakudesuOngoingQuerySchema,
};

export const OtakudesuCompletedEndpointSchema = {
    query: OtakudesuCompletedQuerySchema,
};

export const OtakudesuGenreEndpointSchema = {
    params: OtakudesuGenreParamSchema,
    query: PageQuerySchema,
};

export const OtakudesuAnimeEndpointSchema = {
    params: OtakudesuAnimeParamSchema,
};

export const OtakudesuEpisodeEndpointSchema = {
    params: OtakudesuEpisodeParamSchema,
};

export const OtakudesuServerEndpointSchema = {
    params: OtakudesuServerParamSchema,
};

export const OtakudesuBatchEndpointSchema = {
    params: OtakudesuBatchParamSchema,
};

// Type exports
export type OtakudesuSearchQuery = z.infer<typeof OtakudesuSearchSchema>;
export type OtakudesuOngoingQuery = z.infer<typeof OtakudesuOngoingQuerySchema>;
export type OtakudesuCompletedQuery = z.infer<typeof OtakudesuCompletedQuerySchema>;
export type OtakudesuGenreQuery = z.infer<typeof OtakudesuGenreQuerySchema>;
export type OtakudesuAnimeParam = z.infer<typeof OtakudesuAnimeParamSchema>;
export type OtakudesuEpisodeParam = z.infer<typeof OtakudesuEpisodeParamSchema>;
export type OtakudesuServerParam = z.infer<typeof OtakudesuServerParamSchema>;
export type OtakudesuBatchParam = z.infer<typeof OtakudesuBatchParamSchema>;
export type OtakudesuGenreParam = z.infer<typeof OtakudesuGenreParamSchema>;