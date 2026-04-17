package com.asc.doctor.domain.repository;

import com.asc.doctor.domain.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    // Business validasyonları için gerekli sorgular
    boolean existsByPersonelNo(String personelNo);
    boolean existsByEmail(String email);

    @Query("SELECT d FROM Doctor d WHERE " +
            "(:search IS NULL OR LOWER(d.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Doctor> searchDoctors(@Param("search") String search, Pageable pageable);
}