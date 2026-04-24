package com.asc.doctor.controller;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.request.UpdateDoctorRequest;
import com.asc.doctor.application.dto.response.DoctorResponse;
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

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Doktor API", description = "Hastane doktorlarının kayıt, arama ve listeleme işlemleri")
public class DoctorController {

    private final DoctorService doctorService;

    @Operation(summary = "Yeni Doktor Ekle", description = "Sisteme yeni bir doktor kaydı oluşturur.")
    @PostMapping
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<DoctorResponse> createDoctor(@Valid @RequestBody CreateDoctorRequest request) {
        log.info("API İsteği Alındı: POST /api/doctors - Yeni doktor kaydı");
        return new ResponseEntity<>(doctorService.createDoctor(request), HttpStatus.CREATED);
    }

    @Operation(summary = "ID ile Doktor Getir", description = "UUID değerine göre tek bir doktorun detaylarını getirir (Redis Cache destekli).")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_READ')")
    public ResponseEntity<DoctorResponse> getDoctorById(
            @Parameter(description = "Doktorun benzersiz UUID'si") @PathVariable java.util.UUID id) {
        log.info("API İsteği Alındı: GET /api/doctors/{} - Tekil doktor getir", id);
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @Operation(summary = "Doktorlarda Arama Yap", description = "İsim veya soyisime göre akıllı arama (Trigram) yapar. Parametre boşsa tümünü sayfalar.")
    @GetMapping
    @PreAuthorize("hasAuthority('DOCTOR_READ')")
    public ResponseEntity<Page<DoctorResponse>> getDoctors(
            @Parameter(description = "Aranacak isim veya soyisim (Örn: Ahmet Yılmaz)") @RequestParam(required = false) String search,
            @org.springframework.data.web.PageableDefault(size = 10, sort = "firstName") Pageable pageable) {

        log.info("API İsteği Alındı: GET /api/doctors - Arama: '{}', Sayfa: {}", search, pageable.getPageNumber());
        return ResponseEntity.ok(doctorService.getDoctors(search, pageable));
    }

    @Operation(summary = "Doktor Bilgilerini Güncelle", description = "Mevcut doktorun bilgilerini günceller ve eski önbelleği (Cache) temizler.")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<DoctorResponse> updateDoctor(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody UpdateDoctorRequest request) {
        log.info("API İsteği Alındı: PUT /api/doctors/{} - Doktor güncelle", id);
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    @Operation(summary = "Doktoru Sil (Soft Delete)", description = "Doktoru pasif duruma çeker, geçmiş kayıtların bozulmasını engeller.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCTOR_WRITE')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable java.util.UUID id) {
        log.info("API İsteği Alındı: DELETE /api/doctors/{} - Doktor sil", id);
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}