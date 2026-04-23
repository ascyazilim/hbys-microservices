-- 1. Soft Delete için 'is_deleted' kolonu ekliyoruz
ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. Optimistic Locking için 'version' kolonu ekliyoruz
ALTER TABLE patients ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- 3. Performans için is_deleted kolonuna indeks atıyoruz (Sorgularda sürekli 'WHERE is_deleted = false' denilecek)
CREATE INDEX IF NOT EXISTS idx_patients_is_deleted ON patients (is_deleted);