package backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class LoginRequest {

    @NotBlank(message = "Username tidak boleh kosong")
    @Size(min = 4, max = 50, message = "Username harus antara 4 sampai 50 karakter")
    private String username;

    @NotBlank(message = "Password tidak boleh kosong")
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

