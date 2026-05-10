import Parser from "rss-parser";
import { TREND_FEEDS } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const parser = new Parser();

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("mobility") || t.includes("vehicle")) return "모빌리티";
  if (t.includes("robot") || t.includes("ai")) return "AI·로봇";
  if (t.includes("iot") || t.includes("smart")) return "IoT";
  if (t.includes("exhibition") || t.includes("event")) return "전시·이벤트";
  return "UXUI";
}

export async function crawlTrendSector() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return { newCount: 0 };
  let newCount = 0;
  const failedFeeds: string[] = [];
  for (const feedUrl of TREND_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const items = feed.items.slice(0, 20);

      for (const item of items) {
        const payload = {
          title: item.title ?? "Untitled",
          url: item.link ?? "",
          source: feed.title ?? "Unknown",
          thumbnail: null,
          published_at: item.pubDate ?? new Date().toISOString(),
          sector: "trend",
          category: inferCategory(item.title ?? "")
        };

        const { data: existing } = await supabaseAdmin
          .from("articles")
          .select("id")
          .eq("url", payload.url)
          .maybeSingle();

        if (!existing) {
          newCount += 1;
        }

        await supabaseAdmin.from("articles").upsert({ ...payload, summary: null }, { onConflict: "url" });
      }
    } catch (error) {
      console.error("[crawl-trend] feed failed", feedUrl, error);
      failedFeeds.push(feedUrl);
    }
  }
  return { newCount, failedFeeds };
}
