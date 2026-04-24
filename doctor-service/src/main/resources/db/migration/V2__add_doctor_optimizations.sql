-- 1. Ayrılan doktorlar için Soft Delete kolonu
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. Çakışmalar için Optimistic Locking
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- 3. PERFORMANS: Branşa göre doktor arama (Örn: Kardiyoloji) işlemini ışık hızına çıkarır
CREATE INDEX IF NOT EXISTS idx_doctors_branch ON doctors (specialty_code);

-- 4. Metin içi aramaları (LIKE %...%) hızlandırmak için PostgreSQL'in Trigram eklentisini açıyoruz
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 5. İsim ve Soyisim aramaları için özel GIN (Trigram) indeksi oluşturuyoruz
CREATE INDEX IF NOT EXISTS idx_doctors_name_trgm ON doctors USING gin ((first_name || ' ' || last_name) gin_trgm_ops);