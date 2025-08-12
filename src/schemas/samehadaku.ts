import { z } from "zod";
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
} from "./common";

// Samehadaku-specific query schemas
export const SamehadakuSearchSchema = SearchQuerySchema.merge(PageQuerySchema);

export const SamehadakuRecentQuerySchema = PageQuerySchema;

export const SamehadakuOngoingQuerySchema = PageQuerySchema;

export const SamehadakuCompletedQuerySchema = PageQuerySchema;

export const SamehadakuPopularQuerySchema = PageQuerySchema;

export const SamehadakuMoviesQuerySchema = PageQuerySchema;

export const SamehadakuBatchesQuerySchema = PageQuerySchema;

export const SamehadakuGenreQuerySchema = GenreIdParamSchema.merge(PageQuerySchema);

export const SamehadakuWibuFileQuerySchema = UrlQuerySchema;

// Samehadaku route parameter schemas
export const SamehadakuAnimeParamSchema = AnimeIdParamSchema;

export const SamehadakuEpisodeParamSchema = EpisodeIdParamSchema;

export const SamehadakuServerParamSchema = ServerIdParamSchema;

export const SamehadakuBatchParamSchema = BatchIdParamSchema;

export const SamehadakuGenreParamSchema = GenreIdParamSchema;

// Combined schemas for specific endpoints
export const SamehadakuSearchEndpointSchema = {
    query: SamehadakuSearchSchema,
};

export const SamehadakuRecentEndpointSchema = {
    query: SamehadakuRecentQuerySchema,
};

export const SamehadakuOngoingEndpointSchema = {
    query: SamehadakuOngoingQuerySchema,
};

export const SamehadakuCompletedEndpointSchema = {
    query: SamehadakuCompletedQuerySchema,
};

export const SamehadakuPopularEndpointSchema = {
    query: SamehadakuPopularQuerySchema,
};

export const SamehadakuMoviesEndpointSchema = {
    query: SamehadakuMoviesQuerySchema,
};

export const SamehadakuBatchesEndpointSchema = {
    query: SamehadakuBatchesQuerySchema,
};

export const SamehadakuGenreEndpointSchema = {
    params: SamehadakuGenreParamSchema,
    query: PageQuerySchema,
};

export const SamehadakuAnimeEndpointSchema = {
    params: SamehadakuAnimeParamSchema,
};

export const SamehadakuEpisodeEndpointSchema = {
    params: SamehadakuEpisodeParamSchema,
};

export const SamehadakuServerEndpointSchema = {
    params: SamehadakuServerParamSchema,
};

export const SamehadakuBatchEndpointSchema = {
    params: SamehadakuBatchParamSchema,
};

export const SamehadakuWibuFileEndpointSchema = {
    query: SamehadakuWibuFileQuerySchema,
};

// Type exports
export type SamehadakuSearchQuery = z.infer<typeof SamehadakuSearchSchema>;
export type SamehadakuRecentQuery = z.infer<typeof SamehadakuRecentQuerySchema>;
export type SamehadakuOngoingQuery = z.infer<typeof SamehadakuOngoingQuerySchema>;
export type SamehadakuCompletedQuery = z.infer<typeof SamehadakuCompletedQuerySchema>;
export type SamehadakuPopularQuery = z.infer<typeof SamehadakuPopularQuerySchema>;
export type SamehadakuMoviesQuery = z.infer<typeof SamehadakuMoviesQuerySchema>;
export type SamehadakuBatchesQuery = z.infer<typeof SamehadakuBatchesQuerySchema>;
export type SamehadakuGenreQuery = z.infer<typeof SamehadakuGenreQuerySchema>;
export type SamehadakuWibuFileQuery = z.infer<typeof SamehadakuWibuFileQuerySchema>;
export type SamehadakuAnimeParam = z.infer<typeof SamehadakuAnimeParamSchema>;
export type SamehadakuEpisodeParam = z.infer<typeof SamehadakuEpisodeParamSchema>;
export type SamehadakuServerParam = z.infer<typeof SamehadakuServerParamSchema>;
export type SamehadakuBatchParam = z.infer<typeof SamehadakuBatchParamSchema>;
export type SamehadakuGenreParam = z.infer<typeof SamehadakuGenreParamSchema>;