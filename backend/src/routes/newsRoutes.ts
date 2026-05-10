import { Router } from "express";
import { fetchTrendNews } from "../services/newsService";
import { crawlAndStoreArticles } from "../services/crawler";

export const newsRouter = Router();

newsRouter.get("/", async (_req, res, next) => {
  try {
    const items = await fetchTrendNews();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

newsRouter.post("/crawl", async (_req, res, next) => {
  try {
    const result = await crawlAndStoreArticles();
    res.json(result);
  } catch (error) {
    next(error);
  }
});
