# Use the official Bun image as a parent image for building
FROM oven/bun:1 AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and bun.lock to the working directory
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the TypeScript project using production build
RUN bun run build:prod

# Use a smaller Bun image for the runtime
FROM oven/bun:1-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/bun.lock* ./
COPY --from=builder /usr/src/app/healthcheck.js ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Expose the port the app runs on
EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bun healthcheck.js

# Command to run the application
CMD ["bun", "run", "start"]
