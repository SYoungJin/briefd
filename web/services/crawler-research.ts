import Parser from "rss-parser";
import { RESEARCH_FEEDS } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const parser = new Parser();

function inferResearchCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("hci")) return "HCI";
  if (t.includes("accessibility")) return "접근성";
  if (t.includes("interaction")) return "인터랙션";
  if (t.includes("design system")) return "디자인시스템";
  return "AI·ML";
}

export async function crawlResearchSector() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return { newCount: 0 };
  let newCount = 0;
  for (const feedUrl of RESEARCH_FEEDS) {
    const feed = await parser.parseURL(feedUrl);
    const items = feed.items.slice(0, 20);

    for (const item of items) {
      const payload = {
        title: item.title ?? "Untitled",
        url: item.link ?? "",
        source: feed.title ?? "Unknown",
        thumbnail: null,
        published_at: item.pubDate ?? new Date().toISOString(),
        sector: "research",
        category: inferResearchCategory(item.title ?? "")
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
  }

  return { newCount };
}
