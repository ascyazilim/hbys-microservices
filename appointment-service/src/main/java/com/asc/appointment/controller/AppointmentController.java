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
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10, sort = "appointmentTime") Pageable pageable) {

        String loggedInUserId = jwt.getSubject();

        // 1. DÜZELTME: realm_access bir JSON Objesidir (Map), onu doğru şekilde açıyoruz
        java.util.Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        boolean isSecretary = false;

        if (realmAccess != null && realmAccess.containsKey("roles")) {
            java.util.List<String> roles = (java.util.List<String>) realmAccess.get("roles");
            // Rolleri büyük harfe çevirip arıyoruz (Keycloak'taki yazım farklarına takılmamak için)
            isSecretary = roles.stream()
                    .map(String::toUpperCase)
                    .anyMatch(role -> role.equals("APPOINTMENT_CREATE") || role.equals("SECRETARY"));
        }

        // 2. GÜVENLİK DUVARI
        if (!isSecretary && !loggedInUserId.equals(doctorId.toString())) {
            throw new AccessDeniedException("Güvenlik İhlali: Sadece kendi randevularınızı görüntüleyebilirsiniz!");
        }

        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId, pageable));
    }


    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAuthority('APPOINTMENT_READ')")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByPatient(
            @PathVariable Long patientId,
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10, sort = "appointmentTime") Pageable pageable) {

        String loggedInUserId = jwt.getSubject();

        // Aynı düzeltmeyi hasta için de yapıyoruz
        java.util.Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        boolean isSecretary = false;

        if (realmAccess != null && realmAccess.containsKey("roles")) {
            java.util.List<String> roles = (java.util.List<String>) realmAccess.get("roles");
            isSecretary = roles.stream()
                    .map(String::toUpperCase)
                    .anyMatch(role -> role.equals("APPOINTMENT_CREATE") || role.equals("SECRETARY"));
        }

        if (!isSecretary && !loggedInUserId.equals(patientId.toString())) {
            throw new AccessDeniedException("Güvenlik İhlali: Sadece kendi randevularınızı görüntüleyebilirsiniz!");
        }

        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId, pageable));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('APPOINTMENT_WRITE')")
    public ResponseEntity<String> cancelAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }
}