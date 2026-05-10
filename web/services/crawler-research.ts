import Parser from "rss-parser";
import { RESEARCH_FEEDS } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const parser = new Parser({ timeout: 8000 });

function inferResearchCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("hci")) return "HCI";
  if (t.includes("accessibility")) return "접근성";
  if (t.includes("interaction")) return "인터랙션";
  if (t.includes("design system")) return "디자인시스템";
  return "AI·ML";
}

interface ParsedItem {
  title: string;
  url: string;
  source: string;
  thumbnail: string | null;
  published_at: string;
  sector: "research";
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
        sector: "research",
        category: inferResearchCategory(item.title ?? "")
      }));
  } catch (error) {
    console.error("[crawl-research] feed failed", feedUrl, error);
    return [];
  }
}

export async function crawlResearchSector() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return { newCount: 0, failedFeeds: RESEARCH_FEEDS };

  const settled = await Promise.allSettled(RESEARCH_FEEDS.map(fetchFeedSafely));
  const failedFeeds = settled
    .map((r, i) => (r.status === "rejected" || (r.status === "fulfilled" && r.value.length === 0) ? RESEARCH_FEEDS[i] : null))
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
    console.error("[crawl-research] upsert failed", error);
  }

  return { newCount, failedFeeds };
}
