package backend.controller;

import backend.dto.auth.AuthResponse;
import backend.dto.auth.LoginRequest;
import backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;


// Bertanggung jawab menerima request dari client.
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // Logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<String> logout(Principal principal) {
        // Logout ditangani secara client-side dengan menghapus token,
        // endpoint ini disediakan untuk penanda log keluar jika diperlukan.
        return ResponseEntity.ok("Logout berhasil");
    }
}

