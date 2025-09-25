# Implementation Plan

- [x] 1. Setup Bun runtime and project configuration
  - Update package.json scripts to use Bun commands (dev, build, start, test)
  - Create bunfig.toml with path aliases matching tsconfig.json paths
  - Install Hono and remove Express dependencies
  - Update tsconfig.json for Bun compatibility if needed
  - _Requirements: 1.1, 6.1, 6.2, 7.2_

- [x] 2. Create core Hono application bootstrap
  - Convert src/index.ts from Express to Hono app initialization
  - Implement Bun serve configuration with port and fetch handler
  - Add basic Hono app structure with middleware chain setup
  - _Requirements: 1.1, 1.2, 9.3_

- [x] 3. Implement Hono middleware equivalents
- [x] 3.1 Create CORS middleware
  - Convert Express cors() to Hono cors middleware
  - Ensure identical CORS policy behavior
  - _Requirements: 3.1_

- [x] 3.2 Create client cache middleware
  - Convert clientCache function from Express to Hono context-based middleware
  - Implement Cache-Control header setting using c.header()
  - Maintain identical cache duration behavior (maxAge parameter)
  - _Requirements: 3.2_

- [x] 3.3 Create server-side LRU cache middleware
  - Convert serverCache function to work with Hono Context
  - Integrate with existing src/libs/lruCache.ts
  - Implement cache key generation from request path and query parameters
  - Handle both JSON and text response caching
  - _Requirements: 3.2_

- [x] 3.4 Create global error handler
  - Implement app.onError() handler for Hono
  - Convert Express error handler logic to Hono format
  - Maintain identical error response structure using generatePayload helper
  - Handle different error types (validation, custom status, server errors)
  - _Requirements: 3.3_

- [x] 4. Implement static file serving
  - Create Hono middleware to serve files from src/public directory
  - Handle CSS, JavaScript, and HTML file serving
  - Implement proper MIME type detection and headers
  - Maintain current URL structure for static assets
  - _Requirements: 4.1, 4.3_

- [x] 5. Convert main routes to Hono
  - Convert src/routes/mainRoute.ts from Express Router to Hono
  - Update route handlers to use Hono Context (c.req, c.json, etc.)
  - Maintain identical endpoint paths and response formats
  - Integrate with existing src/controllers/mainController.ts
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Convert otakudesu anime source routes
- [x] 6.1 Convert otakudesu route definitions
  - Convert src/anims/otakudesu/routes/* from Express to Hono
  - Update parameter extraction using c.req.param() and c.req.query()
  - Maintain identical URL patterns and HTTP methods
  - _Requirements: 2.1, 2.4_

- [x] 6.2 Update otakudesu controllers for Hono
  - Modify src/anims/otakudesu/controllers/otakudesuController.ts to work with Hono Context
  - Update response handling to use c.json() instead of res.json()
  - Ensure identical response structure and status codes
  - _Requirements: 2.2, 2.3_

- [x] 7. Convert samehadaku anime source routes
- [x] 7.1 Convert samehadaku route definitions
  - Convert src/anims/samehadaku/routes/* from Express to Hono
  - Update parameter and query handling for Hono Context
  - Preserve exact URL patterns and HTTP methods
  - _Requirements: 2.1, 2.4_

- [x] 7.2 Update samehadaku controllers for Hono
  - Modify src/anims/samehadaku/controllers/samehadakuController.ts for Hono Context
  - Convert response handling to Hono format
  - Maintain identical API behavior and response structure
  - _Requirements: 2.2, 2.3_

- [x] 8. Implement request validation with Zod
- [x] 8.1 Create Zod validation schemas
  - Define schemas for common request patterns (query parameters, route params)
  - Create validation schemas for anime-specific endpoints
  - _Requirements: 8.1, 8.2_

- [x] 8.2 Create validation middleware
  - Implement Hono middleware for request validation using Zod schemas
  - Handle validation errors with 400 status and detailed error messages
  - Integrate with existing error response format from helpers/error.ts
  - _Requirements: 8.1, 8.3_

- [x] 9. Update configuration and environment handling
  - Verify src/configs/animeConfig.ts works with Bun runtime
  - Implement environment variable validation using Zod schemas
  - Add startup validation for required configuration values
  - Maintain existing PORT, baseUrl, and response flag behavior
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 10. Verify web scraping compatibility
  - Test axios functionality with Bun runtime in src/services/dataFetcher.ts
  - Verify cheerio HTML parsing works in src/scrapers/AnimeScraper.ts
  - Test existing retry logic and redirect handling (getFinalUrl functions)
  - Implement fallback to undici or native fetch if axios issues occur
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 11. Update build and development scripts
  - Test bun --hot for development hot reload
  - Verify TypeScript compilation works with Bun
  - Update gulp build process for static asset minification
  - Ensure tsc-alias path resolution works or implement Bun alternative
  - _Requirements: 6.3, 7.2_

- [x] 12. Implement graceful shutdown and process signal handling
  - Add SIGTERM and SIGINT signal handlers to src/index.ts
  - Implement graceful server shutdown with connection cleanup
  - Add timeout for forced shutdown if cleanup takes too long
  - Test signal handling works correctly in both development and production
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 13. Convert tests to Bun test framework
  - Update existing tests to use Bun's built-in test runner
  - Create integration tests using app.fetch() for HTTP endpoint testing
  - Test all converted routes and middleware for behavior parity
  - Add performance benchmarks comparing Express vs Hono response times
  - _Requirements: 7.4_

- [x] 14. Update Docker configuration
  - Update Dockerfile to use oven/bun base image
  - Modify docker-compose.yaml for Bun runtime
  - Update multi-stage build process (bun install, bun run build, bun run start)
  - Test containerized application startup and functionality
  - _Requirements: 7.1_

- [ ] 15. Final integration and testing
  - Run comprehensive API testing to verify identical behavior
  - Test all anime source endpoints (otakudesu, samehadaku)
  - Verify caching behavior (both client and server-side)
  - Test static file serving and asset loading
  - Validate error handling and response formats
  - _Requirements: 1.2, 2.3, 3.2, 4.2_