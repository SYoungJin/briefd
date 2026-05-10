import OpenAI from "openai";
import { db } from "../config/db";
import { Article } from "../types/article";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function listArticles(limit = 30): Promise<Article[]> {
  const result = await db.query<Article>(
    `SELECT id, title, original_url, thumbnail_url, source, published_at, category, summary, summary_generated_at, content
     FROM articles
     ORDER BY published_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function getArticleById(id: number): Promise<Article | null> {
  const result = await db.query<Article>(
    `SELECT id, title, original_url, thumbnail_url, source, published_at, category, summary, summary_generated_at, content
     FROM articles
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function summarizeArticleById(id: number) {
  const article = await getArticleById(id);
  if (!article) {
    return null;
  }

  if (article.summary) {
    return {
      id: article.id,
      summary: article.summary,
      cached: true
    };
  }

  const input = article.content
    ? `${article.title}\n\n${article.content.slice(0, 1000)}`
    : `${article.title}\n\n${article.original_url}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content:
          "다음 기사를 한국어로 3줄 이내로 핵심만 요약해줘. 각 줄은 \"•\"로 시작해줘.\n\n" + input
      }
    ],
    temperature: 0.2
  });

  const generatedSummary = completion.choices[0]?.message?.content?.trim() ?? "• 요약 생성에 실패했습니다.";

  await db.query(
    `UPDATE articles
     SET summary = $1,
         summary_generated_at = NOW()
     WHERE id = $2`,
    [generatedSummary, id]
  );

  return {
    id: article.id,
    summary: generatedSummary,
    cached: false
  };
}
