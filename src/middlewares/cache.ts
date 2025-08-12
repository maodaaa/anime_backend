import type { Context, Next } from "hono";
import { type Payload } from "@helpers/payload";
import { defaultTTL, cache } from "@libs/lruCache";

/**
 * @param ttl minutes
 */
export function serverCache(ttl?: number, responseType: "json" | "text" = "json") {
  return async (c: Context, next: Next) => {
    const newTTL = ttl ? 1000 * 60 * ttl : defaultTTL;

    // Generate cache key from request path and query parameters
    const url = new URL(c.req.url);
    const key = url.pathname + (url.search || "");
    const cachedData = cache.get(key);

    if (cachedData) {
      // Cache hit - return cached data
      if (typeof cachedData === "object") {
        return c.json(cachedData);
      }

      if (typeof cachedData === "string") {
        return c.text(cachedData);
      }

      return c.text(String(cachedData));
    }

    // Cache miss - continue to next middleware and cache the response
    await next();

    // Only cache successful responses
    if (c.res.status < 399) {
      const responseClone = c.res.clone();

      if (responseType === "json") {
        try {
          const body = await responseClone.json() as Payload;
          // Only cache if it's a successful payload
          if (body && typeof body === "object" && body.ok) {
            cache.set(key, body, { ttl: newTTL });
          }
        } catch (error) {
          // If JSON parsing fails, don't cache
          console.warn("Failed to parse JSON response for caching:", error);
        }
      } else {
        try {
          const body = await responseClone.text();
          cache.set(key, body, { ttl: newTTL });
        } catch (error) {
          console.warn("Failed to parse text response for caching:", error);
        }
      }
    }
  };
}

/**
 * @param maxAge minutes - Hono version
 */
export function clientCache(maxAge?: number) {
  return async (c: Context, next: Next) => {
    await next();
    c.header("Cache-Control", `public, max-age=${maxAge ? maxAge * 60 : 60}`);
  };
}
