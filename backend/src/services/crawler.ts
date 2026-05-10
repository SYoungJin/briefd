import Parser from "rss-parser";
import { db } from "../config/db";

const parser = new Parser();

export async function crawlAndStoreArticles() {
  const feed = await parser.parseURL("https://feeds.arstechnica.com/arstechnica/technology-lab");
  const rows = feed.items.slice(0, 20);

  for (const item of rows) {
    await db.query(
      `INSERT INTO articles (title, original_url, thumbnail_url, source, published_at, category, summary, content)
       VALUES ($1, $2, $3, $4, $5, $6, NULL, $7)
       ON CONFLICT (original_url) DO UPDATE SET
         title = EXCLUDED.title,
         thumbnail_url = EXCLUDED.thumbnail_url,
         source = EXCLUDED.source,
         published_at = EXCLUDED.published_at,
         category = EXCLUDED.category,
         content = EXCLUDED.content`,
      [
        item.title ?? "Untitled",
        item.link ?? "",
        null,
        feed.title ?? "RSS",
        item.pubDate ?? new Date().toISOString(),
        "uxui",
        item.contentSnippet ?? null
      ]
    );
  }

  return { inserted: rows.length };
}
