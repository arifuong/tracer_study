package backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;


// Konsep OOP: Encapsulation.
// Seluruh atribut alumni dibungkus dalam satu class agar mudah dikelola.
@Data
@Entity
@Table(name = "alumni")
public class Alumni {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One Alumni berelasi satu-ke-satu dengan One User.
    // Relasi OOP : One To One (Association)
    // Relasi Database:
    // users.id -> alumni.user_id
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(unique = true, nullable = false, length = 20)
    private String nim;

    @Column(name = "nama_lengkap", nullable = false, length = 100)
    private String namaLengkap;

    @Column(name = "tempat_lahir", length = 50)
    private String tempatLahir;

    // Menggunakan LocalDate untuk menghindari masalah kompatibilitas Date saat runtime
    @Column(name = "tanggal_lahir")
    private LocalDate tanggalLahir;

    @Column(nullable = false, length = 100)
    private String prodi;

    // Menggunakan LocalDate untuk menghindari masalah kompatibilitas Date saat runtime
    @Column(name = "tanggal_lulus", nullable = false)
    private LocalDate tanggalLulus;

    @Column(name = "no_hp", length = 20)
    private String noHp;

    @Column(length = 100)
    private String email;

    @Column(name = "jenis_kelamin", length = 20)
    private String jenisKelamin;

    @Column(name = "alamat_rumah", columnDefinition = "TEXT")
    private String alamatRumah;
}
