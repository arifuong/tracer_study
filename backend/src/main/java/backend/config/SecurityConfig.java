package backend.config;

import backend.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import java.util.List;

// SecurityConfig
// Mengonfigurasi filter, endpoint, authorization, dan CORS untuk Spring Security.
// Konsep OOP: Abstraction.
// Logika keamanan abstrak disembunyikan di balik SecurityFilterChain.
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/v3/api-docs.yaml").permitAll()
                .requestMatchers("/api/alumni/kuesioner/active").hasRole("ALUMNI")
                .requestMatchers("/api/alumni/pengisian/status").hasRole("ALUMNI")
                .requestMatchers("/api/alumni/kuesioner/*/isi").hasRole("ALUMNI")
                .requestMatchers("/api/alumni/**").hasRole("ALUMNI")
                .requestMatchers("/api/admin/dashboard").hasAnyRole("ADMIN", "PIMPINAN")
                .requestMatchers("/api/dashboard").hasAnyRole("ADMIN", "PIMPINAN")
                .requestMatchers("/api/admin/monitoring/**").hasAnyRole("ADMIN", "PIMPINAN")
                .requestMatchers(HttpMethod.GET, "/api/admin/periode", "/api/admin/periode/**").hasAnyRole("ADMIN", "PIMPINAN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/pimpinan/dashboard").hasRole("PIMPINAN")
                .requestMatchers("/api/laporan/**").hasAnyRole("ADMIN", "PIMPINAN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
