package com.asc.appointment.domain.enums;

public enum AppointmentStatus {
    PENDING,    // Randevu alındı, henüz onaylanmadı/gerçekleşmedi
    APPROVED,   // Onaylandı
    COMPLETED,  // Muayene tamamlandı
    CANCELLED   // İptal edildi
}