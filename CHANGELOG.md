# Changelog

## 2024-11-08

- Hardened Otakudesu & Samehadaku scrapers with centralized fetcher, retries, and selector versioning to resolve HTTP 403 responses.
- Added `/health/scrape` endpoints and scrape metrics tracking.
- Introduced fixture-backed Vitest suites and live smoke tests behind `LIVE_SCRAPE`.
