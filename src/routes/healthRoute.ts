import { Hono } from "hono";
import { getAllScrapeHealth, getScrapeHealth } from "@http/scrapeMetrics";

const healthRoute = new Hono();

healthRoute.get("/scrape", (c) => {
  const metrics = getAllScrapeHealth();
  return c.json({ ok: true, sites: metrics });
});

healthRoute.get("/scrape/:site", (c) => {
  const site = c.req.param("site");
  const metrics = getScrapeHealth(site);
  return c.json({ ok: true, site, metrics });
});

export default healthRoute;
