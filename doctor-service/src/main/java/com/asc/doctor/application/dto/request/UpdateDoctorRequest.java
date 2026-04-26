package com.asc.doctor.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateDoctorRequest(
        @NotBlank(message = "Ad alani bos birakilamaz")
        String firstName,

        @NotBlank(message = "Soyad alani bos birakilamaz")
        String lastName,

        @Email(message = "Gecerli bir e-posta adresi giriniz")
        String email,

        String phone,

        @NotNull(message = "Uzmanlik secimi zorunludur")
        Long specialtyId,

        @NotNull(message = "Klinik secimi zorunludur")
        Long clinicId
) {
}
