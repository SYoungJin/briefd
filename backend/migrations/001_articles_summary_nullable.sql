-- 1) summary를 온디맨드 생성 방식에 맞게 nullable로 유지
ALTER TABLE IF EXISTS articles
  ALTER COLUMN summary DROP NOT NULL,
  ALTER COLUMN summary SET DEFAULT NULL;

-- 2) 요약 생성 시점을 기록할 컬럼
ALTER TABLE IF EXISTS articles
  ADD COLUMN IF NOT EXISTS summary_generated_at TIMESTAMPTZ DEFAULT NULL;
