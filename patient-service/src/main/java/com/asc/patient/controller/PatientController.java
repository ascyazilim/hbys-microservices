package com.asc.patient.controller;

import com.asc.patient.model.dto.request.CreatePatientRequest;
import com.asc.patient.model.dto.request.UpdatePatientRequest;
import com.asc.patient.model.dto.response.PatientResponse;
import com.asc.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j // SLF4J Loglama aktif
public class PatientController {

    private final PatientService patientService;

    // YENİ HASTA KAYDI
    @PostMapping
    @PreAuthorize("hasAuthority('PATIENT_WRITE')")
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        log.info("API İsteği Alındı: POST /api/patients - Yeni kayıt");
        return new ResponseEntity<>(patientService.createPatient(request), HttpStatus.CREATED);
    }

    // TÜM HASTALARI LİSTELE (SAYFALAMALI)
    @GetMapping
    @PreAuthorize("hasAuthority('PATIENT_READ')")
    public ResponseEntity<Page<PatientResponse>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("API İsteği Alındı: GET /api/patients - Sayfa: {}, Boyut: {}", page, size);
        return ResponseEntity.ok(patientService.getAllPatients(page, size));
    }

    // ID İLE HASTA GETİR
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PATIENT_READ')")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        log.info("API İsteği Alındı: GET /api/patients/{}", id);
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    // TC KİMLİK İLE HASTA GETİR
    @GetMapping("/tc/{tcNo}")
    @PreAuthorize("hasAuthority('PATIENT_READ')")
    public ResponseEntity<PatientResponse> getPatientByTcNo(@PathVariable String tcNo) {
        log.info("API İsteği Alındı: GET /api/patients/tc/{}", tcNo);
        return ResponseEntity.ok(patientService.getPatientByTcNo(tcNo));
    }

    // HASTA GÜNCELLE
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PATIENT_WRITE')")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePatientRequest request) {
        log.info("API İsteği Alındı: PUT /api/patients/{} - Güncelleme", id);
        return ResponseEntity.ok(patientService.updatePatient(id, request));
    }

    // HASTA SİL
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PATIENT_WRITE')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        log.info("API İsteği Alındı: DELETE /api/patients/{}", id);
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}