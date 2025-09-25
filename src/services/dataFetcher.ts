import type { AxiosRequestConfig, AxiosResponse } from "axios";
import animeConfig from "@configs/animeConfig";
import { fetchResponse } from "@http/fetcher";
import { ScraperError } from "@http/errors";

type HostConfig = {
  cookies?: string;
};

const HOST_CONFIG: Map<string, HostConfig> = (() => {
  const map = new Map<string, HostConfig>();

  const register = (url: string | undefined, config: HostConfig) => {
    if (!url) return;
    try {
      const host = new URL(url).host;
      if (!host || map.has(host)) return;
      map.set(host, config);
    } catch {
      // ignore invalid urls
    }
  };

  register(animeConfig.baseUrl.otakudesu, { cookies: animeConfig.cookies.otakudesu });
  register(animeConfig.baseUrl.samehadaku, { cookies: animeConfig.cookies.samehadaku });

  return map;
})();

function resolveHostConfig(host: string): HostConfig | undefined {
  return HOST_CONFIG.get(host);
}

function joinCookies(...parts: Array<string | undefined>): string | undefined {
  const value = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join("; ");

  return value.length > 0 ? value : undefined;
}

function appendParams(url: string, params?: AxiosRequestConfig["params"]): string {
  if (!params) return url;

  const urlObject = new URL(url);
  const searchParams = urlObject.searchParams;
  const entries =
    params instanceof URLSearchParams
      ? Array.from(params.entries())
      : Object.entries(params as Record<string, any>);

  for (const [key, value] of entries) {
    if (value === undefined || value === null) continue;
    searchParams.set(key, String(value));
  }

  urlObject.search = searchParams.toString();
  return urlObject.toString();
}

function buildBody(config?: AxiosRequestConfig): BodyInit | null {
  if (!config) return null;
  const method = (config.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  const data = config.data;
  if (data === undefined || data === null) return null;

  if (typeof data === "string" || data instanceof URLSearchParams || data instanceof FormData || data instanceof Blob) {
    return data as BodyInit;
  }

  return JSON.stringify(data);
}

function normalizeHeaders(headers?: AxiosRequestConfig["headers"]): Record<string, string> {
  if (!headers) return {};

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers as Record<string, any>)) {
    if (value === undefined || value === null) continue;
    result[key] = Array.isArray(value) ? value.join(",") : String(value);
  }
  return result;
}

function createAxiosLikeResponse(data: any, response: Response, config: AxiosRequestConfig | undefined): AxiosResponse {
  const headers = Object.fromEntries(response.headers.entries());
  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers,
    config: config ?? {},
    request: {
      url: response.url,
      method: config?.method ?? "GET",
    } as any,
  } as AxiosResponse;
}

export async function wajikFetch(
  url: string,
  ref: string,
  axiosConfig?: AxiosRequestConfig<any>,
  callback?: (response: AxiosResponse) => void
): Promise<any> {
  const finalUrl = appendParams(url, axiosConfig?.params);
  const headers = normalizeHeaders(axiosConfig?.headers);
  const method = (axiosConfig?.method ?? "GET").toUpperCase();
  const body = buildBody(axiosConfig);
  const siteKey = (() => {
    try {
      return new URL(ref ?? finalUrl).hostname;
    } catch {
      try {
        return new URL(finalUrl).hostname;
      } catch {
        return "unknown";
      }
    }
  })();

  if (!headers["Content-Type"] && typeof axiosConfig?.data === "object" && axiosConfig?.data && !(axiosConfig.data instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
  }

  if (ref) {
    headers.Referer = headers.Referer ?? ref;
  }

  const headerCookie = headers.Cookie ?? headers.cookie;
  if (headerCookie) {
    delete headers.Cookie;
    delete (headers as any).cookie;
  }

  let hostConfig: HostConfig | undefined;
  try {
    const finalHost = new URL(finalUrl).host;
    hostConfig = resolveHostConfig(finalHost);
  } catch {
    // ignore invalid urls
  }

  if (!hostConfig) {
    hostConfig = resolveHostConfig(siteKey);
  }

  const cookieOverride = joinCookies(hostConfig?.cookies, headerCookie);

  const response = await fetchResponse({
    url: finalUrl,
    method,
    headers,
    body,
    site: siteKey,
    maxRetries: axiosConfig?.maxRedirects ?? 3,
    timeoutMs: axiosConfig?.timeout,
    cookies: cookieOverride,
  });

  let data: any;
  const responseType = axiosConfig?.responseType ?? "text";

  if (responseType === "arraybuffer") {
    data = await response.arrayBuffer();
  } else if (responseType === "json") {
    data = await response.json();
  } else if (responseType === "stream") {
    data = response.body;
  } else {
    data = await response.text();
  }

  if (callback) {
    callback(createAxiosLikeResponse(data, response, axiosConfig));
  }

  return data;
}

export async function getFinalUrl(
  url: string,
  ref: string,
  axiosConfig?: AxiosRequestConfig<any>
): Promise<string> {
  const finalUrl = appendParams(url, axiosConfig?.params);
  const headers = normalizeHeaders(axiosConfig?.headers);
  if (ref) {
    headers.Referer = headers.Referer ?? ref;
  }
  const headerCookie = headers.Cookie ?? headers.cookie;
  if (headerCookie) {
    delete headers.Cookie;
    delete (headers as any).cookie;
  }

  const method = (axiosConfig?.method ?? "HEAD").toUpperCase();
  const siteKey = (() => {
    try {
      return new URL(ref ?? finalUrl).hostname;
    } catch {
      return "unknown";
    }
  })();

  let hostConfig: HostConfig | undefined;
  try {
    const finalHost = new URL(finalUrl).host;
    hostConfig = resolveHostConfig(finalHost);
  } catch {
    // ignore invalid urls
  }

  if (!hostConfig) {
    hostConfig = resolveHostConfig(siteKey);
  }

  const cookieOverride = joinCookies(hostConfig?.cookies, headerCookie);

  const response = await fetchResponse({
    url: finalUrl,
    method,
    headers,
    site: siteKey,
    maxRetries: axiosConfig?.maxRedirects ?? 2,
    cookies: cookieOverride,
  });

  const location = response.headers.get("location");
  if (location) {
    try {
      return new URL(location, finalUrl).toString();
    } catch (error) {
      throw new ScraperError("Invalid redirect URL", { site: siteKey, url: finalUrl, cause: error });
    }
  }

  return response.url || finalUrl;
}

export async function getFinalUrls(
  urls: string[],
  ref: string,
  config: {
    axiosConfig?: AxiosRequestConfig<any>;
    retryConfig?: {
      retries?: number;
      delay?: number;
    };
  }
): Promise<any[]> {
  const { retries = 3, delay = 1000 } = config.retryConfig || {};

  const retryRequest = async (url: string): Promise<any> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await getFinalUrl(url, ref, config.axiosConfig);
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const requests = urls.map((url) => retryRequest(url));
  const responses = await Promise.allSettled(requests);

  return responses.map((response) => {
    if (response.status === "fulfilled") return response.value;
    return "";
  });
}
