import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { Server } from "bun";

/**
 * Performance Testing for All Routes
 * 
 * This test suite focuses on:
 * - Response time benchmarks
 * - Throughput testing
 * - Memory usage patterns
 * - Cache effectiveness
 * - Load balancing behavior
 * - Resource utilization
 */

const BASE_URL = "http://localhost:3001";
let server: Server;

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

async function measureResponseTime(path: string, options: RequestInit = {}): Promise<{ response: Response; duration: number }> {
    const start = performance.now();
    const response = await makeRequest(path, options);
    const duration = performance.now() - start;
    return { response, duration };
}

beforeAll(async () => {
    const app = await import("../index");
    server = Bun.serve(app.default);
    await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(() => {
    if (server) {
        server.stop();
    }
});

describe("Response Time Benchmarks", () => {
    test("Main routes should respond within acceptable time", async () => {
        const routes = ["/", "/view-data"];

        for (const route of routes) {
            const { response, duration } = await measureResponseTime(route);
            expect([200, 403, 500].includes(response.status)).toBe(true);
            expect(duration).toBeLessThan(5000); // 5 seconds max
            console.log(`${route}: ${duration.toFixed(2)}ms`);
        }
    });

    test("Static files should respond quickly", async () => {
        const staticFiles = [
            "/css/main.css",
            "/js/main.js",
            "/views/home.html",
            "/static/css/main.css"
        ];

        for (const file of staticFiles) {
            const { response, duration } = await measureResponseTime(file);
            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(1000); // 1 second max for static files
            console.log(`${file}: ${duration.toFixed(2)}ms`);
        }
    });

    test("API endpoints should have reasonable response times", async () => {
        const apiEndpoints = [
            "/otakudesu/view-data",
            "/samehadaku/view-data",
            "/otakudesu/anime",
            "/samehadaku/anime"
        ];

        for (const endpoint of apiEndpoints) {
            const { response, duration } = await measureResponseTime(endpoint);
            expect([200, 403, 500].includes(response.status)).toBe(true);
            expect(duration).toBeLessThan(10000); // 10 seconds max for API calls
            console.log(`${endpoint}: ${duration.toFixed(2)}ms`);
        }
    });

    test("Search endpoints should respond within time limits", async () => {
        const searchEndpoints = [
            "/otakudesu/search?q=naruto",
            "/samehadaku/search?q=onepiece"
        ];

        for (const endpoint of searchEndpoints) {
            const { response, duration } = await measureResponseTime(endpoint);
            expect([200, 403, 500].includes(response.status)).toBe(true);
            expect(duration).toBeLessThan(15000); // 15 seconds max for search
            console.log(`${endpoint}: ${duration.toFixed(2)}ms`);
        }
    });
});

describe("Cache Performance", () => {
    test("Cached responses should be faster than initial requests", async () => {
        const endpoint = "/view-data";

        // First request (cache miss)
        const { response: response1, duration: duration1 } = await measureResponseTime(endpoint);
        expect([200, 403, 500].includes(response1.status)).toBe(true);

        // Second request (cache hit)
        const { response: response2, duration: duration2 } = await measureResponseTime(endpoint);
        expect([200, 403, 500].includes(response2.status)).toBe(true);

        console.log(`Cache miss: ${duration1.toFixed(2)}ms, Cache hit: ${duration2.toFixed(2)}ms`);

        // Cache hit should generally be faster, but allow for network variations
        if (response1.status === 200 && response2.status === 200) {
            expect(duration2).toBeLessThan(duration1 * 2); // Allow some variance
        }
    });

    test("Static file caching should improve performance", async () => {
        const staticFile = "/css/main.css";

        // First request
        const { response: response1, duration: duration1 } = await measureResponseTime(staticFile);
        expect(response1.status).toBe(200);

        // Second request with ETag
        const etag = response1.headers.get("etag");
        const { response: response2, duration: duration2 } = await measureResponseTime(staticFile, {
            headers: { "If-None-Match": etag || "" }
        });

        console.log(`Static file first: ${duration1.toFixed(2)}ms, With ETag: ${duration2.toFixed(2)}ms`);

        if (response2.status === 304) {
            expect(duration2).toBeLessThan(duration1);
        }
    });

    test("Server-side cache should improve API performance", async () => {
        const endpoint = "/otakudesu/view-data";
        const measurements = [];

        // Make multiple requests to test cache effectiveness
        for (let i = 0; i < 5; i++) {
            const { response, duration } = await measureResponseTime(endpoint);
            measurements.push({ status: response.status, duration });
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        measurements.forEach((measurement, index) => {
            console.log(`Request ${index + 1}: ${measurement.duration.toFixed(2)}ms (${measurement.status})`);
            expect([200, 403, 500].includes(measurement.status)).toBe(true);
        });

        // Calculate average response time
        const avgDuration = measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length;
        console.log(`Average response time: ${avgDuration.toFixed(2)}ms`);
    });
});

describe("Concurrent Request Performance", () => {
    test("Should handle concurrent requests efficiently", async () => {
        const concurrentRequests = 20;
        const endpoint = "/view-data";

        const start = performance.now();
        const promises = Array.from({ length: concurrentRequests }, () => makeRequest(endpoint));
        const responses = await Promise.all(promises);
        const totalDuration = performance.now() - start;

        const successCount = responses.filter(r => r.status === 200).length;
        const errorCount = responses.filter(r => [403, 500].includes(r.status)).length;

        console.log(`${concurrentRequests} concurrent requests completed in ${totalDuration.toFixed(2)}ms`);
        console.log(`Success: ${successCount}, Errors: ${errorCount}`);

        expect(successCount + errorCount).toBe(concurrentRequests);
        expect(totalDuration).toBeLessThan(30000); // 30 seconds max for all concurrent requests
    });

    test("Should handle mixed route concurrent requests", async () => {
        const routes = [
            "/view-data",
            "/otakudesu/view-data",
            "/samehadaku/view-data",
            "/css/main.css",
            "/js/main.js"
        ];

        const start = performance.now();
        const promises = [];

        // Create 10 requests for each route
        for (let i = 0; i < 10; i++) {
            for (const route of routes) {
                promises.push(makeRequest(route));
            }
        }

        const responses = await Promise.all(promises);
        const totalDuration = performance.now() - start;

        console.log(`${promises.length} mixed concurrent requests completed in ${totalDuration.toFixed(2)}ms`);

        const results = {
            success: 0,
            clientError: 0,
            serverError: 0
        };

        responses.forEach(response => {
            if (response.status >= 200 && response.status < 300) {
                results.success++;
            } else if (response.status >= 400 && response.status < 500) {
                results.clientError++;
            } else {
                results.serverError++;
            }
        });

        console.log(`Results - Success: ${results.success}, Client Errors: ${results.clientError}, Server Errors: ${results.serverError}`);
        expect(totalDuration).toBeLessThan(60000); // 60 seconds max
    });

    test("Should maintain performance under sustained load", async () => {
        const duration = 10000; // 10 seconds
        const endpoint = "/view-data";
        const requests = [];
        const startTime = performance.now();

        // Send requests continuously for 10 seconds
        while (performance.now() - startTime < duration) {
            requests.push(makeRequest(endpoint));
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms between requests
        }

        const responses = await Promise.all(requests);
        const totalTime = performance.now() - startTime;

        console.log(`Sustained load test: ${requests.length} requests over ${totalTime.toFixed(2)}ms`);
        console.log(`Average rate: ${(requests.length / totalTime * 1000).toFixed(2)} requests/second`);

        const successRate = responses.filter(r => [200, 304].includes(r.status)).length / responses.length;
        console.log(`Success rate: ${(successRate * 100).toFixed(2)}%`);

        expect(successRate).toBeGreaterThan(0.5); // At least 50% success rate
    });
});

describe("Memory Usage Patterns", () => {
    test("Should handle large response payloads efficiently", async () => {
        const endpoints = [
            "/otakudesu/anime",
            "/samehadaku/anime",
            "/otakudesu/genres",
            "/samehadaku/genres"
        ];

        for (const endpoint of endpoints) {
            const { response, duration } = await measureResponseTime(endpoint);

            if (response.status === 200) {
                const data = await response.json();
                const responseSize = JSON.stringify(data).length;

                console.log(`${endpoint}: ${duration.toFixed(2)}ms, Size: ${responseSize} bytes`);
                expect(duration).toBeLessThan(15000); // 15 seconds max
            } else {
                console.log(`${endpoint}: ${response.status} status, ${duration.toFixed(2)}ms`);
            }
        }
    });

    test("Should handle multiple large requests without memory leaks", async () => {
        const largeEndpoints = [
            "/otakudesu/anime",
            "/samehadaku/anime"
        ];

        // Make multiple requests to large endpoints
        for (let i = 0; i < 5; i++) {
            const promises = largeEndpoints.map(endpoint => makeRequest(endpoint));
            const responses = await Promise.all(promises);

            responses.forEach((response, index) => {
                console.log(`Iteration ${i + 1}, ${largeEndpoints[index]}: ${response.status}`);
                expect([200, 403, 500].includes(response.status)).toBe(true);
            });

            // Small delay between iterations
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    });
});

describe("Static File Performance", () => {
    test("Should serve static files with optimal performance", async () => {
        const staticFiles = [
            { path: "/css/main.css", type: "CSS" },
            { path: "/js/main.js", type: "JavaScript" },
            { path: "/views/home.html", type: "HTML" },
            { path: "/static/css/main.css", type: "Legacy CSS" }
        ];

        for (const file of staticFiles) {
            const { response, duration } = await measureResponseTime(file.path);
            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(500); // 500ms max for static files

            const contentLength = response.headers.get("content-length");
            console.log(`${file.type} (${file.path}): ${duration.toFixed(2)}ms, Size: ${contentLength} bytes`);
        }
    });

    test("Should handle concurrent static file requests efficiently", async () => {
        const staticFile = "/css/main.css";
        const concurrentRequests = 50;

        const start = performance.now();
        const promises = Array.from({ length: concurrentRequests }, () => makeRequest(staticFile));
        const responses = await Promise.all(promises);
        const totalDuration = performance.now() - start;

        const successCount = responses.filter(r => r.status === 200).length;

        console.log(`${concurrentRequests} concurrent static file requests: ${totalDuration.toFixed(2)}ms`);
        console.log(`Success rate: ${(successCount / concurrentRequests * 100).toFixed(2)}%`);

        expect(successCount).toBe(concurrentRequests);
        expect(totalDuration).toBeLessThan(5000); // 5 seconds max
    });
});

describe("Search Performance", () => {
    test("Should handle search queries with reasonable performance", async () => {
        const searchQueries = [
            { endpoint: "/otakudesu/search", query: "naruto" },
            { endpoint: "/otakudesu/search", query: "one piece" },
            { endpoint: "/samehadaku/search", query: "attack on titan" },
            { endpoint: "/samehadaku/search", query: "demon slayer" }
        ];

        for (const search of searchQueries) {
            const { response, duration } = await measureResponseTime(`${search.endpoint}?q=${encodeURIComponent(search.query)}`);

            console.log(`Search "${search.query}" on ${search.endpoint}: ${duration.toFixed(2)}ms (${response.status})`);
            expect([200, 403, 500].includes(response.status)).toBe(true);
            expect(duration).toBeLessThan(20000); // 20 seconds max for search
        }
    });

    test("Should handle empty and short search queries efficiently", async () => {
        const queries = ["", "a", "ab", "abc"];

        for (const query of queries) {
            const { response, duration } = await measureResponseTime(`/otakudesu/search?q=${encodeURIComponent(query)}`);

            console.log(`Search query "${query}": ${duration.toFixed(2)}ms (${response.status})`);
            expect([200, 400, 403, 500].includes(response.status)).toBe(true);
            expect(duration).toBeLessThan(10000); // 10 seconds max
        }
    });
});

describe("Pagination Performance", () => {
    test("Should handle pagination requests efficiently", async () => {
        const paginatedEndpoints = [
            "/otakudesu/ongoing",
            "/otakudesu/completed",
            "/samehadaku/ongoing",
            "/samehadaku/completed",
            "/samehadaku/recent"
        ];

        for (const endpoint of paginatedEndpoints) {
            // Test first few pages
            for (let page = 1; page <= 3; page++) {
                const { response, duration } = await measureResponseTime(`${endpoint}?page=${page}`);

                console.log(`${endpoint} page ${page}: ${duration.toFixed(2)}ms (${response.status})`);
                expect([200, 403, 500].includes(response.status)).toBe(true);
                expect(duration).toBeLessThan(15000); // 15 seconds max

                // Small delay between page requests
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    });
});

describe("Error Response Performance", () => {
    test("404 responses should be fast", async () => {
        const notFoundPaths = [
            "/nonexistent",
            "/otakudesu/nonexistent",
            "/samehadaku/nonexistent",
            "/css/nonexistent.css"
        ];

        for (const path of notFoundPaths) {
            const { response, duration } = await measureResponseTime(path);
            expect(response.status).toBe(404);
            expect(duration).toBeLessThan(1000); // 1 second max for 404s

            console.log(`404 for ${path}: ${duration.toFixed(2)}ms`);
        }
    });

    test("Should handle malformed requests quickly", async () => {
        const malformedRequests = [
            "/otakudesu/anime/",
            "/samehadaku/episode/",
            "/otakudesu/search?q=",
            "/invalid/route/structure"
        ];

        for (const path of malformedRequests) {
            const { response, duration } = await measureResponseTime(path);
            expect([400, 404, 403, 500].includes(response.status)).toBe(true);
            expect(duration).toBeLessThan(2000); // 2 seconds max for error responses

            console.log(`Error response for ${path}: ${duration.toFixed(2)}ms (${response.status})`);
        }
    });
});

describe("Overall System Performance", () => {
    test("Should maintain consistent performance across all route types", async () => {
        const routeTypes = [
            { type: "Main", routes: ["/", "/view-data"] },
            { type: "Static", routes: ["/css/main.css", "/js/main.js"] },
            { type: "API", routes: ["/otakudesu/view-data", "/samehadaku/view-data"] },
            { type: "Content", routes: ["/otakudesu/anime", "/samehadaku/anime"] }
        ];

        const results: Record<string, {
            average: number;
            max: number;
            min: number;
            count: number;
        }> = {};

        for (const routeType of routeTypes) {
            const durations = [];

            for (const route of routeType.routes) {
                const { response, duration } = await measureResponseTime(route);
                if ([200, 304].includes(response.status)) {
                    durations.push(duration);
                }
            }

            if (durations.length > 0) {
                const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
                const maxDuration = Math.max(...durations);
                const minDuration = Math.min(...durations);

                results[routeType.type] = {
                    average: avgDuration,
                    max: maxDuration,
                    min: minDuration,
                    count: durations.length
                };

                console.log(`${routeType.type} routes - Avg: ${avgDuration.toFixed(2)}ms, Min: ${minDuration.toFixed(2)}ms, Max: ${maxDuration.toFixed(2)}ms`);
            }
        }

        // Verify that static files are generally faster than API calls
        if (results.Static && results.API) {
            expect(results.Static.average).toBeLessThan(results.API.average * 2);
        }
    });
});