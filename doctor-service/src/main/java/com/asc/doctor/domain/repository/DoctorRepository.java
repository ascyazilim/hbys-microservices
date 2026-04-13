package com.asc.doctor.domain.repository;

import com.asc.doctor.domain.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    // Business validasyonları için gerekli sorgular
    boolean existsByPersonelNo(String personelNo);
    boolean existsByEmail(String email);
}