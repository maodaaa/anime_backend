import { describe, it, expect } from "bun:test";
import app from "../index";

describe("Static File Serving", () => {
    it("should serve CSS files with correct MIME type and caching headers", async () => {
        const res = await app.fetch(new Request("http://localhost/css/main.css"));

        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/css; charset=utf-8");
        expect(res.headers.get("Cache-Control")).toBe("public, max-age=86400");
        expect(res.headers.get("ETag")).toBeTruthy();

        const content = await res.text();
        expect(content).toContain("@import url");
    });

    it("should serve JavaScript files with correct MIME type and caching headers", async () => {
        const res = await app.fetch(new Request("http://localhost/js/main.js"));

        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/javascript; charset=utf-8");
        expect(res.headers.get("Cache-Control")).toBe("public, max-age=86400");
        expect(res.headers.get("ETag")).toBeTruthy();
    });

    it("should serve HTML files with correct MIME type and shorter cache duration", async () => {
        const res = await app.fetch(new Request("http://localhost/views/home.html"));

        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
        expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
        expect(res.headers.get("ETag")).toBeTruthy();

        const content = await res.text();
        expect(content).toContain("<!DOCTYPE html>");
        expect(content).toContain("Wajik Anime Api");
    });

    it("should return 304 for cached requests with matching ETag", async () => {
        // First request to get ETag
        const firstRes = await app.fetch(new Request("http://localhost/css/main.css"));
        const etag = firstRes.headers.get("ETag");

        // Second request with If-None-Match header
        const secondRes = await app.fetch(new Request("http://localhost/css/main.css", {
            headers: {
                "If-None-Match": etag!
            }
        }));

        expect(secondRes.status).toBe(304);
        expect(secondRes.headers.get("ETag")).toBe(etag);
    });

    it("should return 404 for non-existent files", async () => {
        const res = await app.fetch(new Request("http://localhost/css/nonexistent.css"));

        expect(res.status).toBe(404);
    });

    it("should prevent directory traversal attacks", async () => {
        const res = await app.fetch(new Request("http://localhost/css/../../../etc/passwd"));

        expect(res.status).toBe(404);
    });

    it("should serve files from legacy static route", async () => {
        const res = await app.fetch(new Request("http://localhost/static/css/main.css"));

        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toContain("text/css");
    });
});