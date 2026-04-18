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
import org.springframework.amqp.rabbit.core.RabbitTemplate;
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
    private final AppointmentMapper appointmentMapper; // MAPPER ENJEKTE EDİLDİ
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public String createAppointment(AppointmentCreateRequest request) {

        // 1. Hasta Kontrolü (Record olduğu için getter "patientId()" şeklinde kullanılır)
        try {
            log.info("Hasta bilgisi doğrulanıyor: {}", request.patientId());
            patientServiceClient.getPatientById(request.patientId());
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Randevu alınamadı: Sistemde böyle bir hasta bulunamadı!");
        }

        // 2. Doktor Kontrolü
        try {
            log.info("Doktor bilgisi doğrulanıyor: {}", request.doctorId());
            doctorServiceClient.getDoctorById(request.doctorId());
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Randevu alınamadı: Sistemde böyle bir doktor bulunamadı!");
        }

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

        // 5. YENİ: RABBITMQ'YA MESAJ FIRLATMA
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

    // MAPSTRUCT ILE OTOMATIK DÖNÜŞÜM YAPAN GET METODLARI
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

        // TODO: RabbitMQ -> İptal olayı fırlatılacak!
        return "Randevu başarıyla iptal edildi!";
    }
}