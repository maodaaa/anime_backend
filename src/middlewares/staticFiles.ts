import type { Context, Next } from "hono";
import { getMimeType } from "hono/utils/mime";
import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";

/**
 * Enhanced static file serving middleware for Hono
 * Serves files from src/public directory with proper MIME types and caching headers
 */
export function staticFileMiddleware(options: {
    root: string;
    maxAge?: number;
    index?: string[];
} = { root: "./src/public" }) {
    return async (c: Context, next: Next) => {
        const url = new URL(c.req.url);
        let filePath = decodeURIComponent(url.pathname);

        // Security: prevent directory traversal
        if (filePath.includes("..") || filePath.includes("\\")) {
            return await next();
        }

        // Remove leading slash for file system path
        if (filePath.startsWith("/")) {
            filePath = filePath.slice(1);
        }

        // Construct full file path
        const fullPath = join(options.root, filePath);

        try {
            if (!existsSync(fullPath)) {
                return await next();
            }

            // Get file stats
            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
                // If it's a directory, try to serve index files
                if (options.index) {
                    for (const indexFile of options.index) {
                        const indexPath = join(fullPath, indexFile);
                        if (existsSync(indexPath)) {
                            const indexStat = statSync(indexPath);
                            if (!indexStat.isDirectory()) {
                                return serveFile(c, indexPath, options.maxAge);
                            }
                        }
                    }
                }
                return await next();
            }

            return serveFile(c, fullPath, options.maxAge);
        } catch (error) {
            console.error(`Error serving static file ${fullPath}:`, error);
            return await next();
        }
    };
}

/**
 * Serve a file with proper headers
 */
async function serveFile(c: Context, filePath: string, maxAge?: number) {
    try {
        // Read file content
        const fileContent = readFileSync(filePath);
        const stat = statSync(filePath);

        // Get MIME type based on file extension
        const mimeType = getMimeType(filePath) || "application/octet-stream";

        // Set content type
        c.header("Content-Type", mimeType);

        // Set caching headers
        if (maxAge !== undefined) {
            c.header("Cache-Control", `public, max-age=${maxAge}`);
        } else {
            // Default cache settings based on file type
            if (mimeType.startsWith("text/css") || mimeType.startsWith("application/javascript")) {
                c.header("Cache-Control", "public, max-age=86400"); // 1 day for CSS/JS
            } else if (mimeType.startsWith("text/html")) {
                c.header("Cache-Control", "public, max-age=3600"); // 1 hour for HTML
            } else {
                c.header("Cache-Control", "public, max-age=604800"); // 1 week for other assets
            }
        }

        // Set ETag for better caching
        const etag = `"${stat.mtime.getTime()}-${stat.size}"`;
        c.header("ETag", etag);

        // Check if client has cached version
        const ifNoneMatch = c.req.header("If-None-Match");
        if (ifNoneMatch === etag) {
            return c.newResponse(null, 304);
        }

        // Set content length
        c.header("Content-Length", fileContent.length.toString());

        // Return file content
        return c.newResponse(fileContent);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        throw error;
    }
}