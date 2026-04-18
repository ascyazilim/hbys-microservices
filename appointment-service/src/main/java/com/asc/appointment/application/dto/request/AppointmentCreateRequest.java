package com.asc.appointment.application.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentCreateRequest(
        @NotNull(message = "Doktor ID boş olamaz")
        UUID doctorId,

        @NotNull(message = "Hasta ID boş olamaz")
        Long patientId,

        @NotNull(message = "Randevu zamanı boş olamaz")
        @Future(message = "Randevu geçmiş bir zamana alınamaz")
        LocalDateTime appointmentTime
) {}