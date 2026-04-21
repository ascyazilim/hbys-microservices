package com.asc.notification.application.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

// DTO yapısına uygun olarak event paketine aldık
public record AppointmentCreatedEvent(
        UUID appointmentId,
        UUID doctorId,
        Long patientId,
        LocalDateTime appointmentTime
) {
}