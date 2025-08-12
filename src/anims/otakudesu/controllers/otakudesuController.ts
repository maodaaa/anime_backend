import type { Context } from "hono";
import { getPageParam, getQParam, generateHonoPayload } from "@helpers/honoHelpers";
import OtakudesuParser from "@otakudesu/parsers/OtakudesuParser";
import otakudesuInfo from "@otakudesu/info/otakudesuInfo";
import path from "path";

const { baseUrl, baseUrlPath } = otakudesuInfo;
const parser = new OtakudesuParser(baseUrl, baseUrlPath);

const otakudesuController = {
  async getMainView(c: Context): Promise<Response> {
    try {
      const filePath = path.join(process.cwd(), "src", "public", "views", "anime-source.html");
      const file = Bun.file(filePath);

      if (await file.exists()) {
        return c.html(await file.text());
      } else {
        const payload = generateHonoPayload(404, { message: "File not found" });
        return c.json(payload, 404);
      }
    } catch (error) {
      console.error("Error in getMainView:", error);
      const payload = generateHonoPayload(500, { message: "Internal server error" });
      return c.json(payload, 500);
    }
  },

  async getMainViewData(c: Context): Promise<Response> {
    try {
      const data = otakudesuInfo;
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getHome(c: Context): Promise<Response> {
    try {
      const data = await parser.parseHome();
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getSchedule(c: Context): Promise<Response> {
    try {
      const data = await parser.parseSchedule();
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getAllAnimes(c: Context): Promise<Response> {
    try {
      const data = await parser.parseAllAnimes();
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getAllGenres(c: Context): Promise<Response> {
    try {
      const data = await parser.parseAllGenres();
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getOngoingAnimes(c: Context): Promise<Response> {
    try {
      const page = getPageParam(c);
      const { data, pagination } = await parser.parseOngoingAnimes(page);
      const payload = generateHonoPayload(200, { data, pagination });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getCompletedAnimes(c: Context): Promise<Response> {
    try {
      const page = getPageParam(c);
      const { data, pagination } = await parser.parseCompletedAnimes(page);
      const payload = generateHonoPayload(200, { data, pagination });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getSearch(c: Context): Promise<Response> {
    try {
      const q = getQParam(c);
      const data = await parser.parseSearch(q);
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      console.error("Error in getSearch:", error);
      if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
        const status = error.status as number;
        const message = (error.message as string) || "Bad request";
        const payload = generateHonoPayload(status, { message });
        return c.json(payload, status as any);
      }
      const payload = generateHonoPayload(500, { message: "Internal server error" });
      return c.json(payload, 500);
    }
  },

  async getGenreAnimes(c: Context): Promise<Response> {
    try {
      const genreId = c.req.param("genreId");
      if (!genreId) {
        const payload = generateHonoPayload(400, { message: "Genre ID is required" });
        return c.json(payload, 400);
      }

      // Check for invalid parameter patterns
      if (genreId.includes("{") || genreId.includes("}")) {
        const payload = generateHonoPayload(400, { message: "Invalid genre ID format" });
        return c.json(payload, 400);
      }

      const page = getPageParam(c);
      const { data, pagination } = await parser.parseGenreAnimes(genreId, page);
      const payload = generateHonoPayload(200, { data, pagination });
      return c.json(payload);
    } catch (error) {
      console.error("Error in getGenreAnimes:", error);
      if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
        const status = error.status as number;
        const message = (error.message as string) || "Bad request";
        const payload = generateHonoPayload(status, { message });
        return c.json(payload, status as any);
      }

      // Check if it's a "not found" type error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error.message as string).toLowerCase();
        if (errorMessage.includes("not found") || errorMessage.includes("tidak ditemukan") || errorMessage.includes("404")) {
          const payload = generateHonoPayload(404, { message: "Genre not found" });
          return c.json(payload, 404);
        }
      }

      const payload = generateHonoPayload(500, { message: "Internal server error" });
      return c.json(payload, 500);
    }
  },

  async getAnimeDetails(c: Context): Promise<Response> {
    try {
      const animeId = c.req.param("animeId");
      if (!animeId) {
        const payload = generateHonoPayload(400, { message: "Anime ID is required" });
        return c.json(payload, 400);
      }

      // Check for invalid parameter patterns
      if (animeId.includes("{") || animeId.includes("}")) {
        const payload = generateHonoPayload(400, { message: "Invalid anime ID format" });
        return c.json(payload, 400);
      }

      const data = await parser.parseAnimeDetails(animeId);
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      console.error("Error in getAnimeDetails:", error);

      // Check if it's a "not found" type error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error.message as string).toLowerCase();
        if (errorMessage.includes("not found") || errorMessage.includes("tidak ditemukan") || errorMessage.includes("404")) {
          const payload = generateHonoPayload(404, { message: "Anime not found" });
          return c.json(payload, 404);
        }
      }

      const payload = generateHonoPayload(500, { message: "Internal server error" });
      return c.json(payload, 500);
    }
  },

  async getAnimeEpisode(c: Context): Promise<Response> {
    try {
      const episodeId = c.req.param("episodeId");
      const data = await parser.parseAnimeEpisode(episodeId);
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getServerUrl(c: Context): Promise<Response> {
    try {
      const serverId = c.req.param("serverId");
      const data = await parser.parseServerUrl(serverId);
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      throw error;
    }
  },

  async getAnimeBatch(c: Context): Promise<Response> {
    try {
      const batchId = c.req.param("batchId");
      if (!batchId) {
        const payload = generateHonoPayload(400, { message: "Batch ID is required" });
        return c.json(payload, 400);
      }

      // Check for invalid parameter patterns
      if (batchId.includes("{") || batchId.includes("}")) {
        const payload = generateHonoPayload(400, { message: "Invalid batch ID format" });
        return c.json(payload, 400);
      }

      const data = await parser.parseAnimeBatch(batchId);
      const payload = generateHonoPayload(200, { data });
      return c.json(payload);
    } catch (error) {
      console.error("Error in getAnimeBatch:", error);

      // Check if it's a "not found" type error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error.message as string).toLowerCase();
        if (errorMessage.includes("not found") || errorMessage.includes("tidak ditemukan") || errorMessage.includes("404")) {
          const payload = generateHonoPayload(404, { message: "Batch not found" });
          return c.json(payload, 404);
        }
      }

      const payload = generateHonoPayload(500, { message: "Internal server error" });
      return c.json(payload, 500);
    }
  },
};

export default otakudesuController;
