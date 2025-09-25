export class ScraperError extends Error {
  status?: number;
  url?: string;
  site?: string;
  cause?: unknown;

  constructor(message: string, options: { status?: number; url?: string; site?: string; cause?: unknown } = {}) {
    super(message);
    this.name = "ScraperError";
    this.status = options.status;
    this.url = options.url;
    this.site = options.site;
    this.cause = options.cause;
  }
}

export class SelectorError extends ScraperError {
  selector: string;
  version: string;

  constructor(message: string, selector: string, version: string, options: { site?: string; url?: string } = {}) {
    super(message, { ...options, site: options.site, url: options.url });
    this.name = "SelectorError";
    this.selector = selector;
    this.version = version;
  }
}

export class FetchFailedError extends ScraperError {
  attempt: number;

  constructor(message: string, attempt: number, options: { status?: number; url: string; site?: string; cause?: unknown }) {
    super(message, options);
    this.name = "FetchFailedError";
    this.attempt = attempt;
  }
}
