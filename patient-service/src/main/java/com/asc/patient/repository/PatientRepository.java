package com.asc.patient.repository;

import com.asc.patient.model.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Spring Data JPA'nın büyüsü: Sadece metot ismini yazarak SQL sorgusu ürettiriyoruz!
    // Bu metot, veritabanında bu TC numarasına sahip bir hasta olup olmadığını kontrol edecek.
    boolean existsByTcNo(String tcNo);

    // TC numarasına göre hastayı bulma metodu
    Optional<Patient> findByTcNo(String tcNo);
}