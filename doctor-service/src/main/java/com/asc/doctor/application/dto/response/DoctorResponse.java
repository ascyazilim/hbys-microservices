package com.asc.doctor.application.dto.response;

import com.asc.doctor.domain.enums.DoctorStatus;
import java.util.UUID;

public record DoctorResponse(
        UUID id,
        String personelNo,
        String firstName,
        String lastName,
        String email,
        String phone,
        String specialtyCode,
        Long clinicId,
        DoctorStatus status
) {
}