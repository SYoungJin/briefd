import Parser from "rss-parser";
import { TREND_FEEDS } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const parser = new Parser({ timeout: 8000 });

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("mobility") || t.includes("vehicle")) return "모빌리티";
  if (t.includes("robot") || t.includes("ai")) return "AI·로봇";
  if (t.includes("iot") || t.includes("smart")) return "IoT";
  if (t.includes("exhibition") || t.includes("event")) return "전시·이벤트";
  return "UXUI";
}

interface ParsedItem {
  title: string;
  url: string;
  source: string;
  thumbnail: string | null;
  published_at: string;
  sector: "trend";
  category: string;
}

async function fetchFeedSafely(feedUrl: string): Promise<ParsedItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items = feed.items.slice(0, 20);
    return items
      .filter((item) => Boolean(item.link))
      .map((item) => ({
        title: item.title ?? "Untitled",
        url: item.link as string,
        source: feed.title ?? "Unknown",
        thumbnail: null,
        published_at: item.pubDate ?? new Date().toISOString(),
        sector: "trend",
        category: inferCategory(item.title ?? "")
      }));
  } catch (error) {
    console.error("[crawl-trend] feed failed", feedUrl, error);
    return [];
  }
}

export async function crawlTrendSector() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return { newCount: 0, failedFeeds: TREND_FEEDS };

  const settled = await Promise.allSettled(TREND_FEEDS.map(fetchFeedSafely));
  const failedFeeds = settled
    .map((r, i) => (r.status === "rejected" || (r.status === "fulfilled" && r.value.length === 0) ? TREND_FEEDS[i] : null))
    .filter(Boolean) as string[];

  const items = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  if (items.length === 0) return { newCount: 0, failedFeeds };

  const urls = items.map((i) => i.url);
  const { data: existing } = await supabaseAdmin
    .from("articles")
    .select("url")
    .in("url", urls);

  const existingUrls = new Set((existing ?? []).map((row) => row.url));
  const newCount = items.filter((i) => !existingUrls.has(i.url)).length;

  const payload = items.map((item) => ({ ...item, summary: null as string | null }));
  const { error } = await supabaseAdmin.from("articles").upsert(payload, { onConflict: "url" });
  if (error) {
    console.error("[crawl-trend] upsert failed", error);
  }

  return { newCount, failedFeeds };
}
