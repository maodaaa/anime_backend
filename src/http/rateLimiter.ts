const buckets = new Map<string, { tokens: number; last: number }>();

export type RateLimitOptions = {
  host: string;
  rps?: number;
  burst?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function limit({ host, rps = 0.5, burst = 2 }: RateLimitOptions): Promise<void> {
  const now = Date.now();
  const bucket = buckets.get(host) ?? { tokens: burst, last: now };
  const delta = (now - bucket.last) / 1000;

  bucket.tokens = Math.min(burst, bucket.tokens + delta * rps);
  bucket.last = now;

  if (bucket.tokens < 1) {
    const waitSeconds = (1 - bucket.tokens) / rps;
    await sleep(waitSeconds * 1000);
    return limit({ host, rps, burst });
  }

  bucket.tokens -= 1;
  buckets.set(host, bucket);
}

export function resetRateLimiter(host?: string): void {
  if (host) {
    buckets.delete(host);
    return;
  }
  buckets.clear();
}
