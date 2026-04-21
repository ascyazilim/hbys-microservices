package com.asc.notification.application.service;

import com.asc.notification.application.dto.event.AppointmentCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    public void sendAppointmentConfirmation(AppointmentCreatedEvent event) {
        log.info("--------------------------------------------------");
        log.info("🔔 BİLDİRİM SERVİSİ DEVREDE");
        log.info("📅 Randevu ID: {}", event.appointmentId());
        log.info("👨‍⚕️ Doktor ID: {}", event.doctorId());
        log.info("⏰ Randevu Zamanı: {}", event.appointmentTime());

        log.info("📲 Hastaya (ID: {}) 'Randevunuz onaylanmıştır' SMS'i gönderiliyor...", event.patientId());

        try {
            // SMS gönderim simülasyonu
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        log.info("✅ SMS Başarıyla İletildi!");
        log.info("--------------------------------------------------");
    }
}