import { describe, it, expect } from "bun:test";

describe("Application Startup", () => {
    it("should load configuration without errors", async () => {
        // Import the config to test it loads correctly
        const { default: config } = await import("../configs/animeConfig");

        // Verify the config has the expected structure
        expect(config).toBeDefined();
        expect(typeof config.PORT).toBe("number");
        expect(config.PORT).toBeGreaterThan(0);
        expect(config.PORT).toBeLessThan(65536);

        expect(config.baseUrl).toBeDefined();
        expect(typeof config.baseUrl.otakudesu).toBe("string");
        expect(typeof config.baseUrl.samehadaku).toBe("string");

        // Verify URLs are valid
        expect(() => new URL(config.baseUrl.otakudesu)).not.toThrow();
        expect(() => new URL(config.baseUrl.samehadaku)).not.toThrow();

        expect(config.response).toBeDefined();
        expect(typeof config.response.href).toBe("boolean");
        expect(typeof config.response.sourceUrl).toBe("boolean");

        expect(config.NODE_ENV).toBeDefined();
        expect(["development", "production", "test"]).toContain(config.NODE_ENV);
    });

    it("should be able to import the main application", async () => {
        // This tests that the main app can be imported without errors
        const app = await import("../index");

        expect(app.default).toBeDefined();
        expect(app.default.port).toBeDefined();
        expect(app.default.fetch).toBeDefined();
        expect(typeof app.default.fetch).toBe("function");
    });
});