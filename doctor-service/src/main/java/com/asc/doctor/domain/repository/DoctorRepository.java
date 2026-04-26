package com.asc.doctor.domain.repository;

import com.asc.doctor.domain.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    @Override
    @EntityGraph(attributePaths = {"specialty", "clinic"})
    Optional<Doctor> findById(UUID id);

    @Query(value = "SELECT * FROM doctors WHERE personel_no = :personelNo", nativeQuery = true)
    Optional<Doctor> findByPersonelNoIncludingDeleted(@Param("personelNo") String personelNo);

    @Query(value = "SELECT * FROM doctors WHERE email = :email", nativeQuery = true)
    Optional<Doctor> findByEmailIncludingDeleted(@Param("email") String email);

    @EntityGraph(attributePaths = {"specialty", "clinic"})
    @Query("SELECT d FROM Doctor d WHERE " +
            ":search IS NULL OR :search = '' OR " +
            "LOWER(d.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(CONCAT(d.firstName, ' ', d.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Doctor> searchDoctors(@Param("search") String search, Pageable pageable);

    @Query(value = "SELECT nextval('doctor_personnel_no_seq')", nativeQuery = true)
    Long getNextPersonnelSequence();
}
