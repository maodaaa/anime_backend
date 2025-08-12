import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { otakudesuInfo } from "@otakudesu/index";
import { samehadakuInfo } from "@samehadaku/index";
import generatePayload from "@helpers/payload";
import path from "path";
import fs from "fs";

const mainController = {
  async getMainView(c: Context): Promise<Response> {
    try {
      const getViewFile = (filePath: string) => {
        return path.join(__dirname, "..", "public", "views", filePath);
      };

      const filePath = getViewFile("home.html");
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        throw new HTTPException(404, { message: "View file not found" });
      }

      return new Response(file, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },

  async getMainViewData(c: Context): Promise<Response> {
    try {
      function getData() {
        const animeSources = {
          otakudesu: otakudesuInfo,
          samehadaku: samehadakuInfo,
        };

        const data = {
          message: "WAJIK ANIME API IS READY 🔥🔥🔥",
          sources: Object.values(animeSources),
        };

        const newData: { message: string; sources: any[] } = {
          message: data.message,
          sources: [],
        };

        data.sources.forEach((source) => {
          const exist = fs.existsSync(path.join(__dirname, "..", "anims", source.baseUrlPath));

          if (exist) {
            newData.sources.push({
              title: source.title,
              route: source.baseUrlPath,
            });
          }
        });

        return newData;
      }

      const data = getData();

      // Create a mock response object for generatePayload compatibility
      const mockRes = { statusCode: 200 } as any;
      const payload = generatePayload(mockRes, { data });

      return c.json(payload);
    } catch (error) {
      throw new HTTPException(500, { message: "Internal server error" });
    }
  },

  async notFound(c: Context): Promise<Response> {
    throw new HTTPException(404, { message: "halaman tidak ditemukan" });
  },
};

export default mainController;
