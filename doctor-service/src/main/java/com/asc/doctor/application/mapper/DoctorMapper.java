package com.asc.doctor.application.mapper;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.response.DoctorResponse;
import com.asc.doctor.domain.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DoctorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personelNo", ignore = true)
    @Mapping(target = "specialtyCode", ignore = true)
    @Mapping(target = "specialty", ignore = true)
    @Mapping(target = "clinic", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Doctor toEntity(CreateDoctorRequest request);

    @Mapping(target = "specialtyId", source = "specialty.id")
    @Mapping(target = "specialtyName", source = "specialty.name")
    @Mapping(target = "clinicId", source = "clinic.id")
    @Mapping(target = "clinicName", source = "clinic.name")
    DoctorResponse toResponse(Doctor doctor);
}
