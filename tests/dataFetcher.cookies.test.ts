import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchResponseMock = vi.fn(async () => new Response("ok"));

vi.mock("@configs/animeConfig", () => ({
  default: {
    baseUrl: {
      otakudesu: "https://otakudesu.best",
      samehadaku: "https://v1.samehadaku.how",
    },
    cookies: {
      otakudesu: "cf_clearance=otakudesu",
      samehadaku: "cf_clearance=samehadaku",
    },
    response: { href: true, sourceUrl: true },
    NODE_ENV: "test",
  },
}));

vi.mock("@http/fetcher", () => ({
  fetchResponse: fetchResponseMock,
}));

const { wajikFetch } = await import("@services/dataFetcher");

describe("wajikFetch cookie handling", () => {
  beforeEach(() => {
    fetchResponseMock.mockClear();
  });

  it("injects configured host cookies", async () => {
    await wajikFetch("https://v1.samehadaku.how/home", "https://v1.samehadaku.how/");

    expect(fetchResponseMock).toHaveBeenCalledTimes(1);
    const call = fetchResponseMock.mock.calls[0][0];

    expect(call.cookies).toBe("cf_clearance=samehadaku");
    expect(call.headers.Cookie).toBeUndefined();
    expect(call.headers.cookie).toBeUndefined();
  });

  it("merges caller cookies with configured overrides", async () => {
    await wajikFetch("https://v1.samehadaku.how/home", "https://v1.samehadaku.how/", {
      headers: { Cookie: "session=abc" },
    });

    const call = fetchResponseMock.mock.calls[0][0];

    expect(call.cookies).toBe("cf_clearance=samehadaku; session=abc");
  });
});
