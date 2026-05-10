export interface Article {
  id: number;
  title: string;
  original_url: string;
  thumbnail_url: string | null;
  source: string;
  published_at: string;
  category: string;
  summary: string | null;
  summary_generated_at: string | null;
  content: string | null;
}
