import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { clientCache } from "@middlewares/cache";
import { staticFileMiddleware } from "@middlewares/staticFiles";
import { otakudesuInfo, otakudesuRoute } from "@otakudesu/index";
import { samehadakuInfo, samehadakuRoute } from "@samehadaku/index";
import mainRoute from "@routes/mainRoute";
import healthRoute from "@routes/healthRoute";
import animeConfig from "@configs/animeConfig";
import generatePayload from "@helpers/payload";

const { PORT } = animeConfig;
const app = new Hono();

// MIDDLEWARES
app.use("*", logger());
app.use("*", cors());

// Apply client cache to all routes except static files
app.use("*", async (c, next) => {
  // Skip caching for static files
  const path = c.req.path;
  if (path.startsWith("/css/") || path.startsWith("/js/") || path.startsWith("/views/") || path.startsWith("/static/")) {
    return await next();
  }
  return await clientCache(1)(c, next);
});

// RUTE SUMBER - Process API routes first
app.route(otakudesuInfo.baseUrlPath, otakudesuRoute);
app.route(samehadakuInfo.baseUrlPath, samehadakuRoute);
app.route("/health", healthRoute);

// RUTE UTAMA
app.route("/", mainRoute);

// Enhanced static file serving with proper MIME types and caching headers
// Serve CSS files from /css/* path
app.use("/css/*", staticFileMiddleware({
  root: "./src/public",
  maxAge: 86400 // 1 day cache for CSS files
}));

// Serve JavaScript files from /js/* path  
app.use("/js/*", staticFileMiddleware({
  root: "./src/public",
  maxAge: 86400 // 1 day cache for JS files
}));

// Serve HTML views from /views/* path
app.use("/views/*", staticFileMiddleware({
  root: "./src/public",
  maxAge: 3600, // 1 hour cache for HTML files
  index: ["index.html"] // Support for directory index files
}));

// Legacy static route for backward compatibility
app.use("/static/*", serveStatic({
  root: "./src/public",
  rewriteRequestPath: (path) => path.replace(/^\/static/, "")
}));

// ERROR HANDLER
app.onError((err, c) => {
  console.error("Error:", err);

  // Determine status code
  let status = 500;
  let message = "Internal Server Error";

  if (typeof (err as any).status === "number") {
    status = (err as any).status;
    message = (err as any).message || message;
  } else if (err.name === "HTTPException") {
    status = (err as any).status || 500;
    message = (err as any).message || message;
  } else if (err.message) {
    message = err.message;
  }

  // Create a mock response object for generatePayload compatibility
  const mockRes = { statusCode: status } as any;
  const payload = generatePayload(mockRes, { message });

  return c.json(payload, status as any);
});

// 404 Handler
app.notFound((c) => {
  const mockRes = { statusCode: 404 } as any;
  const payload = generatePayload(mockRes, { message: "Route not found" });
  return c.json(payload, 404 as any);
});

// Graceful shutdown handling
let isShuttingDown = false;

// Track active connections for cleanup
const activeConnections = new Set<any>();

// Graceful shutdown function
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    console.log(`Already shutting down, ignoring ${signal}`);
    return;
  }

  isShuttingDown = true;
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  // Set a timeout for forced shutdown
  const forceShutdownTimeout = setTimeout(() => {
    console.error('Graceful shutdown timeout exceeded. Forcing exit...');
    process.exit(1);
  }, 10000); // 10 seconds timeout

  try {
    // Server will be closed automatically by Bun when process exits
    console.log('Preparing to close server...');

    // Close all active connections
    if (activeConnections.size > 0) {
      console.log(`Closing ${activeConnections.size} active connections...`);
      const closePromises = Array.from(activeConnections).map(connection => {
        return new Promise<void>((resolve) => {
          if (connection && typeof connection.close === 'function') {
            connection.close(() => resolve());
          } else {
            resolve();
          }
        });
      });

      await Promise.all(closePromises);
      activeConnections.clear();
    }

    // Clear the force shutdown timeout
    clearTimeout(forceShutdownTimeout);

    console.log('Graceful shutdown completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    clearTimeout(forceShutdownTimeout);
    process.exit(1);
  }
}

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Server configuration
const serverConfig = {
  port: PORT,
  fetch: app.fetch,
  // Add connection tracking for graceful shutdown
  websocket: {
    open(ws: any) {
      activeConnections.add(ws);
    },
    close(ws: any) {
      activeConnections.delete(ws);
    },
  },
};

// Export for Bun to automatically serve
export default serverConfig;
