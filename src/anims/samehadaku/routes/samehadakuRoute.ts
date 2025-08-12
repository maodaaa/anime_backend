import { Hono } from "hono";
import { serverCache } from "@middlewares/cache";
import controller from "@samehadaku/controllers/samehadakuController";

const samehadakuRoute = new Hono();

// Main view route - serves the anime-source.html file
samehadakuRoute.get("/", async (c) => {
  return await controller.getMainView(c);
});

// API endpoint to get main view data with samehadaku info
samehadakuRoute.get("/view-data", serverCache(5), async (c) => {
  return await controller.getMainViewData(c);
});

// Home page with latest anime updates
samehadakuRoute.get("/home", serverCache(5), async (c) => {
  return await controller.getHome(c);
});

// Schedule page showing anime release schedule
samehadakuRoute.get("/schedule", serverCache(10), async (c) => {
  return await controller.getSchedule(c);
});

// All anime list
samehadakuRoute.get("/anime", serverCache(30), async (c) => {
  return await controller.getAllAnimes(c);
});

// All genres list
samehadakuRoute.get("/genres", serverCache(60), async (c) => {
  return await controller.getAllGenres(c);
});

// Recent episodes with pagination
samehadakuRoute.get("/recent", serverCache(5), async (c) => {
  return await controller.getRecentEpisodes(c);
});

// Ongoing anime with pagination
samehadakuRoute.get("/ongoing", serverCache(5), async (c) => {
  return await controller.getOngoingAnimes(c);
});

// Completed anime with pagination
samehadakuRoute.get("/completed", serverCache(5), async (c) => {
  return await controller.getCompletedAnimes(c);
});

// Popular anime with pagination
samehadakuRoute.get("/popular", serverCache(10), async (c) => {
  return await controller.getPopularAnimes(c);
});

// Movies with pagination
samehadakuRoute.get("/movies", serverCache(10), async (c) => {
  return await controller.getMovies(c);
});

// Batch downloads with pagination
samehadakuRoute.get("/batches", serverCache(10), async (c) => {
  return await controller.getBatches(c);
});

// Search anime
samehadakuRoute.get("/search", serverCache(5), async (c) => {
  return await controller.getSearch(c);
});

// Anime by genre with pagination
samehadakuRoute.get("/genres/:genreId", serverCache(10), async (c) => {
  return await controller.getGenreAnimes(c);
});

// Anime details
samehadakuRoute.get("/anime/:animeId", serverCache(10), async (c) => {
  return await controller.getAnimeDetails(c);
});

// Episode details and streaming links
samehadakuRoute.get("/episode/:episodeId", serverCache(5), async (c) => {
  return await controller.getAnimeEpisode(c);
});

// Server streaming URL
samehadakuRoute.get("/server/:serverId", serverCache(5), async (c) => {
  return await controller.getServerUrl(c);
});

// Batch download links
samehadakuRoute.get("/batch/:batchId", serverCache(10), async (c) => {
  return await controller.getAnimeBatch(c);
});

// WibuFile parser endpoint
samehadakuRoute.get("/wibufile", serverCache(5), async (c) => {
  return await controller.getWibuFile(c);
});

export default samehadakuRoute;
