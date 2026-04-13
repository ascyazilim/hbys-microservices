package com.asc.doctor.controller;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.response.DoctorResponse;
import com.asc.doctor.application.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Slf4j
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<DoctorResponse> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        log.info("API İsteği Alındı: POST /api/doctors - Yeni doktor kaydı");
        return new ResponseEntity<>(doctorService.createDoctor(request), HttpStatus.CREATED);
    }
}