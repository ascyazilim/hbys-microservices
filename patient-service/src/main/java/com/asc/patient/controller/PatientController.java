package com.asc.patient.controller;

import com.asc.patient.model.dto.request.CreatePatientRequest;
import com.asc.patient.model.dto.request.UpdatePatientRequest;
import com.asc.patient.model.dto.response.PatientResponse;
import com.asc.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    // YENİ HASTA KAYDI (Sadece Yazma Yetkisi Olanlar: Sekreter, Admin vs.)
    @PostMapping
    @PreAuthorize("hasAuthority('PATIENT_WRITE')")
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        return new ResponseEntity<>(patientService.createPatient(request), HttpStatus.CREATED);
    }

    //TÜM HASTALARI LİSTELE - PAGEABLE (Okuma Yetkisi Olanlar: Doktor, Sekreter vs.)
    @GetMapping
    @PreAuthorize("hasAuthority('PATIENT_READ')")
    public ResponseEntity<Page<PatientResponse>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Not: Sayfalama indeksleri 0'dan başlar. Yani 1. sayfa için page=0 gönderilir.
        return ResponseEntity.ok(patientService.getAllPatients(page, size));
    }

    // ID İLE HASTA GETİR
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PATIENT_READ')")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    // TC KİMLİK İLE HASTA GETİR (Endpoint çakışmaması için /tc/ öneki koyduk)
    @GetMapping("/tc/{tcNo}")
    @PreAuthorize("hasAuthority('PATIENT_READ')")
    public ResponseEntity<PatientResponse> getPatientByTcNo(@PathVariable String tcNo) {
        return ResponseEntity.ok(patientService.getPatientByTcNo(tcNo));
    }

    // HASTA GÜNCELLE
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PATIENT_WRITE')")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePatientRequest request) {
        return ResponseEntity.ok(patientService.updatePatient(id, request));
    }

    // HASTA SİL
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PATIENT_WRITE')")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build(); // 204 No Content döner
    }
}