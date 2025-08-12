# Design Document

## Overview

This design outlines the migration from Express.js/Node.js to Bun/Hono while maintaining complete API compatibility and improving performance. The migration will follow a systematic approach to convert each component while preserving existing behavior patterns, caching strategies, and API contracts.

The core architecture will shift from Express middleware patterns to Hono's context-based approach, while maintaining the same modular structure with anime source modules (otakudesu, samehadaku), shared utilities, and configuration management.

## Architecture

### High-Level Architecture Changes

```mermaid
graph TB
    subgraph "Current Express Architecture"
        A1[Express App] --> B1[CORS Middleware]
        B1 --> C1[Static Files]
        C1 --> D1[Client Cache]
        D1 --> E1[Route Handlers]
        E1 --> F1[Error Handler]
    end
    
    subgraph "New Hono Architecture"
        A2[Hono App] --> B2[CORS Middleware]
        B2 --> C2[Logger Middleware]
        C2 --> D2[Client Cache Middleware]
        D2 --> E2[Server Cache Middleware]
        E2 --> F2[Route Handlers]
        F2 --> G2[Error Handler]
    end
```

### Runtime Migration

- **From:** Node.js with Express framework
- **To:** Bun runtime with Hono framework
- **Benefits:** Faster startup, better performance, native TypeScript support
- **Compatibility:** Maintain identical API surface and behavior

### Module Structure Preservation

The existing modular structure will be preserved:
- `src/anims/otakudesu/` - Otakudesu anime source module
- `src/anims/samehadaku/` - Samehadaku anime source module  
- `src/configs/` - Configuration management
- `src/helpers/` - Utility functions
- `src/middlewares/` - Middleware functions (converted to Hono)
- `src/services/` - Business logic services
- `src/scrapers/` - Web scraping utilities

## Components and Interfaces

### 1. Application Bootstrap (src/index.ts)

**Current Express Pattern:**
```typescript
const app = express();
app.use(cors());
app.use(express.static(...));
app.listen(PORT);
```

**New Hono Pattern:**
```typescript
const app = new Hono();
app.use('*', cors());
app.use('*', logger());
app.use('*', clientCache(1));

export default {
  port: PORT,
  fetch: app.fetch,
};
```

### 2. Middleware Conversion

#### CORS Middleware
- **Express:** `app.use(cors())`
- **Hono:** `app.use('*', cors())` from `hono/middleware`

#### Client Cache Middleware
```typescript
// Hono version
export function clientCache(maxAge?: number) {
  return async (c: Context, next: Next) => {
    await next();
    c.header('Cache-Control', `public, max-age=${maxAge ? maxAge * 60 : 60}`);
  };
}
```

#### Server Cache Middleware
```typescript
// Hono version with LRU cache integration
export function serverCache(ttl?: number, responseType: "json" | "text" = "json") {
  return async (c: Context, next: Next) => {
    const key = c.req.path + (c.req.query() ? '?' + new URLSearchParams(c.req.query()).toString() : '');
    const cachedData = cache.get(key);
    
    if (cachedData) {
      return c.json(cachedData);
    }
    
    await next();
    // Cache successful responses
  };
}
```

#### Error Handler
```typescript
// Hono error handler
app.onError((err, c) => {
  const status = err.status || 500;
  return c.json(generatePayload(c, { message: err.message }), status);
});
```

### 3. Route Conversion

#### Express Route Pattern
```typescript
router.get('/endpoint/:id', (req, res, next) => {
  const { id } = req.params;
  const query = req.query;
  res.json(data);
});
```

#### Hono Route Pattern
```typescript
app.get('/endpoint/:id', async (c) => {
  const id = c.req.param('id');
  const query = c.req.query();
  return c.json(data);
});
```

### 4. Static File Serving

**Express:** `app.use(express.static(path.join(__dirname, "public")))`

**Hono:** Custom middleware for serving static files from `src/public/`
```typescript
app.use('/static/*', async (c, next) => {
  const filePath = c.req.path.replace('/static', '');
  const file = Bun.file(`./src/public${filePath}`);
  if (await file.exists()) {
    return new Response(file);
  }
  await next();
});
```

### 5. Request/Response Handling

