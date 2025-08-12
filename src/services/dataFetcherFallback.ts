import type { AxiosRequestConfig } from "axios";

const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

/**
 * Fallback implementation using native fetch when axios has issues
 */
export async function fetchFallback(
    url: string,
    ref: string,
    config?: AxiosRequestConfig<any>
): Promise<any> {
    const headers: Record<string, string> = {
        "User-Agent": userAgent,
        Referer: ref,
    };

    // Safely merge axios headers, converting to strings and filtering out null values
    if (config?.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
            if (value != null) {
                headers[key] = String(value);
            }
        });
    }

    const fetchOptions: RequestInit = {
        method: config?.method?.toUpperCase() || 'GET',
        headers,
        signal: config?.timeout ? AbortSignal.timeout(config.timeout) : undefined,
    };

    if (config?.data) {
        if (config.data instanceof URLSearchParams) {
            fetchOptions.body = config.data.toString();
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else if (typeof config.data === 'object') {
            fetchOptions.body = JSON.stringify(config.data);
            headers['Content-Type'] = 'application/json';
        } else {
            fetchOptions.body = config.data;
        }
    }

    try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok && config?.validateStatus) {
            const isValid = config.validateStatus(response.status);
            if (!isValid) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } else if (!response.ok && !config?.validateStatus) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Handle different response types
        if (config?.responseType === 'json') {
            return await response.json();
        } else if (config?.responseType === 'text') {
            return await response.text();
        } else {
            // Default to text for HTML scraping
            return await response.text();
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            throw new Error(`Request timeout after ${config?.timeout}ms`);
        }
        throw error;
    }
}

/**
 * Fallback implementation for getFinalUrl using native fetch
 */
export async function getFinalUrlFallback(
    url: string,
    ref: string,
    config?: AxiosRequestConfig<any>
): Promise<string> {
    const headers: Record<string, string> = {
        "User-Agent": userAgent,
        Referer: ref,
    };

    // Safely merge axios headers, converting to strings and filtering out null values
    if (config?.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
            if (value != null) {
                headers[key] = String(value);
            }
        });
    }

    const fetchOptions: RequestInit = {
        method: 'HEAD',
        headers,
        redirect: 'manual', // Don't follow redirects automatically
        signal: config?.timeout ? AbortSignal.timeout(config.timeout) : undefined,
    };

    try {
        const response = await fetch(url, fetchOptions);

        // Check for redirect status codes
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (location) {
                return location;
            }
        }

        return url;
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            throw new Error(`Request timeout after ${config?.timeout}ms`);
        }
        throw error;
    }
}

/**
 * Fallback implementation for getFinalUrls using native fetch
 */
export async function getFinalUrlsFallback(
    urls: string[],
    ref: string,
    config: {
        axiosConfig?: AxiosRequestConfig<any>;
        retryConfig?: {
            retries?: number;
            delay?: number;
        };
    }
): Promise<string[]> {
    const { retries = 3, delay = 1000 } = config.retryConfig || {};

    const retryRequest = async (url: string): Promise<string> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await getFinalUrlFallback(url, ref, config.axiosConfig);
            } catch (error) {
                if (attempt === retries) throw error;
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        return url; // Fallback to original URL
    };

    const requests = urls.map((url) => retryRequest(url));
    const responses = await Promise.allSettled(requests);

    const results = responses.map((response) => {
        if (response.status === "fulfilled") return response.value;
        return "";
    });

    return results;
}

/**
 * Enhanced dataFetcher with automatic fallback to native fetch
 */
export async function wajikFetchWithFallback(
    url: string,
    ref: string,
    axiosConfig?: AxiosRequestConfig<any>,
    callback?: (response: any) => void
): Promise<any> {
    try {
        // Try axios first
        const axios = await import('axios');
        const response = await axios.default(url, {
            ...axiosConfig,
            headers: {
                "User-Agent": userAgent,
                Referer: ref,
                ...axiosConfig?.headers,
            },
        });

        if (callback) callback(response);
        return response.data;
    } catch (error) {
        console.warn('Axios failed, falling back to native fetch:', error);

        // Fallback to native fetch
        const data = await fetchFallback(url, ref, axiosConfig);

        // Create a mock response object for callback compatibility
        if (callback) {
            const mockResponse = {
                data,
                status: 200,
                headers: {},
                config: axiosConfig,
            };
            callback(mockResponse);
        }

        return data;
    }
}