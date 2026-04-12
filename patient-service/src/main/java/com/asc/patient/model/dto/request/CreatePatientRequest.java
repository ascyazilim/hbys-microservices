package com.asc.patient.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreatePatientRequest(
        @NotBlank(message = "TC Kimlik numarası boş bırakılamaz")
        @Size(min = 11, max = 11, message = "TC Kimlik numarası tam 11 hane olmalıdır")
        @Pattern(regexp = "^[0-9]+$", message = "TC Kimlik numarası sadece rakamlardan oluşmalıdır")
        String tcNo,

        @NotBlank(message = "İsim alanı boş bırakılamaz")
        String firstName,

        @NotBlank(message = "Soyisim alanı boş bırakılamaz")
        String lastName,

        LocalDate dateOfBirth,
        String phoneNumber,
        String gender
) {
}
