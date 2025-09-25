import { describe, it, expect } from "vitest";
import { fetchHtml } from "../../src/http/fetcher";

const runLive = process.env.LIVE_SCRAPE === "1";

const describeLive = runLive ? describe : describe.skip;

describeLive("live scraper smoke", () => {
  it("fetches otakudesu homepage", async () => {
    const html = await fetchHtml({ url: "https://otakudesu.best/", site: "otakudesu", maxRetries: 2 });
    expect(html.length).toBeGreaterThan(1000);
  }, 60_000);

  it("fetches samehadaku homepage", async () => {
    const html = await fetchHtml({ url: "http://v1.samehadaku.how/", site: "samehadaku", maxRetries: 2 });
    expect(html.length).toBeGreaterThan(1000);
  }, 60_000);
});
