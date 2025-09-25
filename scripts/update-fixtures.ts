import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fetchHtml } from "../src/http/fetcher";

const FIXTURES: { site: string; url: string; file: string }[] = [
  { site: "otakudesu", url: "https://otakudesu.best/", file: "tests/fixtures/otakudesu/home.html" },
  { site: "otakudesu", url: "https://otakudesu.best/jadwal-rilis", file: "tests/fixtures/otakudesu/schedule.html" },
  { site: "otakudesu", url: "https://otakudesu.best/anime-list", file: "tests/fixtures/otakudesu/anime-list.html" },
  { site: "otakudesu", url: "https://otakudesu.best/ongoing-anime/page/1", file: "tests/fixtures/otakudesu/ongoing-page1.html" },
  {
    site: "otakudesu",
    url: "https://otakudesu.best/?s=one+piece&post_type=anime",
    file: "tests/fixtures/otakudesu/search-one-piece.html",
  },
  { site: "samehadaku", url: "http://v1.samehadaku.how/", file: "tests/fixtures/samehadaku/home.html" },
  { site: "samehadaku", url: "http://v1.samehadaku.how/daftar-anime-2", file: "tests/fixtures/samehadaku/genres.html" },
  {
    site: "samehadaku",
    url: "http://v1.samehadaku.how/daftar-anime-2/?list",
    file: "tests/fixtures/samehadaku/anime-list.html",
  },
];

async function updateFixture(entry: { site: string; url: string; file: string }) {
  const html = await fetchHtml({ url: entry.url, site: entry.site, maxRetries: 5, timeoutMs: 30000, rps: 0.4, burst: 1 });
  await mkdir(dirname(entry.file), { recursive: true });
  await writeFile(entry.file, html, "utf8");
  console.log(`Updated fixture ${entry.file}`);
}

async function main() {
  if (process.env.LIVE_SCRAPE !== "1") {
    console.error("LIVE_SCRAPE=1 is required to refresh fixtures");
    process.exitCode = 1;
    return;
  }

  for (const fixture of FIXTURES) {
    try {
      await updateFixture(fixture);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`Failed to update fixture for ${fixture.url}`, error);
      process.exitCode = 1;
      return;
    }
  }
}

main();
