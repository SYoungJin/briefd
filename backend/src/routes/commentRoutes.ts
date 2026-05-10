import { Router } from "express";
import { getCommentsByTarget } from "../services/commentService";

export const commentRouter = Router();

commentRouter.get("/:targetType/:targetId", async (req, res, next) => {
  try {
    const targetType = req.params.targetType as "news" | "report";
    const targetId = req.params.targetId;
    const comments = await getCommentsByTarget(targetType, targetId);
    res.json({ comments });
  } catch (error) {
    next(error);
  }
});
