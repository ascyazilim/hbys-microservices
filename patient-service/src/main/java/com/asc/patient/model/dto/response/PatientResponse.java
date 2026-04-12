package com.asc.patient.model.dto.response;

import java.time.LocalDate;

public record PatientResponse(
        Long id,
        String tcNo,
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        String phoneNumber,
        String gender
) {
}