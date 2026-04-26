package com.asc.appointment.application.service;

import com.asc.appointment.application.dto.event.AppointmentCreatedEvent;
import com.asc.appointment.application.dto.request.AppointmentCreateRequest;
import com.asc.appointment.application.dto.response.AppointmentResponse;
import com.asc.appointment.application.mapper.AppointmentMapper;
import com.asc.appointment.client.DoctorServiceClient;
import com.asc.appointment.client.PatientServiceClient;
import com.asc.appointment.config.RabbitMQConfig;
import com.asc.appointment.domain.entity.Appointment;
import com.asc.appointment.domain.enums.AppointmentStatus;
import com.asc.appointment.domain.repository.AppointmentRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final AppointmentMapper appointmentMapper;
    private final RabbitTemplate rabbitTemplate;

    // SPRING PROXY ÇÖZÜMÜ: Sınıfın kendi proxy'sini içeri alıyoruz (Redis için şart!)
    @Autowired
    @Lazy
    private AppointmentService self;

    @Transactional
    public String createAppointment(AppointmentCreateRequest request) {

        // 1. Hasta Kontrolü (Proxy üzerinden çağırıyoruz ki Redis devreye girsin)
        self.validatePatient(request.patientId());

        // 2. Doktor Kontrolü (Proxy üzerinden çağırıyoruz)
        self.validateDoctor(request.doctorId());

        // 3. Çakışma Kontrolü
        boolean isTimeSlotTaken = appointmentRepository.existsByDoctorIdAndAppointmentTimeAndStatusNot(
                request.doctorId(),
                request.appointmentTime(),
                AppointmentStatus.CANCELLED
        );

        if (isTimeSlotTaken) {
            throw new RuntimeException("Randevu alınamadı: Doktorun bu saati dolu!");
        }

        // 4. Mapper ile Dönüştür ve Kaydet
        Appointment appointment = appointmentMapper.toEntity(request);
        appointmentRepository.save(appointment);

        log.info("Randevu başarıyla oluşturuldu! ID: {}", appointment.getId());

        // 5. RABBITMQ'YA MESAJ FIRLATMA
        AppointmentCreatedEvent event = new AppointmentCreatedEvent(
                appointment.getId(),
                appointment.getDoctorId(),
                appointment.getPatientId(),
                appointment.getAppointmentTime()
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_APPOINTMENT,
                RabbitMQConfig.ROUTING_KEY_APPOINTMENT_CREATED,
                event
        );
        log.info("RabbitMQ'ya 'Randevu Oluşturuldu' olayı fırlatıldı!");

        return "Randevu başarıyla oluşturuldu!";
    }

    // --- REDIS CACHE Ve CIRCUIT BREAKER METODLARI ---

    // Eğer hasta Redis'te varsa bu metod HİÇ ÇALIŞMAZ, doğrudan 'true' döner.
    // Yoksa çalışır, Feign'e gider, başarılıysa Redis'e 'true' yazar. (Hata fırlatırsa Redis'e KESİNLİKLE yazmaz)
    @Cacheable(value = "appointment_patient_validation_v1", key = "#patientId")
    @CircuitBreaker(name = "patientService", fallbackMethod = "patientFallback")
    public boolean validatePatient(Long patientId) {
        try {
            log.info("Hasta bilgisi doğrulanıyor (Cache Miss - Feign Çağrısı): {}", patientId);
            patientServiceClient.getPatientById(patientId);
            return true;
        } catch (FeignException.NotFound e) {
            // Eğer 404 dönerse bu bir çökme değil, "kayıt yok" demektir. Şalter atmaz.
            throw new RuntimeException("Randevu alınamadı: Sistemde böyle bir hasta bulunamadı!");
        }
    }

    // B PLANI (FALLBACK): Eğer patient-service çökerse veya şalter atarsa bu metod çalışır!
    // DİKKAT: Metod imzası ana metodla aynı olmalı ve sonuna Throwable eklenmelidir.
    public boolean patientFallback(Long patientId, Throwable t) {
        log.error("Patient Service şu an hizmet veremiyor! Hata: {}", t.getMessage());
        throw new RuntimeException("Şu anda hasta doğrulama sistemi çökmüş durumda, lütfen daha sonra tekrar deneyin.");
    }

    @Cacheable(value = "appointment_doctor_validation_v1", key = "#doctorId")
    @CircuitBreaker(name = "doctorService", fallbackMethod = "doctorFallback")
    public boolean validateDoctor(UUID doctorId) {
        try {
            log.info("Doktor bilgisi doğrulanıyor (Cache Miss - Feign Çağrısı): {}", doctorId);
            doctorServiceClient.getDoctorById(doctorId);
            return true;
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Randevu alınamadı: Sistemde böyle bir doktor bulunamadı!");
        }
    }

    // B PLANI (FALLBACK): Eğer doctor-service çökerse çalışır!
    public boolean doctorFallback(UUID doctorId, Throwable t) {
        log.error("Doctor Service şu an hizmet veremiyor! Hata: {}", t.getMessage());
        throw new RuntimeException("Şu anda doktor doğrulama sistemi çökmüş durumda, lütfen daha sonra tekrar deneyin.");
    }

    // --- GET VE CANCEL METODLARI (Aynı Kaldı) ---

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointmentsByDoctor(UUID doctorId, Pageable pageable) {
        log.info("Doktor ID'ye göre randevular sayfalayarak getiriliyor: {}", doctorId);
        return appointmentRepository.findAllByDoctorId(doctorId, pageable)
                .map(appointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointmentsByPatient(Long patientId, Pageable pageable) {
        log.info("Hasta ID'ye göre randevular sayfalayarak getiriliyor: {}", patientId);
        return appointmentRepository.findAllByPatientId(patientId, pageable)
                .map(appointmentMapper::toResponse);
    }

    @Transactional
    public String cancelAppointment(UUID appointmentId) {
        log.info("Randevu iptal ediliyor: {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Randevu bulunamadı!"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Bu randevu zaten iptal edilmiş!");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Tamamlanmış bir randevu iptal edilemez!");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        return "Randevu başarıyla iptal edildi!";
    }
}
