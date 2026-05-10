export type Sector = "trend" | "research";

export interface Article {
  id: number;
  title: string;
  url: string;
  source: string | null;
  thumbnail: string | null;
  published_at: string | null;
  sector: Sector;
  category: string | null;
  summary: string | null;
}

export interface ConceptCardItem {
  concept_name: string;
  concept_en: string;
  definition: string;
  explanation: string;
  example: string;
  tags: string[];
}
