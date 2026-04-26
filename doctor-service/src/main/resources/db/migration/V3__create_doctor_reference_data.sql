CREATE SEQUENCE IF NOT EXISTS doctor_personnel_no_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS specialties (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS clinics (
    id BIGINT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO specialties (code, name, active)
VALUES
    ('KARD', 'Kardiyoloji', TRUE),
    ('DAHL', 'Dahiliye', TRUE),
    ('ORTP', 'Ortopedi', TRUE),
    ('GOZ', 'Göz Hastalıkları', TRUE),
    ('KBB', 'Kulak Burun Boğaz', TRUE),
    ('NROL', 'Nöroloji', TRUE),
    ('COCUK', 'Çocuk Sağlığı ve Hastalıkları', TRUE),
    ('CER', 'Cerrahi', TRUE),
    ('GENEL_CERRAHI', 'Genel Cerrahi', TRUE)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    active = EXCLUDED.active;

INSERT INTO clinics (id, code, name, active)
VALUES
    (1, 'GENEL_CERRAHI_KLINIK', 'Genel Cerrahi Kliniği', TRUE),
    (10, 'KARD_KLINIK', 'Kardiyoloji Kliniği', TRUE),
    (15, 'DAHILIYE_KLINIK', 'Dahiliye Kliniği', TRUE),
    (20, 'ORTOPEDI_KLINIK', 'Ortopedi Kliniği', TRUE),
    (30, 'GOZ_KLINIK', 'Göz Hastalıkları Kliniği', TRUE),
    (40, 'NOROLOJI_KLINIK', 'Nöroloji Kliniği', TRUE)
ON CONFLICT (id) DO UPDATE
SET code = EXCLUDED.code,
    name = EXCLUDED.name,
    active = EXCLUDED.active;

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialty_id BIGINT;

UPDATE doctors d
SET specialty_id = s.id
FROM specialties s
WHERE d.specialty_id IS NULL
  AND (
    LOWER(d.specialty_code) = LOWER(s.code)
    OR LOWER(d.specialty_code) = LOWER(s.name)
  );

ALTER TABLE doctors
    ADD CONSTRAINT fk_doctors_specialty
    FOREIGN KEY (specialty_id) REFERENCES specialties (id);

ALTER TABLE doctors
    ADD CONSTRAINT fk_doctors_clinic
    FOREIGN KEY (clinic_id) REFERENCES clinics (id);

ALTER TABLE doctors ALTER COLUMN specialty_id SET NOT NULL;
ALTER TABLE doctors ALTER COLUMN clinic_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_doctors_specialty_id ON doctors (specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors (clinic_id);
