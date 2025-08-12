# Wajik Anime API - Detailed Project Structure

A comprehensive REST API for streaming and downloading anime with Indonesian subtitles from multiple sources.

## 📋 Project Overview

**Project Name**: wajik-anime-api  
**Version**: 1.0.0  
**Author**: wajik45  
**License**: MIT  
**Node.js**: 20 || >=22  

This is an unofficial REST API that scrapes anime content from various Indonesian anime streaming sites, providing a unified interface for accessing anime information, episodes, and download links.

## 🎯 Supported Sources

1. **Otakudesu**: https://otakudesu.cloud
2. **Samehadaku**: https://samehadaku.now

*Note: Domain URLs frequently change and can be updated in `src/configs/animeConfig.ts`*

## 📁 Root Configuration Files

### Development & Build Configuration
- **`.prettierrc`** - Code formatting rules for consistent style
- **`tsconfig.json`** - TypeScript compiler configuration with path aliases
  - Target: ES2021, CommonJS modules
  - Path aliases for clean imports (`@otakudesu/*`, `@helpers/*`, etc.)
  - Strict mode enabled for type safety
- **`gulpfile.js`** - Asset optimization pipeline
  - HTML minification with comment removal
  - CSS optimization using CSSO
  - JavaScript minification with Terser
  - Asset copying from `src/public` to `dist/public`

### Package Management
- **`package.json`** - Project dependencies and scripts
  - **Scripts**:
    - `dev`: Development server with hot reload using ts-node-dev
    - `build`: Production build (TypeScript → JavaScript + asset optimization)
    - `start`: Production server startup
  - **Dependencies**: Express.js, Axios, Cheerio, CORS, LRU-Cache
  - **DevDependencies**: TypeScript, Gulp build tools, type definitions

### Deployment Configuration
- **`Dockerfile`** - Multi-stage Docker build
  - Stage 1: Build environment with full dependencies
  - Stage 2: Production runtime with minimal footprint
  - Exposes port 3001
- **`docker-compose.yaml`** - Container orchestration
  - Automatic restart policy
  - Production environment variables
- **`vercel.json`** - Serverless deployment configuration
  - Routes all requests to compiled `dist/index.js`

### Version Control
- **`.gitignore`** - Git exclusion patterns
- **`.dockerignore`** - Docker build context exclusions

## 🏗️ Source Code Architecture (`src/`)

### 🚀 Application Entry Point
**`src/index.ts`** - Main server initialization
- Express.js server setup with CORS middleware
- Static file serving from `public/` directory
- Client-side caching middleware (1 minute default)
- Route registration for anime sources
- Global error handling middleware
- Server startup on port 3001

### 🎌 Anime Source Modules (`src/anims/`)

Each anime source follows a consistent modular structure:

#### **Otakudesu Module** (`src/anims/otakudesu/`)
```
otakudesu/
├── index.ts                    # Module exports (info + routes)
├── controllers/
│   └── otakudesuController.ts  # Request handlers & business logic
├── info/
│   └── otakudesuInfo.ts        # Source metadata & configuration
├── parsers/
│   ├── interfaces/             # TypeScript interfaces for parsed data
│   ├── OtakudesuParser.ts      # Main HTML parsing logic
│   └── OtakudesuParserExtra.ts # Additional parsing utilities
└── routes/
    └── otakudesuRoute.ts       # Express route definitions
```

#### **Samehadaku Module** (`src/anims/samehadaku/`)
- Identical structure to Otakudesu module
- Source-specific parsing logic for Samehadaku website
- Independent route handling and controllers

### ⚙️ Configuration (`src/configs/`)
**`src/configs/animeConfig.ts`** - Centralized configuration
- **Server Settings**: Port configuration (3001)
- **Base URLs**: Source website URLs (easily updatable)
- **Response Options**: 
  - `href`: Include API reference URLs (reduces response size by ~30%)
  - `sourceUrl`: Include original source URLs (reduces response size by ~40%)

### 🎮 Controllers (`src/controllers/`)
**`src/controllers/mainController.ts`** - Main application controller
- Root route handling
- API documentation endpoints
- Health check endpoints

### 🛠️ Helper Utilities (`src/helpers/`)

#### **`src/helpers/payload.ts`** - Response standardization
- **Interfaces**: `Payload`, `Pagination` for consistent API responses
- **Functions**: `generatePayload()` for uniform response formatting
- **Features**: HTTP status code handling, pagination support

#### **`src/helpers/error.ts`** - Error management
- Custom error handling utilities
- HTTP status code management
- Error response formatting

#### **`src/helpers/paramsView.ts`** - Parameter processing
- URL parameter validation and transformation
- Query parameter handling utilities

#### **`src/helpers/queryParams.ts`** - Query string processing
- Search parameter parsing
- Filter and sort parameter handling

### 🔧 Interfaces (`src/interfaces/`)
**`src/interfaces/IGlobal.ts`** - Global TypeScript definitions
- Shared type definitions across modules
- API response interfaces
- Common data structures

### 📚 Libraries (`src/libs/`)
**`src/libs/lruCache.ts`** - Caching implementation
- LRU (Least Recently Used) cache using `lru-cache` package
- Configurable TTL (Time To Live) settings
- Memory-efficient caching for API responses

### 🔄 Middleware (`src/middlewares/`)

