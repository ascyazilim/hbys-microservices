-- Ensure the identity sequence advances beyond the current maximum ID.
-- This prevents duplicate primary key errors after manual inserts or imports.
SELECT setval(
    'patients_id_seq',
    COALESCE((SELECT MAX(id) FROM patients), 0),
    true
);
