package com.asc.appointment.controller;

import com.asc.appointment.application.dto.request.AppointmentCreateRequest;
import com.asc.appointment.application.dto.response.AppointmentResponse;
import com.asc.appointment.application.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAuthority('APPOINTMENT_CREATE')")
    public ResponseEntity<String> createAppointment(@Valid @RequestBody AppointmentCreateRequest request) {
        String responseMessage = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByDoctor(
            @PathVariable UUID doctorId,
            @AuthenticationPrincipal Jwt jwt, // 1. SİHİR: İsteği atan kişinin Keycloak Biletini (Token) yakalıyoruz
            @PageableDefault(size = 10, sort = "appointmentTime") Pageable pageable) {

        // 2. Token'ın kime ait olduğunu (Keycloak 'sub' / User ID alanı) alıyoruz
        String loggedInUserId = jwt.getSubject();

        // 3. İsteği atan kişi bir "Sekreter" mi diye yetkilerine bakıyoruz
        // (Sekreterlerin başkasının randevusunu görme hakkı olmalı)
        boolean isSecretary = jwt.getClaimAsStringList("realm_access").contains("APPOINTMENT_CREATE");

        // 4. GÜVENLİK DUVARI: Eğer sekreter DEĞİLSE ve URL'deki ID ile Token'daki ID EŞLEŞMİYORSA
        if (!isSecretary && !loggedInUserId.equals(doctorId.toString())) {
            throw new AccessDeniedException("Güvenlik İhlali: Sadece kendi randevularınızı görüntüleyebilirsiniz!");
        }

        // Kontrollerden geçtiyse veriyi getir
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId, pageable));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByPatient(
            @PathVariable Long patientId,
            @AuthenticationPrincipal Jwt jwt, // 1. Bilet (Token) yakalanıyor
            @PageableDefault(size = 10, sort = "appointmentTime") Pageable pageable) {

        // 2. İsteği atan kişi yetkili bir personel mi? (Sekreter vb.)
        // Eğer "APPOINTMENT_CREATE" yetkisi varsa tüm hastaları görebilir.
        boolean isPrivilegedUser = jwt.getClaimAsStringList("realm_access") != null &&
                jwt.getClaimAsStringList("realm_access").contains("APPOINTMENT_CREATE");

        // 3. Hastanın kimlik doğrulaması (Long ID vs Keycloak UUID uyuşmazlığı çözümü)
        // Eğer Keycloak tarafında "patient_id" diye özel bir claim (Custom Mapper) oluşturduysan:
        // String tokenPatientId = jwt.getClaimAsString("patient_id");

        // VEYA Keycloak'ta kullanıcı adı (preferred_username) olarak TC No tutuyorsan,
        // TC No üzerinden karşılaştırma yapmak en sağlıklısıdır. Şimdilik ID üzerinden gidiyoruz:
        String loggedInUserId = jwt.getSubject();

        // 4. GÜVENLİK DUVARI
        if (!isPrivilegedUser && !loggedInUserId.equals(patientId.toString())) {
            throw new AccessDeniedException("Güvenlik İhlali: Sadece kendi randevularınızı görüntüleyebilirsiniz!");
        }

        // Kontrollerden geçtiyse veriyi getir
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId, pageable));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('APPOINTMENT_WRITE')")
    public ResponseEntity<String> cancelAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }
}