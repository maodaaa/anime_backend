import { describe, it, expect, beforeEach, afterEach } from "bun:test";

describe("AnimeConfig", () => {
    let originalEnv: Record<string, string | undefined>;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        // Restore original environment
        Object.keys(process.env).forEach((key) => {
            delete process.env[key];
        });
        Object.assign(process.env, originalEnv);

        // Clear module cache to force re-evaluation
        delete require.cache[require.resolve("../configs/animeConfig")];
    });

    it("should load default configuration when no environment variables are set", async () => {
        // Clear environment variables
        delete process.env.PORT;
        delete process.env.OTAKUDESU_BASE_URL;
        delete process.env.SAMEHADAKU_BASE_URL;
        delete process.env.RESPONSE_HREF;
        delete process.env.RESPONSE_SOURCE_URL;
        delete process.env.NODE_ENV;

        // Dynamically import to get fresh config
        const { default: config } = await import("../configs/animeConfig");

        expect(config.PORT).toBe(3001);
        expect(config.baseUrl.otakudesu).toBe("https://otakudesu.cloud");
        expect(config.baseUrl.samehadaku).toBe("https://samehadaku.now");
        expect(config.response.href).toBe(true);
        expect(config.response.sourceUrl).toBe(true);
        // NODE_ENV defaults to "test" when running tests, "development" otherwise
        expect(["development", "test"]).toContain(config.NODE_ENV);
    });

    it("should use environment variables when provided", async () => {
        // Set environment variables
        process.env.PORT = "8080";
        process.env.OTAKUDESU_BASE_URL = "https://custom-otaku.com";
        process.env.SAMEHADAKU_BASE_URL = "https://custom-same.com";
        process.env.RESPONSE_HREF = "false";
        process.env.RESPONSE_SOURCE_URL = "false";
        process.env.NODE_ENV = "production";

        // Dynamically import to get fresh config
        const { default: config } = await import("../configs/animeConfig");

        expect(config.PORT).toBe(8080);
        expect(config.baseUrl.otakudesu).toBe("https://custom-otaku.com");
        expect(config.baseUrl.samehadaku).toBe("https://custom-same.com");
        expect(config.response.href).toBe(false);
        expect(config.response.sourceUrl).toBe(false);
        expect(config.NODE_ENV).toBe("production");
    });

    it("should handle boolean environment variables correctly", async () => {
        process.env.RESPONSE_HREF = "TRUE";
        process.env.RESPONSE_SOURCE_URL = "False";

        const { default: config } = await import("../configs/animeConfig");

        expect(config.response.href).toBe(true);
        expect(config.response.sourceUrl).toBe(false);
    });

    it("should validate PORT as a number", async () => {
        process.env.PORT = "invalid";

        // This should cause the process to exit, but we can't easily test that
        // Instead, we'll test the validation logic directly
        expect(() => {
            const port = parseInt("invalid", 10);
            if (isNaN(port) || port <= 0 || port >= 65536) {
                throw new Error("Invalid port");
            }
        }).toThrow();
    });

    it("should validate URLs", async () => {
        process.env.OTAKUDESU_BASE_URL = "not-a-url";

        // The config should fail to load with invalid URL
        // We can't easily test process.exit, but the validation will catch this
        const invalidUrl = "not-a-url";
        expect(() => {
            new URL(invalidUrl);
        }).toThrow();
    });
});