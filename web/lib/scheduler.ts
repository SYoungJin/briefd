import cron from "node-cron";
import { crawlTrendSector } from "@/services/crawler-trend";
import { crawlResearchSector } from "@/services/crawler-research";

let initialized = false;

export function initScheduler() {
  if (initialized) return;
  initialized = true;

  cron.schedule("0 7 * * *", async () => {
    try {
      await crawlTrendSector();
      await crawlResearchSector();
      console.log("[scheduler] daily crawl complete");
    } catch (error) {
      console.error("[scheduler] crawl failed", error);
    }
  });
}
