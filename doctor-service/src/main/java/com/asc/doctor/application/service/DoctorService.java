package com.asc.doctor.application.service;

import com.asc.doctor.application.dto.request.CreateDoctorRequest;
import com.asc.doctor.application.dto.response.DoctorResponse;
import com.asc.doctor.domain.entity.Doctor;
import com.asc.doctor.application.mapper.DoctorMapper;
import com.asc.doctor.domain.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;

    @Transactional
    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        log.info("Yeni doktor kayıt işlemi başlatıldı. Personel No: {}", request.personelNo());

        // Business Validations (İş Kuralları)
        if (doctorRepository.existsByPersonelNo(request.personelNo())) {
            log.warn("Kayıt reddedildi! Bu personel numarası zaten kullanımda: {}", request.personelNo());
            throw new IllegalArgumentException("Bu personel numarası ile sistemde zaten bir doktor kayıtlı.");
        }

        if (request.email() != null && doctorRepository.existsByEmail(request.email())) {
            log.warn("Kayıt reddedildi! Bu e-posta adresi zaten kullanımda: {}", request.email());
            throw new IllegalArgumentException("Bu e-posta adresi başka bir doktora ait.");
        }

        Doctor doctor = doctorMapper.toEntity(request);
        Doctor savedDoctor = doctorRepository.save(doctor);

        log.info("Doktor başarıyla veritabanına kaydedildi. Atanan ID: {}", savedDoctor.getId());
        return doctorMapper.toResponse(savedDoctor);
    }
}