package backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

// Entity merepresentasikan User (pengguna sistem).
// Konsep OOP: Encapsulation.
// Seluruh atribut pengguna dibungkus dalam satu class agar aman dan mudah dikelola.
@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "password_changed", nullable = false)
    private boolean passwordChanged = false;

    public enum Role {
        ADMIN, ALUMNI, PIMPINAN
    }
}