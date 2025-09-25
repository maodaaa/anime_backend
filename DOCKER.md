# Docker Configuration for Bun/Hono Migration

This document describes the Docker setup for the migrated Bun/Hono application.

## Overview

The application has been containerized using the official Bun Docker images, providing:
- Fast startup times with Bun runtime
- Multi-stage builds for optimized production images
- Health checks for container monitoring
- Development and production configurations

## Docker Files

### Production Configuration

- **Dockerfile**: Multi-stage production build using `oven/bun:1` and `oven/bun:1-alpine`
- **docker-compose.yaml**: Production container orchestration
- **healthcheck.js**: Container health monitoring script

### Development Configuration

- **Dockerfile.dev**: Development build with hot reload support
- **docker-compose.dev.yaml**: Development container with volume mounts

## Building and Running

### Production Build

```bash
# Build the production image
docker build -t wajik-anime-api .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Development Build

```bash
# Run development environment with hot reload
docker-compose -f docker-compose.dev.yaml up -d

# View development logs
docker-compose -f docker-compose.dev.yaml logs -f
```

## Build Process

The production Dockerfile uses a multi-stage build:

1. **Builder Stage** (`oven/bun:1`):
   - Installs all dependencies
   - Builds the TypeScript application using `bun run build:prod`
   - Minifies static assets with Gulp

2. **Runtime Stage** (`oven/bun:1-alpine`):
   - Copies built application and production dependencies
   - Installs only production dependencies
   - Sets up health checks
   - Runs the application with `bun run start`

## Environment Variables

- `NODE_ENV`: Set to `production` for production builds
- `BUN_ENV`: Set to `production` for Bun-specific optimizations
- `PORT`: Application port (default: 3001)

## Health Checks

The container includes a health check script (`healthcheck.js`) that:
- Verifies the application is responding on the configured port
- Runs every 30 seconds with a 10-second timeout
- Allows 3 retries before marking the container as unhealthy

## Testing

Use the provided test script to verify Docker functionality:

```bash
# Run comprehensive Docker tests
./docker-test.sh
```

The test script verifies:
- Docker image builds successfully
- Container starts and runs correctly
- Application endpoints are responding
- No errors in application logs
- Container restart performance

## Performance Optimizations

### Build Optimizations
- Uses `bun install --frozen-lockfile` for reproducible builds
- Multi-stage build reduces final image size
- Production build uses minified assets

### Runtime Optimizations
- Alpine-based runtime image for smaller footprint
- Bun runtime provides faster startup compared to Node.js
- Health checks ensure container reliability

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Ensure `bun.lock` file is present
   - Check that all dependencies are compatible with Bun

2. **Container Won't Start**:
   - Check logs with `docker-compose logs`
   - Verify environment variables are set correctly
   - Ensure port 3001 is not already in use

3. **Health Check Failures**:
   - Check if the application is binding to the correct port
   - Verify the health check endpoint is accessible
   - Review application startup logs

### Debugging

```bash
# Access running container shell
docker-compose exec wajik-anime-api sh

# Check container resource usage
docker stats wajik-anime-api

# Inspect container configuration
docker inspect wajik-anime-api
```

## Migration Notes

### Changes from Node.js/Express

- Base image changed from `node:20-alpine` to `oven/bun:1-alpine`
- Package manager changed from `npm` to `bun`
- Build process optimized for Bun's native TypeScript support
- Health checks adapted for Bun runtime

### Compatibility

- All existing API endpoints remain unchanged
- Static asset serving preserved
- Environment variable handling maintained
- Docker Compose configuration updated for Bun environment