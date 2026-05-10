CREATE TABLE IF NOT EXISTS articles (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(500) NOT NULL,
  url          TEXT UNIQUE NOT NULL,
  source       VARCHAR(100),
  thumbnail    TEXT,
  published_at TIMESTAMPTZ,
  sector       VARCHAR(20) NOT NULL,
  category     VARCHAR(50),
  summary      TEXT DEFAULT NULL,
  fetched_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletters (
  id          SERIAL PRIMARY KEY,
  sector      VARCHAR(20) NOT NULL,
  content     TEXT NOT NULL,
  article_ids INTEGER[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concept_cards (
  id           SERIAL PRIMARY KEY,
  concept_name VARCHAR(200) NOT NULL,
  concept_en   VARCHAR(200),
  definition   TEXT,
  explanation  TEXT,
  example      TEXT,
  tags         TEXT[],
  source_type  VARCHAR(20),
  source_id    INTEGER,
  saved_by     UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
