package com.asc.patient.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "HBYS Patient Service API",
                version = "1.0.0",
                description = "Hastane Bilgi Yönetim Sistemi - Hasta Modülü Uç Noktaları",
                contact = @Contact(name = "ASC Yazılım", email = "iletisim@asc.com")
        ),
        // Tüm Controller'lara varsayılan olarak bu güvenlik şemasını uygula
        security = @SecurityRequirement(name = "BearerAuth")
)
@SecurityScheme(
        name = "BearerAuth",
        description = "Keycloak üzerinden aldığınız JWT token'ı buraya yapıştırın.",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = io.swagger.v3.oas.annotations.enums.SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}