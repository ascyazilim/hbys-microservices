package com.asc.patient.model.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record UpdatePatientRequest(
        @NotBlank(message = "İsim alanı boş bırakılamaz")
        String firstName,

        @NotBlank(message = "Soyisim alanı boş bırakılamaz")
        String lastName,

        LocalDate dateOfBirth,
        String phoneNumber,
        String gender
) {
}
