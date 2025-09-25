import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const alias = {
  "@configs": resolve(__dirname, "src/configs"),
  "@controllers": resolve(__dirname, "src/controllers"),
  "@helpers": resolve(__dirname, "src/helpers"),
  "@http": resolve(__dirname, "src/http"),
  "@interfaces": resolve(__dirname, "src/interfaces"),
  "@libs": resolve(__dirname, "src/libs"),
  "@middlewares": resolve(__dirname, "src/middlewares"),
  "@otakudesu": resolve(__dirname, "src/anims/otakudesu"),
  "@samehadaku": resolve(__dirname, "src/anims/samehadaku"),
  "@routes": resolve(__dirname, "src/routes"),
  "@scrapers": resolve(__dirname, "src/scrapers"),
  "@services": resolve(__dirname, "src/services"),
  "@schemas": resolve(__dirname, "src/schemas"),
};

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      reporter: ["text", "json", "lcov"],
      provider: "v8",
      reportsDirectory: "coverage",
      thresholds: {
        perFile: {
          "src/anims/otakudesu/parsers/OtakudesuParser.ts": { lines: 0.8 },
          "src/anims/samehadaku/parsers/SamehadakuParser.ts": { lines: 0.8 },
        },
      },
    },
  },
});
