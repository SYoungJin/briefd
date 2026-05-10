import { db } from "../config/db";

interface NewsRow {
  id: number;
  title: string;
  original_url: string;
  thumbnail_url: string | null;
  source: string;
  published_at: string;
  category: string;
  summary: string | null;
}

export async function fetchTrendNews() {
  const result = await db.query<NewsRow>(
    `SELECT id, title, original_url, thumbnail_url, source, published_at, category, summary
     FROM articles
     ORDER BY published_at DESC
     LIMIT 30`
  );

  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    originalUrl: row.original_url,
    source: row.source,
    publishedAt: row.published_at,
    summary: row.summary,
    imageUrl: row.thumbnail_url,
    category: row.category
  }));
}
