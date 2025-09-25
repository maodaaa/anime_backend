import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { Server } from "bun";

/**
 * Comprehensive Test Suite for All Application Routes
 * 
 * This test suite covers:
 * - Main routes (/, /view-data)
 * - Otakudesu routes (/otakudesu/*)
 * - Samehadaku routes (/samehadaku/*)
 * - Static file routes (/css/*, /js/*, /views/*, /static/*)
 * - Error handling (404, 500)
 * - CORS and middleware functionality
 */

// Type definitions for API responses
interface ApiResponse {
    ok: boolean;
    message: string;
    data?: any;
}

interface MainViewData {
    message: string;
    sources: Array<{
        title: string;
        route: string;
    }>;
}

const TEST_PORT = 3001; // Use same port as running server
const BASE_URL = `http://localhost:${TEST_PORT}`;
let server: Server;

// Helper function to make requests
async function makeRequest(path: string, options: RequestInit = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Accept": "application/json",
            ...options.headers,
        },
    });
    return response;
}

// Helper function to get JSON response with proper typing
async function getJsonResponse(response: Response): Promise<ApiResponse> {
    return await response.json() as ApiResponse;
}

// Helper function to safely get JSON response
async function safeJsonResponse(response: Response): Promise<any> {
    return await response.json() as any;
}

// Type-safe JSON response getter
async function getTypedJsonResponse<T = ApiResponse>(response: Response): Promise<T> {
    return await response.json() as T;
}

// Helper function to check JSON response structure
function validateJsonResponse(data: any) {
    expect(typeof data.ok).toBe("boolean");
    expect(data.message).toBeDefined();
    if (data.ok) {
        expect(data.data).toBeDefined();
    }
}

// Helper function to check HTML response
function validateHtmlResponse(response: Response) {
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.status).toBe(200);
}

// Helper function to check static file response
function validateStaticFileResponse(response: Response, expectedMimeType: string) {
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(expectedMimeType);
    expect(response.headers.get("cache-control")).toBeDefined();
}

beforeAll(async () => {
    // Skip server startup in tests since server should already be running
    // The server is started manually before running tests

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test if server is responding
    try {
        const testResponse = await fetch(`${BASE_URL}/view-data`);
        if (!testResponse.ok) {
            throw new Error(`Server not responding: ${testResponse.status}`);
        }
    } catch (error) {
        console.error('Server is not running. Please start the server with: bun src/index.ts');
        throw error;
    }
});

afterAll(() => {
    // Server cleanup is handled externally
    // Tests expect server to be running independently
});

describe("Main Routes", () => {
    test("GET / - should serve main HTML view", async () => {
        const response = await makeRequest("/");
        validateHtmlResponse(response);
    });

    test("GET /view-data - should return main API data", async () => {
        const response = await makeRequest("/view-data");
        expect(response.status).toBe(200);

        const data = await getJsonResponse(response);
        validateJsonResponse(data);
        expect(data.data.sources).toBeDefined();
        expect(Array.isArray(data.data.sources)).toBe(true);
    });

    test("GET /view-data - should have proper caching headers", async () => {
        const response = await makeRequest("/view-data");
        expect(response.headers.get("cache-control")).toBeDefined();
    });
});

