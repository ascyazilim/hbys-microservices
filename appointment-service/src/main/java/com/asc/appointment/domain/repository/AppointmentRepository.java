package com.asc.appointment.domain.repository;

import com.asc.appointment.domain.entity.Appointment;
import com.asc.appointment.domain.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // ÇAKIŞMA KONTROLÜ
    boolean existsByDoctorIdAndAppointmentTimeAndStatusNot(
            UUID doctorId,
            LocalDateTime appointmentTime,
            AppointmentStatus status
    );

    // Doktora göre sayfalayarak getir
    Page<Appointment> findAllByDoctorId(UUID doctorId, Pageable pageable);

    // Hastaya göre sayfalayarak getir
    Page<Appointment> findAllByPatientId(Long patientId, Pageable pageable);
}