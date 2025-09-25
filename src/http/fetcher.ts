import { setTimeout as delay } from "timers/promises";
import { limit } from "./rateLimiter";
import { FetchFailedError, ScraperError } from "./errors";
import { recordScrapeFailure } from "./scrapeMetrics";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.128 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
];

const ACCEPT_LANGUAGES = [
  "en-US,en;q=0.9,id;q=0.8",
  "en-GB,en;q=0.9,id;q=0.8",
  "en-US,en;q=0.8,ja;q=0.6",
];

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

const RETRY_STATUS = new Set([403, 429, 500, 502, 503, 504]);

const cookieJar = new Map<string, Map<string, string>>();
const uaState = new Map<string, number>();

function chooseUserAgent(host: string): string {
  const nextIndex = uaState.get(host) ?? Math.floor(Math.random() * USER_AGENTS.length);
  const ua = USER_AGENTS[nextIndex % USER_AGENTS.length];
  uaState.set(host, (nextIndex + 1) % USER_AGENTS.length);
  return ua;
}

function buildCookieHeader(host: string, override?: string): string | undefined {
  const stored = cookieJar.get(host) ?? new Map();
  if (!override && stored.size === 0) return undefined;

  const cookieMap = new Map<string, string>();

  const append = (cookieString: string) => {
    cookieString
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const [name, ...rest] = part.split("=");
        if (!name) return;
        cookieMap.set(name, rest.join("=") ?? "");
      });
  };

  stored.forEach((value, key) => cookieMap.set(key, value));
  if (override) append(override);

  if (cookieMap.size === 0) return undefined;

  return Array.from(cookieMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

function storeCookies(host: string, response: Response): void {
  const rawSetCookie = (response.headers as any).getSetCookie?.() as string[] | undefined;
  const fallback = response.headers.get("set-cookie");
  const cookies: string[] = [];

  if (rawSetCookie && Array.isArray(rawSetCookie)) {
    cookies.push(...rawSetCookie);
  } else if (typeof rawSetCookie === "string") {
    cookies.push(rawSetCookie);
  }

  if (fallback) {
    const parts = fallback.split(/,(?=[^;]+?=)/g);
    cookies.push(...parts);
  }

  if (!cookies.length) return;

  const store = cookieJar.get(host) ?? new Map<string, string>();

  for (const cookie of cookies) {
    const [pair] = cookie.split(";");
    if (!pair) continue;
    const [name, ...rest] = pair.trim().split("=");
    if (!name) continue;
    store.set(name, rest.join("=") ?? "");
  }

  cookieJar.set(host, store);
}

export type FetchRequestOptions = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  cookies?: string;
  site?: string;
  maxRetries?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  rps?: number;
  burst?: number;
};

export async function fetchResponse({
  url,
  method = "GET",
  headers = {},
  body = null,
  cookies,
  site,
  maxRetries = 3,
  timeoutMs = 25000,
  signal,
  rps,
  burst,
}: FetchRequestOptions): Promise<Response> {
  const urlObject = new URL(url);
  const host = urlObject.host;
  const siteKey = site ?? host;
  let attempt = 0;

  while (true) {
    attempt += 1;

    await limit({ host, rps, burst });

    const attemptController = new AbortController();
    const timeout = setTimeout(() => attemptController.abort(new DOMException("Request timed out", "AbortError")), timeoutMs);

    const abortListener = () => {
      attemptController.abort(signal?.reason as any);
    };

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeout);
        throw new ScraperError("Request aborted", { site: siteKey, url });
      }
      signal.addEventListener("abort", abortListener, { once: true });
    }

    const finalHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      "User-Agent": headers["User-Agent"] ?? chooseUserAgent(host),
      "Accept-Language": headers["Accept-Language"] ?? ACCEPT_LANGUAGES[attempt % ACCEPT_LANGUAGES.length],
      Referer: headers["Referer"] ?? `${urlObject.origin}/`,
      ...headers,
    };

    const cookieHeader = buildCookieHeader(host, cookies);
    if (cookieHeader) {
      finalHeaders.Cookie = cookieHeader;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body,
        redirect: "follow",
        signal: attemptController.signal,
      });

      clearTimeout(timeout);
      if (signal) {
        signal.removeEventListener("abort", abortListener);
      }

      if (RETRY_STATUS.has(response.status) && attempt <= maxRetries) {
        const wait = 500 * Math.pow(2, attempt - 1) + Math.random() * 250;
        await delay(wait);
        continue;
      }

      if (!response.ok) {
        const message = `Fetch failed with status ${response.status}`;
        const error = new FetchFailedError(message, attempt, {
          status: response.status,
          url,
          site: siteKey,
        });
        recordScrapeFailure(siteKey, { status: response.status, message, url });
        throw error;
      }

      storeCookies(host, response);
      return response;
    } catch (error: any) {
      clearTimeout(timeout);
      if (signal) {
        signal.removeEventListener("abort", abortListener);
      }

      const status = typeof error?.status === "number" ? error.status : undefined;

      if (error?.name === "AbortError" && attempt <= maxRetries) {
        const wait = 300 * Math.pow(2, attempt - 1) + Math.random() * 150;
        await delay(wait);
        continue;
      }

      if (attempt <= maxRetries && (error instanceof FetchFailedError || RETRY_STATUS.has(status ?? 0))) {
        const wait = 600 * Math.pow(2, attempt - 1) + Math.random() * 400;
        await delay(wait);
        continue;
      }

      const message = error instanceof Error ? error.message : "Unknown fetch error";
      recordScrapeFailure(siteKey, { status, message, url });
      throw new ScraperError(message, { status, site: siteKey, url, cause: error });
    }
  }
}

export async function fetchHtml(options: FetchRequestOptions): Promise<string> {
  const response = await fetchResponse(options);
  const clone = response.clone();
  return await clone.text();
}
