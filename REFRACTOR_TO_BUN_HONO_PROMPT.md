# Refactor Prompt: Express (Node.js) ➜ Bun + Hono

You are an expert software refactoring assistant. Refactor my backend from **Express (Node.js)** to **Bun + Hono** while preserving behavior, performance, and API contracts. Use the details below from my actual repository structure to guide precise changes.

---

## Objective
- Migrate runtime from **Node.js (Express)** to **Bun + Hono**.
- Maintain **behavior parity** (routes, status codes, headers, JSON shape).
- Improve **startup time/perf** where possible using Bun/Hono idioms.
- Keep the codebase **TypeScript-first** with strict types and path aliases preserved/migrated.

---

## Repo Snapshot (from my project)
- **Project**: *wajik-anime-api*
- **Node.js**: 20 || >= 22
- **Key production deps**: express, axios, cheerio, cors, lru-cache
- **Key dev deps**: typescript, @hasura/ts-node-dev, gulp + plugins, tsc-alias
- **Scripts (current)**:
  - `dev`: ts-node-dev hot reload
  - `build`: TS → JS + asset optimization
  - `start`: run production server
- **Entry**: `src/index.ts` (Express app init, CORS, static public, client cache, routes, global error handler)
- **Architecture highlights**:
  - Sources: `src/anims/{otakudesu,samehadaku}/` (controllers, parsers, routes, info)
  - Config: `src/configs/animeConfig.ts` (server port, base URLs, response options `href`, `sourceUrl`)
  - Controllers: `src/controllers/mainController.ts` (root/docs/health)
  - Helpers: `payload.ts`, `error.ts`, `paramsView.ts`, `queryParams.ts`
  - Interfaces: `src/interfaces/IGlobal.ts`
  - Libs: `src/libs/lruCache.ts`
  - Middlewares: `src/middlewares/{cache.ts,errorHandler.ts}` (server & client cache, global error handler)
  - Public: `src/public/{css,js,views}` (minified in prod via gulp)
  - Routes: `src/routes/mainRoute.ts`
  - Scraper: `src/scrapers/AnimeScraper.ts` (axios-based, cheerio, utilities, retries, UA/referer)
  - Services: `src/services/dataFetcher.ts` (wajikFetch, getFinalUrl(s), retries)
- **Deployment**: Dockerfile, docker-compose.yaml, vercel.json
- **Build output**: `dist/` (CJS ES2021, alias resolved, minified assets)

> Assume TypeScript + path aliases are desired in the final Bun/Hono setup.

---

## Deliverables
1. **Fully working Bun + Hono app** with identical endpoints and JSON contracts.
2. **Rewritten middleware** equivalents (CORS, logging, caching, error handling).
3. **Static asset serving** and **client caching** preserved.
4. **Server-side cache** (LRU) preserved or improved under Bun.
5. **Scraping** and **HTTP utilities** working with Bun runtime (axios + cheerio, or alternatives if needed).
6. **Type-safe request validation** (prefer zod) and consistent error responses.
7. **Scripts** updated for Bun; optional `bunfig.toml` for path aliases.
8. **Docker/CI** updated to Bun images; `vercel.json` replaced or adjusted if keeping serverless.
9. **README** section with run/build/test instructions under Bun.

---

## Constraints & Non-Functional Requirements
- **Behavior parity**: no breaking API changes unless flagged.
- **Security parity**: keep headers, CORS rules, and sanitization.
- **Performance**: cold start and throughput comparable or better.
- **DX**: `bun --hot` for dev; clear error messages; strict TS.
- **No global mutable singletons** that break under Bun; prefer lazy initializers.
- **Graceful shutdown** and resource cleanup.

---

## Step-by-Step Tasks

### 1) Tooling & Runtime
- Replace npm scripts with Bun equivalents:
  - `dev`: `bun --hot src/index.ts` (or `tsx` if needed)
  - `build`: `tsc -p tsconfig.json` (or leverage Bun transpile if chosen)
  - `start`: `bun run dist/index.js`
  - `test`: `bun test` (or `vitest` if required)
- Add/adjust **bunfig.toml** for:
  - Path aliases mirroring `tsconfig.json` (e.g., `@helpers/*`, `@otakudesu/*`, etc.).
- Confirm Node core API parity. For any gaps, refactor or polyfill.

### 2) App Skeleton (Hono)
- Create `src/server.ts` (or keep `src/index.ts`) to bootstrap Hono:
  ```ts
  import { Hono } from 'hono'
  import { cors, logger } from 'hono/middleware'
  import { serve } from 'bun'
  // import { cookie } from '@hono/cookie' // if needed

  const app = new Hono()

  app.use('*', logger())
  app.use('*', cors())

  // mount routes from modules below...
  app.notFound((c) => c.json({ message: 'Route not found' }, 404))

  serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3001) })
  export default app
  ```

### 3) Routes Conversion
- Convert each Express router to Hono routers and mount via `app.route()`:
  - `src/anims/otakudesu/routes/otakudesuRoute.ts` → `src/anims/otakudesu/routes/otakudesu.hono.ts`
  - `src/anims/samehadaku/routes/samehadakuRoute.ts` → `src/anims/samehadaku/routes/samehadaku.hono.ts`
