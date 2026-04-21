-- 1. Hastaların randevularını sayfalayarak getirirken (findAllByPatientId) kullanılacak indeks.
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_id);

-- 2. BİLEŞİK İNDEKS (Composite Index)
-- Çakışma kontrolü (existsByDoctorIdAndAppointmentTimeAndStatusNot) için özel tasarlandı.
-- Not: Bu indeks 'doctor_id' ile başladığı için, sadece doktorun randevularını listelediğimiz (findAllByDoctorId) sorguyu da otomatik olarak hızlandırır. Bu yüzden sadece doctor_id için ekstra bir indeks yazmamıza gerek yoktur.
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_time_status ON appointments (doctor_id, appointment_time, status);