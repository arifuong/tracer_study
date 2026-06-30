package backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

// Entity merepresentasikan Laporan tracer study yang di-export.
// Konsep OOP: Encapsulation.
// Seluruh atribut laporan dibungkus dalam satu class agar aman dan mudah dikelola.
@Data
@Entity
@Table(name = "laporan")
public class Laporan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many Laporan di-generate oleh One Admin (User).
    // Relasi OOP: Many To One (Association)
    // Relasi Database:
    // users.id -> laporan.admin_id
    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "nama_laporan", nullable = false, length = 150)
    private String namaLaporan;

    // Parameter filter (periode, prodi, dll) disimpan dalam format JSON/TEXT
    @Column(name = "filter_kriteria", columnDefinition = "TEXT")
    private String filterKriteria;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipe_file", nullable = false)
    private TipeFile tipeFile;

    @Column(name = "file_path", length = 255)
    private String filePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TipeFile {
        PDF, EXCEL
    }
}
