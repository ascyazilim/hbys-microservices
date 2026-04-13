package com.asc.patient.service;

import com.asc.patient.model.dto.request.CreatePatientRequest;
import com.asc.patient.model.dto.request.UpdatePatientRequest;
import com.asc.patient.model.dto.response.PatientResponse;
import com.asc.patient.model.entity.Patient;
import com.asc.patient.model.mapper.PatientMapper;
import com.asc.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j // SLF4J Loglama aktif
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    // 1. YENİ KAYIT (CREATE)
    @Transactional
    public PatientResponse createPatient(CreatePatientRequest request) {
        log.info("Yeni hasta kayıt işlemi başlatıldı. İstek gelen TC: {}", request.tcNo());

        if (patientRepository.existsByTcNo(request.tcNo())) {
            log.warn("Kayıt reddedildi! Bu TC Kimlik numarası sistemde zaten var: {}", request.tcNo());
            throw new IllegalArgumentException("Bu TC Kimlik numarası ile sistemde zaten bir hasta kayıtlı: " + request.tcNo());
        }

        Patient patient = patientMapper.toEntity(request);
        Patient savedPatient = patientRepository.save(patient);

        log.info("Hasta başarıyla veritabanına kaydedildi. Atanan ID: {}", savedPatient.getId());
        return patientMapper.toResponse(savedPatient);
    }

    // 2. SAYFALANMIŞ OLARAK TÜMÜNÜ GETİR (READ ALL - PAGINATION)
    public Page<PatientResponse> getAllPatients(int page, int size) {
        log.info("Tüm hastalar listeleniyor. Sayfa: {}, Boyut: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Patient> patientPage = patientRepository.findAll(pageable);

        log.info("Toplam {} kayıt bulundu.", patientPage.getTotalElements());
        return patientPage.map(patientMapper::toResponse);
    }

    // 3. ID'YE GÖRE GETİR (READ BY ID)
    public PatientResponse getPatientById(Long id) {
        log.info("ID'si {} olan hasta aranıyor...", id);

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Hata: Veritabanında {} ID'li hasta bulunamadı!", id);
                    return new IllegalArgumentException("Hasta bulunamadı. ID: " + id);
                });

        log.info("Hasta bulundu: {} {}", patient.getFirstName(), patient.getLastName());
        return patientMapper.toResponse(patient);
    }

    // 4. TC KİMLİK NO'YA GÖRE GETİR (READ BY TC)
    public PatientResponse getPatientByTcNo(String tcNo) {
        log.info("TC Kimlik numarası {} olan hasta aranıyor...", tcNo);

        Patient patient = patientRepository.findByTcNo(tcNo)
                .orElseThrow(() -> {
                    log.error("Hata: Veritabanında {} TC numaralı hasta bulunamadı!", tcNo);
                    return new IllegalArgumentException("Hasta bulunamadı. TC No: " + tcNo);
                });

        log.info("Hasta bulundu: {} {}", patient.getFirstName(), patient.getLastName());
        return patientMapper.toResponse(patient);
    }

    // 5. GÜNCELLEME (UPDATE)
    @Transactional
    public PatientResponse updatePatient(Long id, UpdatePatientRequest request) {
        log.info("{} ID'li hasta için güncelleme işlemi başlatıldı.", id);

        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Güncelleme başarısız: {} ID'li hasta bulunamadı!", id);
                    return new IllegalArgumentException("Güncellenecek hasta bulunamadı. ID: " + id);
                });

        patientMapper.updateEntity(existingPatient, request);
        Patient updatedPatient = patientRepository.save(existingPatient);

        log.info("{} ID'li hasta bilgileri başarıyla güncellendi.", id);
        return patientMapper.toResponse(updatedPatient);
    }

    // 6. SİLME (DELETE)
    @Transactional
    public void deletePatient(Long id) {
        log.info("{} ID'li hastayı silme işlemi başlatıldı.", id);

        if (!patientRepository.existsById(id)) {
            log.warn("Silme başarısız: {} ID'li hasta zaten sistemde yok!", id);
            throw new IllegalArgumentException("Silinecek hasta bulunamadı. ID: " + id);
        }

        patientRepository.deleteById(id);
        log.info("{} ID'li hasta veritabanından başarıyla silindi.", id);
    }
}