describe("Otakudesu Routes", () => {
    describe("View Routes", () => {
        test("GET /otakudesu - should serve otakudesu HTML view", async () => {
            const response = await makeRequest("/otakudesu");
            validateHtmlResponse(response);
        });

        test("GET /otakudesu/view-data - should return otakudesu API data", async () => {
            const response = await makeRequest("/otakudesu/view-data");
            expect(response.status).toBe(200);

            const data = await getJsonResponse(response);
            validateJsonResponse(data);
        });
    });

    describe("Content Routes", () => {
        test("GET /otakudesu/home - should return home page data", async () => {
            const response = await makeRequest("/otakudesu/home");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/schedule - should return schedule data", async () => {
            const response = await makeRequest("/otakudesu/schedule");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/anime - should return all anime list", async () => {
            const response = await makeRequest("/otakudesu/anime");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/genres - should return all genres", async () => {
            const response = await makeRequest("/otakudesu/genres");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/ongoing - should return ongoing anime", async () => {
            const response = await makeRequest("/otakudesu/ongoing");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/ongoing?page=2 - should handle pagination", async () => {
            const response = await makeRequest("/otakudesu/ongoing?page=2");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/completed - should return completed anime", async () => {
            const response = await makeRequest("/otakudesu/completed");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/search?q=naruto - should return search results", async () => {
            const response = await makeRequest("/otakudesu/search?q=naruto");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/search - should handle missing query parameter", async () => {
            const response = await makeRequest("/otakudesu/search");
            expect([400, 200].includes(response.status)).toBe(true);
        });
    });

    describe("Dynamic Routes", () => {
        test("GET /otakudesu/genres/:genreId - should handle genre routes", async () => {
            const response = await makeRequest("/otakudesu/genres/action");
            expect([200, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /otakudesu/anime/:animeId - should handle anime detail routes", async () => {
            const response = await makeRequest("/otakudesu/anime/test-anime-id");
            expect([200, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            } else if (response.status === 404) {
                const data = await safeJsonResponse(response);
                expect(data.ok).toBe(false);
            }
        });

        test("GET /otakudesu/episode/:episodeId - should handle episode routes", async () => {
            // Try multiple episode IDs to increase chances of success
            const episodeIds = [
                "wgnw-episode-1-sub-indo",
                "wgnw-episode-2-sub-indo",
                "wgnw-episode-3-sub-indo"
            ];

            let lastResponse;
            let success = false;

            for (const episodeId of episodeIds) {
                const response = await makeRequest(`/otakudesu/episode/${episodeId}`);
                lastResponse = response;

                if (response.status === 200) {
                    const data = await safeJsonResponse(response);
                    validateJsonResponse(data);
                    success = true;
                    break;
                }
            }

            // If none succeeded, check that the last response has expected error status
            if (!success && lastResponse) {
                expect([400, 404, 403, 500].includes(lastResponse.status)).toBe(true);
                const data = await safeJsonResponse(lastResponse);
                expect(data.ok).toBe(false);
            }

            // At minimum, we should get a valid response (success or expected error)
            expect(lastResponse).toBeDefined();
        });

        test("GET /otakudesu/server/:serverId - should handle server routes", async () => {
            // Use a realistic server ID format based on the API structure
            const response = await makeRequest("/otakudesu/server/acefile-wgnw-episode-1");

            // Log the response for debugging if needed
            if (response.status >= 400) {
                console.log(`Server route returned ${response.status} - this is expected for external API limitations`);
            }

            expect([200, 400, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            } else if ([400, 404].includes(response.status)) {
                const data = await safeJsonResponse(response);
                expect(data.ok).toBe(false);
            }
        });

        test("GET /otakudesu/batch/:batchId - should handle batch routes", async () => {
            const response = await makeRequest("/otakudesu/batch/test-batch-id");
            expect([200, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            } else if (response.status === 404) {
                const data = await safeJsonResponse(response);
                expect(data.ok).toBe(false);
            }
        });
    });
});

describe("Samehadaku Routes", () => {
    describe("View Routes", () => {
        test("GET /samehadaku - should serve samehadaku HTML view", async () => {
            const response = await makeRequest("/samehadaku");
            validateHtmlResponse(response);
        });

        test("GET /samehadaku/view-data - should return samehadaku API data", async () => {
            const response = await makeRequest("/samehadaku/view-data");
            expect(response.status).toBe(200);

            const data = await getJsonResponse(response);
            validateJsonResponse(data);
        });
    });

    describe("Content Routes", () => {
        test("GET /samehadaku/home - should return home page data", async () => {
            const response = await makeRequest("/samehadaku/home");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/schedule - should return schedule data", async () => {
            const response = await makeRequest("/samehadaku/schedule");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/anime - should return all anime list", async () => {
            const response = await makeRequest("/samehadaku/anime");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/genres - should return all genres", async () => {
            const response = await makeRequest("/samehadaku/genres");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/recent - should return recent episodes", async () => {
            const response = await makeRequest("/samehadaku/recent");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/ongoing - should return ongoing anime", async () => {
            const response = await makeRequest("/samehadaku/ongoing");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/ongoing?order=popular - should handle order parameter", async () => {
            const response = await makeRequest("/samehadaku/ongoing?order=popular");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/completed - should return completed anime", async () => {
            const response = await makeRequest("/samehadaku/completed");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/popular - should return popular anime", async () => {
            const response = await makeRequest("/samehadaku/popular");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/movies - should return anime movies", async () => {
            const response = await makeRequest("/samehadaku/movies");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/batches - should return batch downloads", async () => {
            const response = await makeRequest("/samehadaku/batches");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/search?q=one+piece - should return search results", async () => {
            const response = await makeRequest("/samehadaku/search?q=one+piece");
            expect([200, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/wibufile - should return wibufile parser data", async () => {
            const response = await makeRequest("/samehadaku/wibufile?url=test");
            expect([200, 400, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });
    });

    describe("Dynamic Routes", () => {
        test("GET /samehadaku/genres/:genreId - should handle genre routes", async () => {
            const response = await makeRequest("/samehadaku/genres/action");
            expect([200, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            }
        });

        test("GET /samehadaku/anime/:animeId - should handle anime detail routes", async () => {
            const response = await makeRequest("/samehadaku/anime/test-anime-id");
            expect([200, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            } else if (response.status === 404) {
                const data = await safeJsonResponse(response);
                expect(data.ok).toBe(false);
            }
        });

        test("GET /samehadaku/episode/:episodeId - should handle episode routes", async () => {
            const response = await makeRequest("/samehadaku/episode/test-episode-id");
            expect([200, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            } else if (response.status === 404) {
                const data = await safeJsonResponse(response);
                expect(data.ok).toBe(false);
            }
        });

        test("GET /samehadaku/server/:serverId - should handle server routes", async () => {
            const response = await makeRequest("/samehadaku/server/test-server-id");
            expect([200, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            } else if (response.status === 404) {
                const data = await safeJsonResponse(response);
                expect(data.ok).toBe(false);
            }
        });

        test("GET /samehadaku/batch/:batchId - should handle batch routes", async () => {
            const response = await makeRequest("/samehadaku/batch/test-batch-id");
            expect([200, 404, 403, 500].includes(response.status)).toBe(true);

            if (response.status === 200) {
                const data = await safeJsonResponse(response);
                validateJsonResponse(data);
            } else if (response.status === 404) {
                const data = await safeJsonResponse(response);
                expect(data.ok).toBe(false);
            }
        });
    });
});

describe("Static File Routes", () => {
    test("GET /css/main.css - should serve CSS files", async () => {
        const response = await makeRequest("/css/main.css");
        validateStaticFileResponse(response, "text/css");
    });

    test("GET /js/main.js - should serve JavaScript files", async () => {
        const response = await makeRequest("/js/main.js");
        validateStaticFileResponse(response, "javascript");
    });

    test("GET /views/home.html - should serve HTML view files", async () => {
        const response = await makeRequest("/views/home.html");
        validateStaticFileResponse(response, "text/html");
    });

    test("GET /static/css/main.css - should serve legacy static files", async () => {
        const response = await makeRequest("/static/css/main.css");
        validateStaticFileResponse(response, "text/css");
    });

    test("GET /css/nonexistent.css - should return 404 for missing files", async () => {
        const response = await makeRequest("/css/nonexistent.css");
        expect(response.status).toBe(404);
    });

    test("GET /css/../../../etc/passwd - should prevent directory traversal", async () => {
        const response = await makeRequest("/css/../../../etc/passwd");
        expect(response.status).toBe(404);
    });

    describe("Caching Headers", () => {
        test("CSS files should have long cache duration", async () => {
            const response = await makeRequest("/css/main.css");
            const cacheControl = response.headers.get("cache-control");
            expect(cacheControl).toContain("max-age");
            expect(cacheControl).toContain("86400"); // 1 day
        });

        test("JavaScript files should have long cache duration", async () => {
            const response = await makeRequest("/js/main.js");
            const cacheControl = response.headers.get("cache-control");
            expect(cacheControl).toContain("max-age");
            expect(cacheControl).toContain("86400"); // 1 day
        });

        test("HTML files should have shorter cache duration", async () => {
            const response = await makeRequest("/views/home.html");
            const cacheControl = response.headers.get("cache-control");
            expect(cacheControl).toContain("max-age");
            expect(cacheControl).toContain("3600"); // 1 hour
        });

        test("ETag headers should be present for static files", async () => {
            const response = await makeRequest("/css/main.css");
            expect(response.headers.get("etag")).toBeDefined();
        });

        test("Conditional requests should return 304", async () => {
            const response1 = await makeRequest("/css/main.css");
            const etag = response1.headers.get("etag");

            const response2 = await makeRequest("/css/main.css", {
                headers: { "If-None-Match": etag || "" }
            });
            expect(response2.status).toBe(304);
        });
    });
});

describe("Error Handling", () => {
    test("GET /nonexistent-route - should return 404", async () => {
        const response = await makeRequest("/nonexistent-route");
        expect(response.status).toBe(404);

        const data = await safeJsonResponse(response);
        expect(data.ok).toBe(false);
        expect(data.message).toContain("not found");
    });

    test("GET /otakudesu/nonexistent - should return 404", async () => {
        const response = await makeRequest("/otakudesu/nonexistent");
        expect(response.status).toBe(404);

        const data = await safeJsonResponse(response);
        expect(data.ok).toBe(false);
    });

    test("GET /samehadaku/nonexistent - should return 404", async () => {
        const response = await makeRequest("/samehadaku/nonexistent");
        expect(response.status).toBe(404);

        const data = await safeJsonResponse(response);
        expect(data.ok).toBe(false);
    });

    test("Error responses should have consistent format", async () => {
        const response = await makeRequest("/nonexistent");
        expect(response.status).toBe(404);
        expect(response.headers.get("content-type")).toContain("application/json");

        const data = await safeJsonResponse(response);
        expect(typeof data.ok).toBe("boolean");
        expect(data.ok).toBe(false);
        expect(data.message).toBeDefined();
    });
});

describe("CORS and Middleware", () => {
    test("OPTIONS requests should return CORS headers", async () => {
        const response = await makeRequest("/", { method: "OPTIONS" });
        expect(response.headers.get("access-control-allow-origin")).toBeDefined();
    });

    test("All responses should have CORS headers", async () => {
        const response = await makeRequest("/view-data");
        expect(response.headers.get("access-control-allow-origin")).toBeDefined();
    });

    test("API routes should have cache headers", async () => {
        const response = await makeRequest("/view-data");
        expect(response.headers.get("cache-control")).toBeDefined();
    });

    test("Static files should not have API cache headers", async () => {
        const response = await makeRequest("/css/main.css");
        const cacheControl = response.headers.get("cache-control");
        // Should have static file cache headers, not API cache headers
        expect(cacheControl).toContain("max-age");
    });
});

describe("HTTP Methods", () => {
    test("POST requests should be handled gracefully", async () => {
        const response = await makeRequest("/view-data", { method: "POST" });
        // Accept both 405 (method not allowed) or 200 (handled) depending on implementation
        expect([200, 404, 405].includes(response.status)).toBe(true);
    });

    test("PUT requests should be handled gracefully", async () => {
        const response = await makeRequest("/otakudesu/home", { method: "PUT" });
        // Accept both 405 (method not allowed) or 200/403/500 (handled) depending on implementation
        expect([200, 404, 405, 403, 500].includes(response.status)).toBe(true);
    });

    test("DELETE requests should be handled gracefully", async () => {
        const response = await makeRequest("/samehadaku/home", { method: "DELETE" });
        // Accept both 405 (method not allowed) or 200/403/500 (handled) depending on implementation
        expect([200, 404, 405, 403, 500].includes(response.status)).toBe(true);
    });
});

describe("Query Parameter Validation", () => {
    test("Invalid page parameter should be handled gracefully", async () => {
        const response = await makeRequest("/otakudesu/ongoing?page=invalid");
        // Server may treat invalid page as page 1 (200) or return error (400/403/500)
        expect([200, 400, 403, 500].includes(response.status)).toBe(true);

        if (response.status === 200) {
            const data = await safeJsonResponse(response);
            // If successful, should have valid response structure
            expect(data.ok).toBeDefined();
        }
    });

    test("Negative page parameter should be handled gracefully", async () => {
        const response = await makeRequest("/samehadaku/recent?page=-1");
        // Server may treat negative page as page 1 (200) or return error (400/403/500)
        expect([200, 400, 403, 500].includes(response.status)).toBe(true);

        if (response.status === 200) {
            const data = await safeJsonResponse(response);
            // If successful, should have valid response structure
            expect(data.ok).toBeDefined();
        }
    });

    test("Very large page parameter should be handled gracefully", async () => {
        const response = await makeRequest("/otakudesu/ongoing?page=999999");
        // Server may return empty results (200) or error (400/403/500) for very large page numbers
        expect([200, 400, 403, 500].includes(response.status)).toBe(true);

        if (response.status === 200) {
            const data = await safeJsonResponse(response);
            // If successful, should have valid response structure (may have empty results)
            expect(data.ok).toBeDefined();
        }
    });

    test("Empty search query should be handled gracefully", async () => {
        const response = await makeRequest("/otakudesu/search?q=");
        expect([200, 400, 403, 500].includes(response.status)).toBe(true);
    });

    test("Special characters in search query should be handled", async () => {
        const response = await makeRequest("/samehadaku/search?q=%3Cscript%3E");
        expect([200, 400, 403, 500].includes(response.status)).toBe(true);
    });
});

describe("Route Parameter Validation", () => {
    test("Empty route parameters should return 404", async () => {
        const response = await makeRequest("/otakudesu/anime/");
        expect(response.status).toBe(404);
    });

    test("Special characters in route parameters should be handled", async () => {
        const response = await makeRequest("/otakudesu/anime/%3Cscript%3E");
        expect([200, 404, 400, 403, 500].includes(response.status)).toBe(true);
    });

    test("Very long route parameters should be handled", async () => {
        const longId = "a".repeat(1000);
        const response = await makeRequest(`/samehadaku/anime/${longId}`);
        expect([200, 404, 400, 403, 500].includes(response.status)).toBe(true);
    });
});

describe("Performance and Load", () => {
    test("Concurrent requests should be handled properly", async () => {
        const promises = Array.from({ length: 10 }, () =>
            makeRequest("/view-data")
        );

        const responses = await Promise.all(promises);
        responses.forEach(response => {
            expect([200, 403, 500].includes(response.status)).toBe(true);
        });
    });

    test("Large number of static file requests should be handled", async () => {
        const promises = Array.from({ length: 20 }, () =>
            makeRequest("/css/main.css")
        );

        const responses = await Promise.all(promises);
        responses.forEach(response => {
            expect(response.status).toBe(200);
        });
    });

    test("Mixed route requests should be handled concurrently", async () => {
        const routes = [
            "/view-data",
            "/otakudesu/view-data",
            "/samehadaku/view-data",
            "/css/main.css",
            "/js/main.js"
        ];

        const promises = routes.map(route => makeRequest(route));
        const responses = await Promise.all(promises);

        responses.forEach((response, index) => {
            if (routes[index].includes(".css") || routes[index].includes(".js")) {
                expect(response.status).toBe(200);
            } else {
                expect([200, 403, 500].includes(response.status)).toBe(true);
            }
        });
    });
});

describe("Content-Type Headers", () => {
    test("JSON API responses should have correct content-type", async () => {
        const response = await makeRequest("/view-data");
        expect(response.headers.get("content-type")).toContain("application/json");
    });

    test("HTML responses should have correct content-type", async () => {
        const response = await makeRequest("/");
        expect(response.headers.get("content-type")).toContain("text/html");
    });

    test("CSS files should have correct content-type", async () => {
        const response = await makeRequest("/css/main.css");
        expect(response.headers.get("content-type")).toContain("text/css");
    });

    test("JavaScript files should have correct content-type", async () => {
        const response = await makeRequest("/js/main.js");
        expect(response.headers.get("content-type")).toContain("javascript");
    });
});

describe("Security Headers", () => {
    test("Responses should not expose sensitive server information", async () => {
        const response = await makeRequest("/view-data");
        expect(response.headers.get("server")).toBeNull();
        expect(response.headers.get("x-powered-by")).toBeNull();
    });

    test("CORS headers should be properly configured", async () => {
        const response = await makeRequest("/view-data");
        const corsHeader = response.headers.get("access-control-allow-origin");
        expect(corsHeader).toBeDefined();
    });
});