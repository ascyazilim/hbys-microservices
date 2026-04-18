package com.asc.appointment.application.dto.response;

import com.asc.appointment.domain.enums.AppointmentStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID doctorId,
        Long patientId,
        LocalDateTime appointmentTime,
        AppointmentStatus status
) {}