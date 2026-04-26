package com.asc.doctor.application.service;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.request.UpdateDoctorRequest;
import com.asc.doctor.application.dto.response.ClinicResponse;
import com.asc.doctor.application.dto.response.DoctorResponse;
import com.asc.doctor.application.dto.response.SpecialtyResponse;
import com.asc.doctor.application.mapper.DoctorMapper;
import com.asc.doctor.domain.entity.Clinic;
import com.asc.doctor.domain.entity.Doctor;
import com.asc.doctor.domain.entity.Specialty;
import com.asc.doctor.domain.repository.ClinicRepository;
import com.asc.doctor.domain.repository.DoctorRepository;
import com.asc.doctor.domain.repository.SpecialtyRepository;
import com.asc.doctor.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final ClinicRepository clinicRepository;
    private final DoctorMapper doctorMapper;

    @Transactional
    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        Specialty specialty = getActiveSpecialty(request.specialtyId());
        Clinic clinic = getActiveClinic(request.clinicId());

        Optional<Doctor> deletedDoctorByEmail = findDeletedDoctorByEmail(request.email());
        if (deletedDoctorByEmail.isPresent()) {
            Doctor existingDoctor = deletedDoctorByEmail.get();

            existingDoctor.setFirstName(request.firstName().trim());
            existingDoctor.setLastName(request.lastName().trim());
            existingDoctor.setEmail(normalizeNullable(request.email()));
            existingDoctor.setPhone(normalizeNullable(request.phone()));
            existingDoctor.setSpecialtyCode(specialty.getCode());
            existingDoctor.setSpecialty(specialty);
            existingDoctor.setClinic(clinic);
            existingDoctor.setDeleted(false);
            existingDoctor.activate();

            log.info("Silinmis doktor kaydi yeniden aktif hale getirildi. Personel No: {}", existingDoctor.getPersonelNo());
            return doctorMapper.toResponse(doctorRepository.save(existingDoctor));
        }

        validateEmailAvailability(request.email(), null);

        Doctor doctor = doctorMapper.toEntity(request);
        doctor.setPersonelNo(generatePersonnelNo());
        doctor.setEmail(normalizeNullable(request.email()));
        doctor.setPhone(normalizeNullable(request.phone()));
        doctor.setSpecialtyCode(specialty.getCode());
        doctor.setSpecialty(specialty);
        doctor.setClinic(clinic);

        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> getDoctors(String search, Pageable pageable) {
        log.info("Doktor listesi sorgulaniyor. Arama: {}, Sayfa: {}", search, pageable.getPageNumber());
        return doctorRepository.searchDoctors(search, pageable)
                .map(doctorMapper::toResponse);
    }

    @Cacheable(value = "doctors_v2", key = "#id")
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(UUID id) {
        log.info("Doktor bilgisi veritabanindan cekiliyor. ID: {}", id);
        return doctorRepository.findById(id)
                .map(doctorMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Doktor bulunamadi. ID: " + id));
    }

    @CacheEvict(value = "doctors_v2", key = "#id")
    @Transactional
    public DoctorResponse updateDoctor(UUID id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guncellenecek doktor bulunamadi."));

        Specialty specialty = getActiveSpecialty(request.specialtyId());
        Clinic clinic = getActiveClinic(request.clinicId());

        validateEmailAvailability(request.email(), doctor.getId());

        doctor.setFirstName(request.firstName().trim());
        doctor.setLastName(request.lastName().trim());
        doctor.setEmail(normalizeNullable(request.email()));
        doctor.setPhone(normalizeNullable(request.phone()));
        doctor.setSpecialtyCode(specialty.getCode());
        doctor.setSpecialty(specialty);
        doctor.setClinic(clinic);

        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @CacheEvict(value = "doctors_v2", key = "#id")
    @Transactional
    public void deleteDoctor(UUID id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Silinecek doktor bulunamadi.");
        }

        doctorRepository.deleteById(id);
        log.info("Doktor basariyla silindi (soft delete). ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<SpecialtyResponse> getActiveSpecialties() {
        // Not: Klinik ve uzmanlik verileri su an doctor-service icinde tutuluyor.
        // Ileride reference-data-service veya hospital-structure-service gibi ayri bir servise tasinabilir.
        return specialtyRepository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(specialty -> new SpecialtyResponse(specialty.getId(), specialty.getCode(), specialty.getName()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClinicResponse> getActiveClinics() {
        return clinicRepository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(clinic -> new ClinicResponse(clinic.getId(), clinic.getCode(), clinic.getName()))
                .toList();
    }

    private Specialty getActiveSpecialty(Long specialtyId) {
        return specialtyRepository.findByIdAndActiveTrue(specialtyId)
                .orElseThrow(() -> new IllegalArgumentException("Secilen uzmanlik kaydi aktif degil veya bulunamadi."));
    }

    private Clinic getActiveClinic(Long clinicId) {
        return clinicRepository.findByIdAndActiveTrue(clinicId)
                .orElseThrow(() -> new IllegalArgumentException("Secilen klinik kaydi aktif degil veya bulunamadi."));
    }

    private Optional<Doctor> findDeletedDoctorByEmail(String email) {
        String normalizedEmail = normalizeNullable(email);
        if (normalizedEmail == null) {
            return Optional.empty();
        }

        return doctorRepository.findByEmailIncludingDeleted(normalizedEmail)
                .filter(Doctor::isDeleted);
    }

    private void validateEmailAvailability(String email, UUID currentDoctorId) {
        String normalizedEmail = normalizeNullable(email);
        if (normalizedEmail == null) {
            return;
        }

        doctorRepository.findByEmailIncludingDeleted(normalizedEmail)
                .filter(existingDoctor -> currentDoctorId == null || !existingDoctor.getId().equals(currentDoctorId))
                .ifPresent(existingDoctor -> {
                    throw new IllegalArgumentException("Bu e-posta adresi baska bir doktor kaydinda kullaniliyor.");
                });
    }

    private String generatePersonnelNo() {
        long sequenceValue = doctorRepository.getNextPersonnelSequence();
        return "DR-%d-%04d".formatted(Year.now().getValue(), sequenceValue);
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
