import Parser from "rss-parser";
import { RESEARCH_FEEDS } from "@/lib/constants";
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

function inferResearchCategory(title: string, source = ""): string {
  const t = title.toLowerCase();
  const s = source.toLowerCase();

  if (
    s.includes("service design") ||
    s.includes("touchpoint") ||
    s.includes("practical service") ||
    /\b(service design|service-design|service blueprint|service ecosystem|servicescape)\b/.test(t)
  ) {
    return "서비스디자인";
  }

  if (/\b(accessibility|a11y|wcag|inclusive design|assistive)\b/.test(t)) {
    return "접근성";
  }

  if (/\b(design system|design-system|design tokens|component library)\b/.test(t)) {
    return "디자인시스템";
  }

  if (/\b(cognitive|cognition|perception|attention|memory|workload|usability)\b/.test(t)) {
    return "인지과학";
  }

  if (/\b(interaction|input|gesture|haptic|gaze|voice ui|conversational)\b/.test(t)) {
    return "인터랙션";
  }

  return "HCI";
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
  sector: "research";
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
        sector: "research",
        category: inferResearchCategory(item.title ?? "", feed.title ?? "")
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
    .map((r, i) =>
      r.status === "rejected" || (r.status === "fulfilled" && r.value.length === 0) ? RESEARCH_FEEDS[i] : null
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
    console.error("[crawl-research] upsert failed", error);
  }

  return { newCount, failedFeeds };
}
