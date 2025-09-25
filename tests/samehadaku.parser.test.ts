import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import SamehadakuParser from "../src/anims/samehadaku/parsers/SamehadakuParser";
import samehadakuInfo from "../src/anims/samehadaku/info/samehadakuInfo";

const parser = new SamehadakuParser(samehadakuInfo.baseUrl, samehadakuInfo.baseUrlPath);

function loadFixture(name: string): string {
  return readFileSync(`tests/fixtures/samehadaku/${name}`, "utf8");
}

describe("Samehadaku parser fixtures", () => {
  it("parses home fixture with batches and movies", async () => {
    const html = loadFixture("home.html");
    const data = await parser.parseHome({ html });

    expect(data.recent.animeList.length).toBeGreaterThan(0);
    expect(data.batch.batchList.length).toBeGreaterThan(0);
    expect(data.movie.animeList.length).toBeGreaterThan(0);
  });

  it("parses genre fixture", async () => {
    const html = loadFixture("genres.html");
    const data = await parser.parseAllGenres({ html });

    expect(data.genreList.length).toBeGreaterThan(0);
    expect(data.genreList[0]?.title).toBeTruthy();
  });
});
