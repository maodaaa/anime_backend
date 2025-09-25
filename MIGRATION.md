# Scraper maintenance playbook

## Updating selectors

1. Inspect the affected page in a browser and note the new markup.
2. Update the selector constants in:
   - `src/scrapers/otakudesu/selectors.ts`
   - `src/scrapers/samehadaku/selectors.ts`
3. Bump the `CURRENT_*_SELECTOR_VERSION` value to a new semantic label (e.g. `v2025_10`).
4. Update derived parsers if new selectors are required and adjust tests to cover the change.
5. Re-run `bun test` to ensure offline fixtures still parse.

## Refreshing fixtures

1. Export `LIVE_SCRAPE=1` to enable live scraping.
2. Run `bun run scripts/update-fixtures.ts` to fetch fresh HTML snapshots with rate limiting.
3. Commit the updated files under `tests/fixtures/**`.

## Validating changes

1. Offline suite: `bun test`
2. Optional live smoke tests: `LIVE_SCRAPE=1 bun test tests/live/smoke.test.ts`
3. Verify `/health/scrape` shows recent timestamps after exercising the routes locally.

## When 403 reappears

- Rotate the selector version and refresh fixtures to avoid repeated failing requests.
- Update headers or cookies in `src/http/fetcher.ts` if the target introduces new checks.
- Slow down traffic via `RATE_LIMIT_RPS` overrides in the fetcher options if the site tightens throttling.
- Clear the in-memory cookie jar by restarting the process before retrying.
- If Cloudflare challenges persist, capture the new response headers in logs and consider adding a Playwright fallback.
