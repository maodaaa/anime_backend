import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { spawn } from "bun";

describe("Configuration Validation", () => {
    let originalEnv: Record<string, string | undefined>;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        Object.keys(process.env).forEach((key) => {
            delete process.env[key];
        });
        Object.assign(process.env, originalEnv);
    });

    it("should fail with invalid PORT", async () => {
        const proc = spawn({
            cmd: ["bun", "src/configs/animeConfig.ts"],
            env: { ...process.env, PORT: "invalid" },
            stdout: "pipe",
            stderr: "pipe",
        });

        const result = await proc.exited;
        expect(result).toBe(1); // Should exit with error code
    });

    it("should fail with invalid URL", async () => {
        const proc = spawn({
            cmd: ["bun", "src/configs/animeConfig.ts"],
            env: { ...process.env, OTAKUDESU_BASE_URL: "not-a-url" },
            stdout: "pipe",
            stderr: "pipe",
        });

        const result = await proc.exited;
        expect(result).toBe(1); // Should exit with error code
    });

    it("should fail with invalid NODE_ENV", async () => {
        const proc = spawn({
            cmd: ["bun", "src/configs/animeConfig.ts"],
            env: { ...process.env, NODE_ENV: "invalid" },
            stdout: "pipe",
            stderr: "pipe",
        });

        const result = await proc.exited;
        expect(result).toBe(1); // Should exit with error code
    });
});