package com.asc.patient.service;

import com.asc.patient.model.dto.request.CreatePatientRequest;
import com.asc.patient.model.dto.request.UpdatePatientRequest;
import com.asc.patient.model.dto.response.PatientResponse;
import com.asc.patient.model.entity.Patient;
import com.asc.patient.model.mapper.PatientMapper;
import com.asc.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Transactional
    public PatientResponse createPatient(CreatePatientRequest request) {
        log.info("Yeni hasta kayit islemi baslatildi. Istek gelen TC: {}", request.tcNo());

        var existingPatientOpt = patientRepository.findByTcNoIncludingDeleted(request.tcNo());

        if (existingPatientOpt.isPresent()) {
            Patient existingPatient = existingPatientOpt.get();

            if (!existingPatient.isDeleted()) {
                log.warn("Kayit reddedildi. Bu TC Kimlik numarasi sistemde zaten var: {}", request.tcNo());
                throw new IllegalArgumentException(
                        "Bu TC Kimlik numarasi ile sistemde zaten bir hasta kayitli: " + request.tcNo()
                );
            }

            log.info("Silinmis hasta kaydi bulundu. Kayit yeni bilgilerle tekrar aktif ediliyor. TC: {}", request.tcNo());

            existingPatient.setFirstName(request.firstName());
            existingPatient.setLastName(request.lastName());
            existingPatient.setDateOfBirth(request.dateOfBirth());
            existingPatient.setPhoneNumber(request.phoneNumber());
            existingPatient.setGender(request.gender());
            existingPatient.setDeleted(false);

            Patient reactivatedPatient = patientRepository.save(existingPatient);
            log.info("Hasta basariyla yeniden aktif edildi. ID: {}", reactivatedPatient.getId());
            return patientMapper.toResponse(reactivatedPatient);
        }

        Patient patient = patientMapper.toEntity(request);
        Patient savedPatient = patientRepository.save(patient);

        log.info("Hasta basariyla veritabanina kaydedildi. Atanan ID: {}", savedPatient.getId());
        return patientMapper.toResponse(savedPatient);
    }

    public Page<PatientResponse> getAllPatients(int page, int size) {
        log.info("Tum hastalar listeleniyor. Sayfa: {}, Boyut: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Patient> patientPage = patientRepository.findAll(pageable);

        log.info("Toplam {} kayit bulundu.", patientPage.getTotalElements());
        return patientPage.map(patientMapper::toResponse);
    }

    @Cacheable(value = "patients_v2", key = "#id")
    public PatientResponse getPatientById(Long id) {
        log.info("ID'si {} olan hasta araniyor...", id);

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Hata: Veritabaninda {} ID'li hasta bulunamadi.", id);
                    return new IllegalArgumentException("Hasta bulunamadi. ID: " + id);
                });

        log.info("Hasta bulundu: {} {}", patient.getFirstName(), patient.getLastName());
        return patientMapper.toResponse(patient);
    }

    @Cacheable(value = "patients_tc_v2", key = "#tcNo")
    public PatientResponse getPatientByTcNo(String tcNo) {
        log.info("TC Kimlik numarasi {} olan hasta araniyor...", tcNo);

        Patient patient = patientRepository.findByTcNo(tcNo)
                .orElseThrow(() -> {
                    log.error("Hata: Veritabaninda {} TC numarali hasta bulunamadi.", tcNo);
                    return new IllegalArgumentException("Hasta bulunamadi. TC No: " + tcNo);
                });

        log.info("Hasta bulundu: {} {}", patient.getFirstName(), patient.getLastName());
        return patientMapper.toResponse(patient);
    }

    @Caching(evict = {
            @CacheEvict(value = "patients", key = "#id"),
            @CacheEvict(value = "patients_v2", key = "#id"),
            @CacheEvict(value = "patients_tc", allEntries = true),
            @CacheEvict(value = "patients_tc_v2", allEntries = true)
    })
    @Transactional
    public PatientResponse updatePatient(Long id, UpdatePatientRequest request) {
        log.info("{} ID'li hasta icin guncelleme islemi baslatildi.", id);

        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Guncelleme basarisiz: {} ID'li hasta bulunamadi.", id);
                    return new IllegalArgumentException("Guncellenecek hasta bulunamadi. ID: " + id);
                });

        patientMapper.updateEntity(existingPatient, request);
        Patient updatedPatient = patientRepository.save(existingPatient);

        log.info("{} ID'li hasta bilgileri basariyla guncellendi.", id);
        return patientMapper.toResponse(updatedPatient);
    }

    @Caching(evict = {
            @CacheEvict(value = "patients", key = "#id"),
            @CacheEvict(value = "patients_v2", key = "#id"),
            @CacheEvict(value = "patients_tc", allEntries = true),
            @CacheEvict(value = "patients_tc_v2", allEntries = true)
    })
    @Transactional
    public void deletePatient(Long id) {
        log.info("{} ID'li hastayi silme islemi baslatildi.", id);

        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Silme basarisiz: {} ID'li hasta zaten sistemde yok.", id);
                    return new IllegalArgumentException("Silinecek hasta bulunamadi. ID: " + id);
                });

        existingPatient.setDeleted(true);
        patientRepository.save(existingPatient);
        log.info("{} ID'li hasta veritabanindan basariyla silindi.", id);
    }
}
