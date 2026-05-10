import Parser from "rss-parser";
import { TREND_FEEDS } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type CustomItem = {
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>;
  "media:thumbnail"?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>;
  "content:encoded"?: string;
};

const parser: Parser<unknown, CustomItem> = new Parser({
  timeout: 9000,
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["content:encoded", "content:encoded"]
    ]
  }
});

function inferCategory(title: string, source = ""): string {
  const t = title.toLowerCase();
  const s = source.toLowerCase();

  if (
    s.includes("electrek") ||
    s.includes("inside ev") ||
    s.includes("the drive") ||
    /\btransportation\b/.test(s) ||
    /\b(ev|electric vehicle|vehicle|automotive|autonomous|self-?driving|car|robotaxi|adas|mobility)\b/.test(t)
  ) {
    return "모빌리티";
  }

  if (
    /\b(ces ?\d{0,4}|mwc ?\d{0,4}|ifa ?\d{0,4}|sxsw|computex|maison&objet|milan design week|salone)\b/.test(t) ||
    /\b(exhibition|expo|conference|keynote|reveal|unveil|launch event|trade show)\b/.test(t)
  ) {
    return "전시·이벤트";
  }

  if (/\b(robot|robotic|robotics|llm|gpt|genai|generative ai|ai agent|copilot)\b/.test(t)) {
    return "AI·로봇";
  }

  if (/\b(iot|smart ?home|smart ?device|wearable|matter protocol|connected device)\b/.test(t)) {
    return "IoT";
  }

  if (
    s.includes("dezeen") ||
    s.includes("designboom") ||
    s.includes("nice that") ||
    /\b(typography|branding|industrial design|product design|graphic design|illustration)\b/.test(t)
  ) {
    return "디자인";
  }

  return "UXUI";
}

function extractThumbnail(item: Parser.Item & CustomItem): string | null {
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }
  const mc = Array.isArray(item["media:content"]) ? item["media:content"][0] : item["media:content"];
  if (mc?.$?.url) return mc.$.url;
  const mt = Array.isArray(item["media:thumbnail"]) ? item["media:thumbnail"][0] : item["media:thumbnail"];
  if (mt?.$?.url) return mt.$.url;
  const html = item["content:encoded"] ?? item.content ?? "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match?.[1]) return match[1];
  return null;
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
    const items = feed.items.slice(0, 25);
    return items
      .filter((item) => Boolean(item.link))
      .map((item) => ({
        title: item.title ?? "Untitled",
        url: item.link as string,
        source: feed.title ?? "Unknown",
        thumbnail: extractThumbnail(item as Parser.Item & CustomItem),
        published_at: item.pubDate ?? new Date().toISOString(),
        sector: "trend",
        category: inferCategory(item.title ?? "", feed.title ?? "")
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
    .map((r, i) =>
      r.status === "rejected" || (r.status === "fulfilled" && r.value.length === 0) ? TREND_FEEDS[i] : null
    )
    .filter(Boolean) as string[];

  const items = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  if (items.length === 0) return { newCount: 0, failedFeeds };

  const urls = items.map((i) => i.url);
  const { data: existing } = await supabaseAdmin.from("articles").select("url").in("url", urls);

  const existingUrls = new Set((existing ?? []).map((row) => row.url));
  const newCount = items.filter((i) => !existingUrls.has(i.url)).length;

  const payload = items.map((item) => ({ ...item, summary: null as string | null }));
  const { error } = await supabaseAdmin.from("articles").upsert(payload, { onConflict: "url" });
  if (error) {
    console.error("[crawl-trend] upsert failed", error);
  }

  return { newCount, failedFeeds };
}
