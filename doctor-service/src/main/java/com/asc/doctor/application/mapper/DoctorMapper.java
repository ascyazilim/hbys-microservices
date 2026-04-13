package com.asc.doctor.application.mapper;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.response.DoctorResponse;
import com.asc.doctor.domain.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DoctorMapper {

    Doctor toEntity(CreateDoctorRequest request);

    DoctorResponse toResponse(Doctor doctor);
}