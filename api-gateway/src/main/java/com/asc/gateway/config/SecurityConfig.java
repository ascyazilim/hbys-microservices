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
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Token tabanlı sistemlerde CSRF'e genelde ihtiyaç duyulmaz
                .authorizeExchange(exchange -> exchange
                        // Eureka santralinin mikroservisleri kaydetmesi için bu yolu açık bırakıyoruz
                        .pathMatchers("/eureka/**").permitAll()
                        // Geri kalan tttttüm istekler güvenlik kontrolünden (Token) geçmek zorundadır
                        .anyExchange().authenticated()
                )
                // Gelen isteğin içindeki JWT (JSON Web Token) okunup doğrulanacak
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }
}