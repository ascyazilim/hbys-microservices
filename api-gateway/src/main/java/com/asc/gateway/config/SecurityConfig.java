package com.asc.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity // Gateway WebFlux kullandığı için bu anotasyon şart!
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange

                        // 1. SWAGGER VİTRİNİ
                        .pathMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/webjars/**",
                                "/v3/api-docs/**",         // BÜYÜK EKSİK BURADAYDI: Gateway'in kendi dropdown menüsünü besleyen dosya!
                                "/api/*/v3/api-docs/**",   // İç servislerin (Doctor, Patient vb.) JSON dosyaları
                                "/api/*/v3/api-docs"
                        ).permitAll()

                        // 2. EUREKA: Santralin mikroservisleri kaydetmesi için bu yolu açık bırakıyoruz
                        .pathMatchers("/eureka/**").permitAll()

                        // 3. DİĞER HER ŞEY: Geri kalan tüm istekler güvenlik kontrolünden (Keycloak Token) geçmek zorundadır
                        .anyExchange().authenticated()
                )
                // Gelen isteğin içindeki JWT (JSON Web Token) okunup doğrulanacak
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }
}