import { Hono } from "hono";
import { validate, validateQuery, validateParams, validateParamsAndQuery } from "@middlewares/validation";
import {
    PageQuerySchema,
    SearchQuerySchema,
    AnimeIdParamSchema,
    SearchWithPaginationSchema,
    GenreIdParamSchema
} from "@schemas/common";
import { generateHonoPayload } from "@helpers/honoHelpers";

// Example of how to use validation middleware in routes
const exampleRoute = new Hono();

// Simple query validation
exampleRoute.get("/search", validateQuery(SearchWithPaginationSchema), async (c) => {
    // At this point, we know the query parameters are valid
    const q = c.req.query("q")!; // Safe to use ! because validation passed
    const page = Number(c.req.query("page")) || 1;

    const payload = generateHonoPayload(200, {
        message: "Search successful",
        data: { query: q, page }
    });
    return c.json(payload);
});

// Simple parameter validation
exampleRoute.get("/anime/:animeId", validateParams(AnimeIdParamSchema), async (c) => {
    // At this point, we know the route parameters are valid
    const animeId = c.req.param("animeId");

    const payload = generateHonoPayload(200, {
        message: "Anime details",
        data: { animeId }
    });
    return c.json(payload);
});

// Combined parameter and query validation
exampleRoute.get("/genres/:genreId", validateParamsAndQuery(
    GenreIdParamSchema,
    PageQuerySchema
), async (c) => {
    // Both parameters and query are validated
    const genreId = c.req.param("genreId");
    const page = Number(c.req.query("page")) || 1;

    const payload = generateHonoPayload(200, {
        message: "Genre anime list",
        data: { genreId, page }
    });
    return c.json(payload);
});

// Custom validation with multiple schemas
exampleRoute.get("/custom/:animeId", validate({
    params: AnimeIdParamSchema,
    query: SearchQuerySchema.partial() // Make search optional
}), async (c) => {
    const animeId = c.req.param("animeId");
    const q = c.req.query("q"); // Optional

    const payload = generateHonoPayload(200, {
        message: "Custom endpoint",
        data: { animeId, searchQuery: q }
    });
    return c.json(payload);
});

export default exampleRoute;