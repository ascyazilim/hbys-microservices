package com.asc.appointment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

// name = Eureka'ya kayıtlı olan servis adı
@FeignClient(name = "doctor-service", configuration = FeignConfig.class)
public interface DoctorServiceClient {

    // Doctor servisindeki bir GET endpoint'ini çağıracağız
    @GetMapping("/api/doctors/{id}")
    Object getDoctorById(@PathVariable("id") UUID id);
    // Not: Object yerine ileride DoctorResponse DTO'su döneceğiz
}