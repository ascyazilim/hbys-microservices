-- Eğer statüsü 'CANCELLED' (İptal) değilse, bir doktorun aynı saatte sadece 1 randevusu olabilir!
-- İki kişi aynı anda INSERT atmaya kalkarsa, PostgreSQL ikinciye acımaz ve anında "Unique Constraint" hatası fırlatır.
CREATE UNIQUE INDEX IF NOT EXISTS uk_appointments_doctor_time
    ON appointments (doctor_id, appointment_time)
    WHERE status != 'CANCELLED';