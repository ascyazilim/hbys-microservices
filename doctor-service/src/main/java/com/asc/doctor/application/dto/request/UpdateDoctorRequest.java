package com.asc.doctor.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateDoctorRequest(
        @NotBlank(message = "Ad alanı boş bırakılamaz")
        String firstName,

        @NotBlank(message = "Soyad alanı boş bırakılamaz")
        String lastName,

        String email,
        String phone,
        String specialtyCode,

        Long clinicId
) {}