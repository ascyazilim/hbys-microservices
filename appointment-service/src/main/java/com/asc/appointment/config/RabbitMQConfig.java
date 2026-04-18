package com.asc.appointment.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange (Yönlendirici Santral) Adı
    public static final String EXCHANGE_APPOINTMENT = "appointment.exchange";

    // Kuyruk Adı
    public static final String QUEUE_APPOINTMENT_CREATED = "appointment.created.queue";

    // Yönlendirme Anahtarı (Routing Key)
    public static final String ROUTING_KEY_APPOINTMENT_CREATED = "appointment.created.routingKey";

    // 1. Queue Oluşturma
    @Bean
    public Queue appointmentCreatedQueue() {
        return new Queue(QUEUE_APPOINTMENT_CREATED, true); // true = Sunucu kapansa da kuyruk silinmez
    }

    // 2. Exchange Oluşturma (Topic veya Direct kullanılabilir)
    @Bean
    public DirectExchange appointmentExchange() {
        return new DirectExchange(EXCHANGE_APPOINTMENT);
    }

    // 3. Queue ile Exchange'i birbirine bağlama (Binding)
    @Bean
    public Binding appointmentCreatedBinding(Queue appointmentCreatedQueue, DirectExchange appointmentExchange) {
        return BindingBuilder
                .bind(appointmentCreatedQueue)
                .to(appointmentExchange)
                .with(ROUTING_KEY_APPOINTMENT_CREATED);
    }

    // 4. Java Record objelerini RabbitMQ'ya JSON olarak göndermek için Converter
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}