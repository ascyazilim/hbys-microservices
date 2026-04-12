package com.asc.patient.service;

import com.asc.patient.model.dto.request.CreatePatientRequest;
import com.asc.patient.model.dto.request.UpdatePatientRequest;
import com.asc.patient.model.dto.response.PatientResponse;
import com.asc.patient.model.entity.Patient;
import com.asc.patient.model.mapper.PatientMapper;
import com.asc.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    // 1. YENİ KAYIT (CREATE)
    @Transactional
    public PatientResponse createPatient(CreatePatientRequest request) {
        if (patientRepository.existsByTcNo(request.tcNo())) {
            throw new IllegalArgumentException("Bu TC Kimlik numarası ile sistemde zaten bir hasta kayıtlı: " + request.tcNo());
        }

        Patient patient = patientMapper.toEntity(request); // MapStruct Büyüsü
        Patient savedPatient = patientRepository.save(patient);

        return patientMapper.toResponse(savedPatient);
    }

    // 2. SAYFALANMIŞ OLARAK TÜMÜNÜ GETİR (PAGINATION)
    public Page<PatientResponse> getAllPatients(int page, int size) {
        // En son eklenen hastalar en üstte (ilk sayfada) görünsün diye "id"ye göre azalan (DESC) sıralama ekliyoruz
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        // Veritabanından sadece o sayfanın kayıtları çekilir
        Page<Patient> patientPage = patientRepository.findAll(pageable);

        // Spring Data'nın Page nesnesi, içindeki verileri çevirmek için harika bir .map() fonksiyonu sunar.
        // Burada MapStruct'ın yazdığı toResponse metodunu her bir kayıt için çağırıyoruz.
        return patientPage.map(patientMapper::toResponse);
    }

    // 3. ID'YE GÖRE GETİR (READ BY ID)
    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Hasta bulunamadı. ID: " + id));
        return patientMapper.toResponse(patient);
    }

    // 4. TC KİMLİK NO'YA GÖRE GETİR (READ BY TC)
    public PatientResponse getPatientByTcNo(String tcNo) {
        Patient patient = patientRepository.findByTcNo(tcNo)
                .orElseThrow(() -> new IllegalArgumentException("Hasta bulunamadı. TC No: " + tcNo));
        return patientMapper.toResponse(patient);
    }

    // 5. GÜNCELLEME (UPDATE)
    @Transactional
    public PatientResponse updatePatient(Long id, UpdatePatientRequest request) {
        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Güncellenecek hasta bulunamadı. ID: " + id));

        // DTO'daki bilgileri var olan Entity'nin üzerine yazar (TC ve ID değişmez)
        patientMapper.updateEntity(existingPatient, request);

        Patient updatedPatient = patientRepository.save(existingPatient);
        return patientMapper.toResponse(updatedPatient);
    }

    // 6. SİLME (DELETE)
    @Transactional
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new IllegalArgumentException("Silinecek hasta bulunamadı. ID: " + id);
        }
        patientRepository.deleteById(id);
    }
}