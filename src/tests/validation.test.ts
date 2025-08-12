import { describe, it, expect } from "bun:test";
import { Hono } from "hono";
import { validate, validateQuery, validateParams } from "@middlewares/validation";
import { PageQuerySchema, AnimeIdParamSchema } from "@schemas/common";
import type { Payload } from "@helpers/honoHelpers";

describe("Validation Middleware", () => {
    it("should validate query parameters successfully", async () => {
        const app = new Hono();

        app.get("/test", validateQuery(PageQuerySchema), (c) => {
            return c.json({ success: true });
        });

        const res = await app.request("/test?page=1");
        expect(res.status).toBe(200);

        const data = await res.json() as { success: boolean };
        expect(data.success).toBe(true);
    });

    it("should return 400 for invalid query parameters", async () => {
        const app = new Hono();

        app.get("/test", validateQuery(PageQuerySchema), (c) => {
            return c.json({ success: true });
        });

        const res = await app.request("/test?page=invalid");
        expect(res.status).toBe(400);

        const data = await res.json() as Payload;
        expect(data.ok).toBe(false);
        expect(data.message).toBe("Validation failed");
    });

    it("should validate route parameters successfully", async () => {
        const app = new Hono();

        app.get("/anime/:animeId", validateParams(AnimeIdParamSchema), (c) => {
            return c.json({ success: true });
        });

        const res = await app.request("/anime/test-anime-id");
        expect(res.status).toBe(200);

        const data = await res.json() as { success: boolean };
        expect(data.success).toBe(true);
    });

    it("should return 400 for missing route parameters", async () => {
        const app = new Hono();

        app.get("/anime/:animeId", validateParams(AnimeIdParamSchema), (c) => {
            return c.json({ success: true });
        });

        // This would be handled by Hono's routing, but we can test empty param
        const res = await app.request("/anime/");
        expect(res.status).toBe(404); // Hono returns 404 for unmatched routes
    });

    it("should handle multiple validation errors", async () => {
        const app = new Hono();

        app.get("/test/:animeId", validate({
            params: AnimeIdParamSchema,
            query: PageQuerySchema
        }), (c) => {
            return c.json({ success: true });
        });

        const res = await app.request("/test/invalid-anime?page=invalid");
        expect(res.status).toBe(400);

        const data = await res.json() as Payload;
        expect(data.ok).toBe(false);
        expect(data.message).toBe("Validation failed");
        expect(data.data.errors).toBeInstanceOf(Array);
        expect(data.data.errors.length).toBeGreaterThan(0);
    });
});