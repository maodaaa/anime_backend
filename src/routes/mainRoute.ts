import { Hono } from "hono";
import { serverCache } from "@middlewares/cache";
import mainController from "@controllers/mainController";

const mainRoute = new Hono();

// Main view route - serves the home.html file
mainRoute.get("/", async (c) => {
    return await mainController.getMainView(c);
});

// API endpoint to get main view data with anime sources
mainRoute.get("/view-data", serverCache(5), async (c) => {
    return await mainController.getMainViewData(c);
});

export default mainRoute;
