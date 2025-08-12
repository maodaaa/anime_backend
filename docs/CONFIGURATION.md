# Configuration Guide

## Overview

The application uses environment variables for configuration with Zod validation to ensure type safety and proper startup validation. The configuration system supports both Bun.env and process.env for compatibility.

## Environment Variables

### Server Configuration

- **PORT** (optional, default: 3001)
  - Server port number
  - Must be between 1 and 65535
  - Example: `PORT=8080`

### Anime Source URLs

- **OTAKUDESU_BASE_URL** (optional, default: "https://otakudesu.cloud")
  - Base URL for Otakudesu anime source
  - Must be a valid URL
  - Example: `OTAKUDESU_BASE_URL=https://custom-otaku.com`

- **SAMEHADAKU_BASE_URL** (optional, default: "https://samehadaku.now")
  - Base URL for Samehadaku anime source
  - Must be a valid URL
  - Example: `SAMEHADAKU_BASE_URL=https://custom-same.com`

### Response Configuration

- **RESPONSE_HREF** (optional, default: "true")
  - Include href fields in API responses
  - Set to "false" to reduce response size by up to 30%
  - Accepts: "true", "false" (case insensitive)
  - Example: `RESPONSE_HREF=false`

- **RESPONSE_SOURCE_URL** (optional, default: "true")
  - Include source URL fields in API responses
  - Set to "false" to reduce response size by up to 40%
  - Accepts: "true", "false" (case insensitive)
  - Example: `RESPONSE_SOURCE_URL=false`

### Environment

- **NODE_ENV** (optional, default: "development")
  - Application environment
  - Accepts: "development", "production", "test"
  - Example: `NODE_ENV=production`

## Configuration File

The configuration is loaded from `src/configs/animeConfig.ts` which:

1. Validates all environment variables using Zod schemas
2. Provides sensible defaults for all optional variables
3. Exits the process with error code 1 if validation fails
4. Logs configuration details in development mode
5. Exports TypeScript types for type safety

## Usage

### Setting Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
# Copy the example file
cp .env.example .env

# Edit the values as needed
nano .env
```

### Accessing Configuration

```typescript
import animeConfig from "@configs/animeConfig";

// Access configuration values
const port = animeConfig.PORT;
const otakuUrl = animeConfig.baseUrl.otakudesu;
const includeHref = animeConfig.response.href;
```

### Type Safety

The configuration exports TypeScript types:

```typescript
import animeConfig, { type AnimeConfig, type EnvConfig } from "@configs/animeConfig";

// Use the types for type safety
function useConfig(config: AnimeConfig) {
  // config is fully typed
}
```

## Validation

The system validates:

- PORT is a valid number between 1-65535
- URLs are properly formatted
- Boolean values are correctly parsed
- NODE_ENV is one of the allowed values
- All required configuration is present

If validation fails, the application will:

1. Log detailed error messages
2. Exit with code 1
3. Prevent the server from starting

## Testing

The configuration system includes comprehensive tests:

- Default value loading
- Environment variable override
- Validation error handling
- Type safety verification
- Startup integration testing

Run tests with:

```bash
bun test src/tests/animeConfig.test.ts
bun test src/tests/startup.test.ts
bun test src/tests/config-validation.test.ts
```