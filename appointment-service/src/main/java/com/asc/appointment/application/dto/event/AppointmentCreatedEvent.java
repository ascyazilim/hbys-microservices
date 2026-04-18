package com.asc.appointment.application.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

// Kuyruğa gönderilecek mesaj paketi
public record AppointmentCreatedEvent(
        UUID appointmentId,
        UUID doctorId,
        Long patientId,
        LocalDateTime appointmentTime
) {}