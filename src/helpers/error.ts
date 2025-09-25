import { ScraperError } from "@http/errors";

export function setResponseError(status?: number, message?: string): never {
  throw new ScraperError(message ?? "Scraper error", { status });
}
