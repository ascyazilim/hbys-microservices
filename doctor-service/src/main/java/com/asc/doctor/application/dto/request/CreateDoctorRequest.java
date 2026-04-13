package com.asc.doctor.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateDoctorRequest(
        @NotBlank(message = "Personel numarası boş olamaz")
        String personelNo,

        @NotBlank(message = "İsim alanı boş olamaz")
        String firstName,

        @NotBlank(message = "Soyisim alanı boş olamaz")
        String lastName,

        @Email(message = "Geçerli bir e-posta adresi giriniz")
        String email,

        String phone,

        @NotBlank(message = "Uzmanlık kodu boş olamaz")
        String specialtyCode,

        @NotNull(message = "Klinik ID boş olamaz")
        Long clinicId
) {
}