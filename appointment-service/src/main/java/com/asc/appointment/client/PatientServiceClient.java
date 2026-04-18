package com.asc.appointment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "patient-service", configuration = FeignConfig.class)
public interface PatientServiceClient {

    @GetMapping("/api/patients/{id}")
    Object getPatientById(@PathVariable("id") Long id);
}