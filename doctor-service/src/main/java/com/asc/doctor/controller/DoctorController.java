package com.asc.doctor.controller;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.request.UpdateDoctorRequest;
import com.asc.doctor.application.dto.response.ClinicResponse;
import com.asc.doctor.application.dto.response.DoctorResponse;
import com.asc.doctor.application.dto.response.SpecialtyResponse;
import com.asc.doctor.application.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Doktor API", description = "Doktor kaydi, listeleme ve referans veri islemleri")
public class DoctorController {

    private final DoctorService doctorService;

    @Operation(summary = "Yeni Doktor Ekle")
    @PostMapping
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<DoctorResponse> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        log.info("API istegi alindi: POST /api/doctors");
        return new ResponseEntity<>(doctorService.createDoctor(request), HttpStatus.CREATED);
    }

    @Operation(summary = "ID ile Doktor Getir")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_READ')")
    public ResponseEntity<DoctorResponse> getDoctorById(
            @Parameter(description = "Doktor UUID degeri") @PathVariable java.util.UUID id) {
        log.info("API istegi alindi: GET /api/doctors/{}", id);
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @Operation(summary = "Doktorlari Listele")
    @GetMapping
    @PreAuthorize("hasAuthority('DOCTOR_READ')")
    public ResponseEntity<Page<DoctorResponse>> getDoctors(
            @RequestParam(required = false) String search,
            @org.springframework.data.web.PageableDefault(size = 10, sort = "firstName") Pageable pageable) {
        log.info("API istegi alindi: GET /api/doctors - Arama: '{}', Sayfa: {}", search, pageable.getPageNumber());
        return ResponseEntity.ok(doctorService.getDoctors(search, pageable));
    }

    @Operation(summary = "Aktif Uzmanliklari Getir")
    @GetMapping("/specialties")
    @PreAuthorize("hasAuthority('DOCTOR_READ')")
    public ResponseEntity<List<SpecialtyResponse>> getActiveSpecialties() {
        return ResponseEntity.ok(doctorService.getActiveSpecialties());
    }

    @Operation(summary = "Aktif Klinikleri Getir")
    @GetMapping("/clinics")
    @PreAuthorize("hasAuthority('DOCTOR_READ')")
    public ResponseEntity<List<ClinicResponse>> getActiveClinics() {
        return ResponseEntity.ok(doctorService.getActiveClinics());
    }

    @Operation(summary = "Doktor Bilgilerini Guncelle")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<DoctorResponse> updateDoctor(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody UpdateDoctorRequest request) {
        log.info("API istegi alindi: PUT /api/doctors/{}", id);
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    @Operation(summary = "Doktoru Sil")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable java.util.UUID id) {
        log.info("API istegi alindi: DELETE /api/doctors/{}", id);
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}
