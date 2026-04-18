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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<String> createAppointment(@Valid @RequestBody AppointmentCreateRequest request) {
        String responseMessage = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByDoctor(
            @PathVariable UUID doctorId,
            @PageableDefault(size = 10, sort = "appointmentTime") Pageable pageable) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId, pageable));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByPatient(
            @PathVariable Long patientId,
            @PageableDefault(size = 10, sort = "appointmentTime") Pageable pageable) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId, pageable));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelAppointment(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }
}