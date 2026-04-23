package com.asc.patient.repository;

import com.asc.patient.model.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Spring Data JPA'nın büyüsü: Sadece metot ismini yazarak SQL sorgusu ürettiriyoruz!
    // Bu metot, veritabanında bu TC numarasına sahip bir hasta olup olmadığını kontrol edecek.
    boolean existsByTcNo(String tcNo);

    // TC numarasına göre hastayı bulma metodu
    Optional<Patient> findByTcNo(String tcNo);

    // BÜYÜK KURTARICI: Hibernate kısıtlamalarını ezip, silinmiş (Soft Delete) kayıtlar dahil tüm tabloyu TC ile arar
    @Query(value = "SELECT * FROM patients WHERE tc_no = :tcNo", nativeQuery = true)
    Optional<Patient> findByTcNoIncludingDeleted(@Param("tcNo") String tcNo);
}