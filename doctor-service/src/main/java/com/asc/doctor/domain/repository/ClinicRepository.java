package com.asc.doctor.domain.repository;

import com.asc.doctor.domain.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {

    List<Clinic> findAllByActiveTrueOrderByNameAsc();

    Optional<Clinic> findByIdAndActiveTrue(Long id);
}
