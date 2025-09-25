import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import OtakudesuParser from "../src/anims/otakudesu/parsers/OtakudesuParser";
import otakudesuInfo from "../src/anims/otakudesu/info/otakudesuInfo";

const parser = new OtakudesuParser(otakudesuInfo.baseUrl, otakudesuInfo.baseUrlPath);

function loadFixture(name: string): string {
  return readFileSync(`tests/fixtures/otakudesu/${name}`, "utf8");
}

describe("Otakudesu parser fixtures", () => {
  it("parses home fixture with ongoing and completed lists", async () => {
    const html = loadFixture("home.html");
    const data = await parser.parseHome({ html });

    expect(data.ongoing.animeList.length).toBeGreaterThan(0);
    expect(data.completed.animeList.length).toBeGreaterThan(0);
    expect(data.ongoing.animeList[0]?.title).toBeTruthy();
  });

  it("parses schedule fixture", async () => {
    const html = loadFixture("schedule.html");
    const data = await parser.parseSchedule({ html });

    expect(data.days.length).toBeGreaterThan(0);
    expect(data.days[0]?.animeList.length).toBeGreaterThan(0);
  });

  it("parses anime list fixture", async () => {
    const html = loadFixture("anime-list.html");
    const data = await parser.parseAllAnimes({ html });

    expect(data.list.length).toBeGreaterThan(0);
    expect(data.list[0]?.animeList.length).toBeGreaterThan(0);
  });

  it("parses genre list fixture", async () => {
    const html = loadFixture("genres.html");
    const data = await parser.parseAllGenres({ html });

    expect(data.genreList.length).toBeGreaterThan(0);
    expect(data.genreList[0]?.genreId).toBe("action");
  });

  it("parses ongoing page fixture", async () => {
    const html = loadFixture("ongoing-page1.html");
    const { data, pagination } = await parser.parseOngoingAnimes(1, { html });

    expect(data.animeList.length).toBeGreaterThan(0);
    expect(pagination.totalPages ?? 1).toBeGreaterThan(0);
  });

  it("parses search results fixture", async () => {
    const html = loadFixture("search-one-piece.html");
    const data = await parser.parseSearch("one+piece", { html });

    expect(data.animeList.length).toBeGreaterThan(0);
    expect(data.animeList[0]?.title.toLowerCase()).toContain("one piece");
  });
});
