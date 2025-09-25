export type ScrapeHealth = {
  lastSuccess?: number;
  lastError?: {
    at: number;
    status?: number;
    message: string;
    url?: string;
  };
  consecutiveFailures: number;
};

const metrics = new Map<string, ScrapeHealth>();

function getOrCreate(site: string): ScrapeHealth {
  if (!metrics.has(site)) {
    metrics.set(site, { consecutiveFailures: 0 });
  }
  return metrics.get(site)!;
}

export function recordScrapeSuccess(site: string): void {
  const entry = getOrCreate(site);
  entry.lastSuccess = Date.now();
  entry.consecutiveFailures = 0;
}

export function recordScrapeFailure(site: string, error: { status?: number; message: string; url?: string }): void {
  const entry = getOrCreate(site);
  entry.lastError = {
    at: Date.now(),
    status: error.status,
    message: error.message,
    url: error.url,
  };
  entry.consecutiveFailures += 1;
}

export function getScrapeHealth(site: string): ScrapeHealth {
  return { ...getOrCreate(site) };
}

export function getAllScrapeHealth(): Record<string, ScrapeHealth> {
  return Object.fromEntries(Array.from(metrics.entries()).map(([site, value]) => [site, { ...value }]));
}
