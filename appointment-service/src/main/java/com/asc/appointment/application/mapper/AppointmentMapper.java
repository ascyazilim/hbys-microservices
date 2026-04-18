package com.asc.appointment.application.mapper;

import com.asc.appointment.application.dto.request.AppointmentCreateRequest;
import com.asc.appointment.application.dto.response.AppointmentResponse;
import com.asc.appointment.domain.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    // Request'i Entity'ye çevirirken Status'ü otomatik PENDING yapar, ID ve tarihleri yoksayar (veritabanı halledecek)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Appointment toEntity(AppointmentCreateRequest request);

    // Entity'i Response DTO'ya çevirir
    AppointmentResponse toResponse(Appointment appointment);
}