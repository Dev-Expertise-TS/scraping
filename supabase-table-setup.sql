-- Supabase scraping 테이블 생성
-- 이 쿼리를 Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS scraping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  web_html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_scraping_url ON scraping(url);
CREATE INDEX IF NOT EXISTS idx_scraping_created_at ON scraping(created_at);

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- ALTER TABLE scraping ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (개발용)
-- CREATE POLICY "Allow all operations on scraping table" ON scraping
--   FOR ALL USING (true) WITH CHECK (true);

-- 테이블 생성 확인
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'scraping'
ORDER BY ordinal_position;
