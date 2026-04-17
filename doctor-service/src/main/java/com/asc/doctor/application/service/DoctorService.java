package com.asc.doctor.application.service;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.request.UpdateDoctorRequest;
import com.asc.doctor.application.dto.response.DoctorResponse;
import com.asc.doctor.domain.entity.Doctor;
import com.asc.doctor.application.mapper.DoctorMapper;
import com.asc.doctor.domain.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;

    @Transactional
    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        log.info("Yeni doktor kayıt işlemi başlatıldı. Personel No: {}", request.personelNo());
        if (doctorRepository.existsByPersonelNo(request.personelNo())) {
            throw new IllegalArgumentException("Bu personel numarası zaten kullanımda.");
        }
        if (request.email() != null && doctorRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Bu e-posta adresi başka bir doktora ait.");
        }

        Doctor doctor = doctorMapper.toEntity(request);
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> getDoctors(String search, Pageable pageable) {
        log.info("Doktor listesi sorgulanıyor. Arama: {}, Sayfa: {}", search, pageable.getPageNumber());
        return doctorRepository.searchDoctors(search, pageable)
                .map(doctorMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(UUID id) {
        return doctorRepository.findById(id)
                .map(doctorMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Doktor bulunamadı. ID: " + id));
    }

    @Transactional
    public DoctorResponse updateDoctor(UUID id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Güncellenecek doktor bulunamadı."));

        doctor.setFirstName(request.firstName());
        doctor.setLastName(request.lastName());
        doctor.setEmail(request.email());
        doctor.setPhone(request.phone());
        doctor.setSpecialtyCode(request.specialtyCode());
        doctor.setClinicId(request.clinicId());

        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public void deleteDoctor(UUID id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Silinecek doktor bulunamadı.");
        }
        doctorRepository.deleteById(id);
        log.info("Doktor başarıyla silindi. ID: {}", id);
    }
}