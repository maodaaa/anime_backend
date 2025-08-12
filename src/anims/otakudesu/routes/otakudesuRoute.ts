import { Hono } from "hono";
import { serverCache } from "@middlewares/cache";
import controller from "@otakudesu/controllers/otakudesuController";

const otakudesuRoute = new Hono();

// Main view route - serves the anime-source.html file
otakudesuRoute.get("/", async (c) => {
  return await controller.getMainView(c);
});

// API endpoint to get main view data with otakudesu info
otakudesuRoute.get("/view-data", serverCache(5), async (c) => {
  return await controller.getMainViewData(c);
});

// Home page with latest anime updates
otakudesuRoute.get("/home", serverCache(5), async (c) => {
  return await controller.getHome(c);
});

// Schedule page showing anime release schedule
otakudesuRoute.get("/schedule", serverCache(10), async (c) => {
  return await controller.getSchedule(c);
});

// All anime list
otakudesuRoute.get("/anime", serverCache(30), async (c) => {
  return await controller.getAllAnimes(c);
});

// All genres list
otakudesuRoute.get("/genres", serverCache(60), async (c) => {
  return await controller.getAllGenres(c);
});

// Ongoing anime with pagination
otakudesuRoute.get("/ongoing", serverCache(5), async (c) => {
  return await controller.getOngoingAnimes(c);
});

// Completed anime with pagination
otakudesuRoute.get("/completed", serverCache(5), async (c) => {
  return await controller.getCompletedAnimes(c);
});

// Search anime
otakudesuRoute.get("/search", serverCache(5), async (c) => {
  return await controller.getSearch(c);
});

// Anime by genre with pagination
otakudesuRoute.get("/genres/:genreId", serverCache(10), async (c) => {
  return await controller.getGenreAnimes(c);
});

// Anime details
otakudesuRoute.get("/anime/:animeId", serverCache(10), async (c) => {
  return await controller.getAnimeDetails(c);
});

// Episode details and streaming links
otakudesuRoute.get("/episode/:episodeId", serverCache(5), async (c) => {
  return await controller.getAnimeEpisode(c);
});

// Server streaming URL
otakudesuRoute.get("/server/:serverId", serverCache(5), async (c) => {
  return await controller.getServerUrl(c);
});

// Batch download links
otakudesuRoute.get("/batch/:batchId", serverCache(10), async (c) => {
  return await controller.getAnimeBatch(c);
});

export default otakudesuRoute;
