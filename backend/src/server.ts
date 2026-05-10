import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { newsRouter } from "./routes/newsRoutes";
import { reportRouter } from "./routes/reportRoutes";
import { commentRouter } from "./routes/commentRoutes";
import { articleRouter } from "./routes/articleRoutes";
import { startWeeklyReportJob } from "./jobs/weeklyReportJob";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "uxpulse-backend" });
});

app.use("/api/news", newsRouter);
app.use("/api/reports", reportRouter);
app.use("/api/comments", commentRouter);
app.use("/api/articles", articleRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`UXPulse backend listening on http://localhost:${port}`);
});

startWeeklyReportJob();
