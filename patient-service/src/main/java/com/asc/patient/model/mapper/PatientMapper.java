package com.asc.patient.model.mapper;

import com.asc.patient.model.dto.request.CreatePatientRequest;
import com.asc.patient.model.dto.request.UpdatePatientRequest;
import com.asc.patient.model.dto.response.PatientResponse;
import com.asc.patient.model.entity.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

// componentModel = "spring" sayesinde bu interface bir @Component gibi Spring Context'e eklenir.
// unmappedTargetPolicy = ReportingPolicy.IGNORE eşleşmeyen alanlar için hata fırlatmasını önler.
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientMapper {

    // 1. Yeni kayıtta Request'ten Entity'ye çevir
    Patient toEntity(CreatePatientRequest request);

    // 2. Güncellemede Request'teki verileri var olan Entity'nin üzerine yaz
    void updateEntity(@MappingTarget Patient patient, UpdatePatientRequest request);

    // 3. Entity'den Response'a çevir
    PatientResponse toResponse(Patient patient);

    // 4. Entity Listesinden Response Listesine çevir
    List<PatientResponse> toResponseList(List<Patient> patients);
}