#### Parameter Extraction
- **Express:** `req.params.id`, `req.query.search`
- **Hono:** `c.req.param('id')`, `c.req.query('search')`

#### Response Generation
- **Express:** `res.json(data)`, `res.status(404).json(error)`
- **Hono:** `c.json(data)`, `c.json(error, 404)`

## Data Models

### Configuration Model
The existing `animeConfig.ts` structure will be preserved:
```typescript
interface AnimeConfig {
  PORT: number;
  baseUrl: {
    otakudesu: string;
    samehadaku: string;
  };
  response: {
    href: boolean;
    sourceUrl: boolean;
  };
}
```

### Cache Model
LRU cache implementation will remain unchanged:
```typescript
interface CacheEntry<T> {
  value: T;
  ttl: number;
}
```

### Request Validation Models (New)
Using Zod for type-safe validation:
```typescript
const QuerySchema = z.object({
  page: z.string().optional(),
  search: z.string().optional(),
});

const ParamsSchema = z.object({
  id: z.string(),
});
```

## Error Handling

### Error Response Format
Maintain existing error response structure from `helpers/payload.ts`:
```typescript
interface ErrorResponse {
  ok: boolean;
  message: string;
  data?: any;
}
```

### Error Handling Strategy
1. **Validation Errors:** Return 400 with detailed validation messages
2. **Not Found Errors:** Return 404 with appropriate message
3. **Server Errors:** Return 500 with sanitized error message
4. **Custom Errors:** Preserve existing error status codes

### Global Error Handler
```typescript
app.onError((err, c) => {
  console.error('Error:', err);
  
  if (err instanceof z.ZodError) {
    return c.json(generatePayload(c, { 
      message: 'Validation error',
      errors: err.errors 
    }), 400);
  }
  
  const status = err.status || 500;
  return c.json(generatePayload(c, { message: err.message }), status);
});
```

## Testing Strategy

### Unit Testing
- **Framework:** Bun's built-in test runner
- **Scope:** Individual functions, utilities, parsers
- **Migration:** Convert existing tests to Bun test format

### Integration Testing
- **Approach:** Test complete request/response cycles
- **Method:** Use `app.fetch()` for testing HTTP endpoints
- **Coverage:** All API endpoints, middleware chains

### Performance Testing
- **Metrics:** Startup time, response time, memory usage
- **Comparison:** Benchmark against Express version
- **Tools:** Bun's built-in benchmarking capabilities

### Test Structure
```typescript
// Example Bun test
import { describe, it, expect } from 'bun:test';
import app from '../src/index';

describe('API Endpoints', () => {
  it('should return anime list', async () => {
    const res = await app.fetch(new Request('http://localhost/otakudesu/anime'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});
```

## Implementation Phases

### Phase 1: Core Infrastructure
1. Update package.json scripts for Bun
2. Create bunfig.toml for path aliases
3. Convert main application bootstrap
4. Implement basic Hono app structure

### Phase 2: Middleware Migration
1. Convert CORS middleware
2. Convert caching middleware (client & server)
3. Convert error handling middleware
4. Implement static file serving

### Phase 3: Route Migration
1. Convert main routes
2. Convert otakudesu routes
3. Convert samehadaku routes
4. Ensure parameter and query handling parity

### Phase 4: Validation & Testing
1. Implement Zod validation schemas
2. Add request validation middleware
3. Convert existing tests to Bun
4. Add integration tests

### Phase 5: Build & Deployment
1. Update Docker configuration
2. Update build scripts
3. Test deployment pipeline
4. Performance benchmarking

## Performance Considerations

### Startup Time Optimization
- Leverage Bun's fast startup
- Lazy load heavy dependencies
- Optimize import patterns

### Runtime Performance
- Maintain LRU cache efficiency
- Optimize middleware chain
- Use Bun's native APIs where beneficial

### Memory Management
- Monitor cache memory usage
- Implement proper cleanup
- Avoid memory leaks in long-running processes

## Security Considerations

### CORS Configuration
Maintain existing CORS policies without changes

### Input Validation
Enhance security with Zod validation schemas

### Error Information Disclosure
Sanitize error messages in production

### Static File Security
Implement proper path validation for static file serving