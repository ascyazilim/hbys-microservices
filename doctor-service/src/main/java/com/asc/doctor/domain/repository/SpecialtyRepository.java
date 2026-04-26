package com.asc.doctor.domain.repository;

import com.asc.doctor.domain.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {

    List<Specialty> findAllByActiveTrueOrderByNameAsc();

    Optional<Specialty> findByIdAndActiveTrue(Long id);
}
