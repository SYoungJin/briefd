import { Router } from "express";
import { listArticles, summarizeArticleById } from "../services/articleService";

export const articleRouter = Router();

articleRouter.get("/", async (_req, res, next) => {
  try {
    const articles = await listArticles();
    res.json({ articles });
  } catch (error) {
    next(error);
  }
});

articleRouter.post("/:id/summarize", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ message: "Invalid article id" });
      return;
    }

    const result = await summarizeArticleById(id);
    if (!result) {
      res.status(404).json({ message: "Article not found" });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});
