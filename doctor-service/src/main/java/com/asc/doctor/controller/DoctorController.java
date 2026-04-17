package com.asc.doctor.controller;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.request.UpdateDoctorRequest;
import com.asc.doctor.application.dto.response.DoctorResponse;
import com.asc.doctor.application.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_READ')")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable java.util.UUID id) {
        log.info("API İsteği Alındı: GET /api/doctors/{} - Tekil doktor getir", id);
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('DOCTOR_READ')")
    public ResponseEntity<Page<DoctorResponse>> getDoctors(
            @RequestParam(required = false) String search,
            @org.springframework.data.web.PageableDefault(size = 10, sort = "firstName") Pageable pageable) {
        return ResponseEntity.ok(doctorService.getDoctors(search, pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<DoctorResponse> updateDoctor(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody UpdateDoctorRequest request) {
        log.info("API İsteği Alındı: PUT /api/doctors/{} - Doktor güncelle", id);
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable java.util.UUID id) {
        log.info("API İsteği Alındı: DELETE /api/doctors/{} - Doktor sil", id);
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build(); // 204 No Content döner (Silme başarılı, içerik yok)
    }
}