- Translate `req/res` usage to Hono `Context (c)`:
  - Params: `c.req.param('id')`
  - Query: `c.req.query('q')`, `c.req.queries()`
  - Body: `await c.req.json()`, `await c.req.formData()`
  - Reply: `c.json()`, `c.text()`, `c.html()`, `c.redirect()`, `c.header()`
- Maintain the exact status codes and response shapes used today.

### 4) Middleware Mapping
- **CORS**: `app.use('*', cors())` from `hono/middleware` to match current behavior.
- **Logger**: add `logger()`.
- **Client cache headers**: port logic from `clientCache(maxAge)` to a Hono middleware that sets `Cache-Control` headers.
- **Server-side cache**: wrap route handlers with LRU read-through using `src/libs/lruCache.ts`; expose helpers or a `serverCache(ttl, type)` style Hono middleware.
- **Global error handler**: implement Hono `app.onError()` translating thrown errors to your standardized JSON error body.

### 5) Config & Envs
- Centralize config using `Bun.env` or `process.env` (Bun supports both).
- Retain `src/configs/animeConfig.ts` semantics (port, base URLs, `href`, `sourceUrl` toggles).
- Validate envs at startup (zod schema).

### 6) Scraping & HTTP
- Keep **axios + cheerio** unless runtime issues arise.
- If axios has edge cases under Bun, consider:
  - `undici`/native `fetch` + `cheerio` (parse HTML from `await res.text()`)
- Preserve custom headers (User-Agent, Referer) and redirect resolution (`getFinalUrl(s)`).
- Keep retry logic and batching semantics.

### 7) Validation & Errors
- Add per-route request validation (prefer **zod**) and return a consistent 400 with details.
- Unify error objects to the same schema currently produced by `helpers/error.ts` and your global error middleware.

### 8) Static Assets
- Serve `src/public` (css/js/views) similarly to Express static handling.
- Option A: file responses via Bun/Hono.
- Option B: move to CDN/static host, adjust routes accordingly.

### 9) Types & Path Aliases
- Preserve strict TS settings and path aliases from `tsconfig.json`.
- Ensure aliasing works in both build-time and runtime (bunfig + tsc-alias or tsconfig paths).

### 10) Docker/CI & Deploy
- Base image: `oven/bun:latest`.
- Multi-stage Docker build:
  - Install: `bun install --ci`
  - Build TS: `bun run build`
  - Runtime: `bun run start`
- If keeping Vercel, switch to Bun runtime or a compatible serverless adapter; otherwise document new deploy flow.

### 11) Tests
- Port existing tests to `bun test` or `vitest`.
- Provide fetch-based integration tests using `app.fetch` or `unstable_dev` style utilities.

---

## File/Module-Level Mapping (Do This Explicitly)
- `src/index.ts`: replace Express bootstrap with Hono `app` + `serve`.
- `src/routes/mainRoute.ts`: convert to Hono router; mount at `/` with docs/health/source list.
- `src/middlewares/cache.ts`: export Hono middlewares:
  - `serverCache(ttl, type)`
  - `clientCache(maxAge)` setting headers via `c.header(...)`
- `src/middlewares/errorHandler.ts`: implement `app.onError()` and helper `toErrorResponse(err)`.
- `src/libs/lruCache.ts`: keep LRU instance and helpers; ensure Bun compatibility.
- `src/anims/*/routes/*.ts`: Express → Hono routers; keep controller calls identical.
- `src/controllers/*`: keep business logic; adjust function signatures if needed to accept Hono `Context` values or keep them framework-agnostic.
- `src/services/dataFetcher.ts`: verify axios/fetch works in Bun; keep retry and redirect helpers intact.
- `src/scrapers/AnimeScraper.ts`: ensure HTML parsing and helpers remain unchanged other than fetch adapter concerns.
- `src/helpers/*`: no API changes; import paths updated to new alias resolution where necessary.

---

## Example Script Block (package.json)
```json
{
  "scripts": {
    "dev": "bun --hot src/index.ts",
    "build": "tsc -p tsconfig.json && gulp build",
    "start": "bun run dist/index.js",
    "typecheck": "tsc -noEmit",
    "test": "bun test"
  }
}
```

> If you keep gulp minification for public assets, run it after `tsc`. If moving to pure Bun, replace with a Bun-friendly pipeline.

---

## Acceptance Criteria (Checklist)
- [ ] All routes migrated to Hono with parity (paths, methods, params, status codes, response bodies).
- [ ] Middlewares ported: CORS, logging, **client caching**, **server LRU caching**, **global error handler**.
- [ ] Static asset serving works or documented alternative is provided.
- [ ] Axios/Cheerio scraping paths verified under Bun; fallbacks documented if needed.
- [ ] Env/config validated on boot; port and base URLs preserved (`href`, `sourceUrl` flags).
- [ ] Graceful shutdown and error boundaries implemented.
- [ ] Scripts updated; local dev supports hot reload (`bun --hot`).
- [ ] Dockerfile updated to `oven/bun`; CI uses Bun.
- [ ] Tests pass (unit/integration).
- [ ] README updated for Bun/Hono usage and deployment.

---

## Notes for the Assistant
- Prefer **functional composition** over classes for Hono routers and middlewares.
- Avoid global shared mutation; inject services via Hono `Context` (`c.set('services', ...)` in a setup middleware).
- Keep responses minimal and stable for clients depending on size; respect `href`/`sourceUrl` toggles.
- Provide **before/after** diffs for at least 3 representative routes and one middleware (cache or error handler).

