import { Router } from "express";
import { generateWeeklyReport, getWeeklyReports } from "../services/reportService";

export const reportRouter = Router();

reportRouter.get("/", async (_req, res, next) => {
  try {
    const reports = await getWeeklyReports();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

reportRouter.post("/generate", async (_req, res, next) => {
  try {
    const result = await generateWeeklyReport();
    res.json(result);
  } catch (error) {
    next(error);
  }
});
