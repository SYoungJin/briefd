CREATE TABLE IF NOT EXISTS user_settings (
  id          SERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) UNIQUE,
  openai_key  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
