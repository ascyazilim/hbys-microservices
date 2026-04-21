package com.asc.notification.listener;

import com.asc.notification.application.dto.event.AppointmentCreatedEvent;
import com.asc.notification.application.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AppointmentEventListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = "appointment.created.queue")
    public void handleAppointmentCreated(AppointmentCreatedEvent event) {
        // Gelen olayı yakalar ve iş mantığı için Service katmanına devreder
        notificationService.sendAppointmentConfirmation(event);
    }
}