#### **`src/middlewares/cache.ts`** - Caching strategies
- **`serverCache(ttl, responseType)`**: Server-side response caching
  - Configurable TTL in minutes
  - Support for JSON and text responses
  - LRU cache integration
- **`clientCache(maxAge)`**: Client-side cache headers
  - HTTP Cache-Control header management
  - Configurable max-age in minutes

#### **`src/middlewares/errorHandler.ts`** - Global error handling
- Centralized error processing
- HTTP error response formatting
- Error logging and monitoring

### 🌐 Public Assets (`src/public/`)
Static files served by Express.js:
- **`css/`** - Stylesheets (minified in production)
- **`js/`** - Client-side JavaScript (minified in production)  
- **`views/`** - HTML templates (minified in production)

### 🛣️ Routes (`src/routes/`)
**`src/routes/mainRoute.ts`** - Main application routes
- Root endpoint documentation
- API health checks
- Source listing endpoints

### 🕷️ Scrapers (`src/scrapers/`)
**`src/scrapers/AnimeScraper.ts`** - Base scraper class
- **Core Features**:
  - HTTP request handling with proper headers and referrers
  - Cheerio integration for HTML parsing
  - URL generation and path handling utilities
  - Data validation and error checking
- **Utility Methods**:
  - `str()`: String cleaning and trimming
  - `num()`: Number parsing with null handling
  - `generateSlug()`: URL slug extraction
  - `generateSourceUrl()`: Source URL generation
  - `generateHref()`: API reference URL generation
  - `toCamelCase()`: String case conversion
  - `enrawr()/derawr()`: Custom encoding/decoding
- **Scraping Method**: `scrape()` - Generic scraping with parser functions

### 🔌 Services (`src/services/`)
**`src/services/dataFetcher.ts`** - HTTP client utilities
- **`wajikFetch()`**: Main HTTP request function
  - Axios-based with proper User-Agent and Referer headers
  - Configurable request options
  - Response callback support
- **`getFinalUrl()`**: URL redirect resolution
  - Handles HTTP redirects
  - Returns final destination URL
- **`getFinalUrls()`**: Batch URL resolution
  - Processes multiple URLs concurrently
  - Retry mechanism with configurable attempts and delays
  - Promise.allSettled for error resilience

## 🏭 Build Output (`dist/`)

Production-ready compiled code:
- **TypeScript → JavaScript**: ES2021 target, CommonJS modules
- **Path alias resolution**: Absolute imports converted to relative
- **Asset optimization**: Minified HTML, CSS, and JavaScript
- **Source maps**: Available for debugging (configurable)

## 📦 Dependencies

### Production Dependencies
- **`express`** (^4.21.1): Web framework
- **`axios`** (^1.7.6): HTTP client
- **`cheerio`** (1.0.0-rc.12): Server-side HTML parsing
- **`cors`** (^2.8.5): Cross-origin resource sharing
- **`lru-cache`** (^11.0.1): Memory-efficient caching

### Development Dependencies
- **`typescript`** (^5.3.2): TypeScript compiler
- **`@hasura/ts-node-dev`** (^2.1.0): Development server with hot reload
- **`gulp`** + plugins: Asset optimization pipeline
- **`tsc-alias`** (^1.8.10): Path alias resolution
- **Type definitions**: @types/* packages for TypeScript support

## 🚀 API Architecture Patterns

### 1. **Modular Source Architecture**
Each anime source is completely self-contained with its own:
- Controllers for request handling
- Parsers for HTML processing  
- Routes for endpoint definitions
- Info modules for metadata

### 2. **Layered Caching Strategy**
- **Server-side**: LRU cache with configurable TTL
- **Client-side**: HTTP cache headers
- **Response optimization**: Configurable data inclusion

### 3. **Error Handling Pipeline**
- Input validation at route level
- Business logic errors in controllers
- Global error middleware for consistent responses
- HTTP status code standardization

### 4. **Scalable Scraping Framework**
- Base `AnimeScraper` class with common utilities
- Cheerio integration for reliable HTML parsing
- Request retry mechanisms with exponential backoff
- User-Agent rotation and referrer management

## 🔧 Development Workflow

### Local Development
```bash
npm run dev    # Hot reload development server
```

### Production Build
```bash
npm run build  # TypeScript compilation + asset optimization
npm start      # Production server
```

### Docker Deployment
```bash
docker-compose up -d  # Container deployment
```

### Vercel Deployment
- Automatic deployment via `vercel.json` configuration
- Serverless function deployment

## 📊 Performance Optimizations

1. **Response Size Reduction**: Configurable data inclusion (30-40% size reduction)
2. **Memory Management**: LRU cache with automatic eviction
3. **Asset Optimization**: Minified HTML, CSS, and JavaScript
4. **HTTP Caching**: Both server and client-side caching strategies
5. **Concurrent Processing**: Batch URL resolution with Promise.allSettled

## 🔒 Security Features

1. **Proper HTTP Headers**: User-Agent and Referer for legitimate requests
2. **Error Sanitization**: No sensitive information in error responses
3. **Input Validation**: Parameter validation and sanitization
4. **CORS Configuration**: Cross-origin request handling
5. **Rate Limiting Ready**: Architecture supports rate limiting middleware

This architecture provides a robust, scalable, and maintainable foundation for anime content aggregation with support for multiple sources and deployment environments.