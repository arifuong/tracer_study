package backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

// Entity merepresentasikan pengisian kuesioner oleh Alumni pada periode tertentu.
// Konsep OOP: Encapsulation.
// Seluruh atribut dibungkus dalam kelas agar aman dan mudah dikelola.
@Data
@Entity
@Table(name = "pengisian_kuesioner", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"alumni_id", "kuesioner_id"})
})
public class PengisianKuesioner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many PengisianKuesioner diisi oleh One Alumni.
    // Relasi OOP: Many To One (Association)
    // Relasi Database:
    // alumni.id -> pengisian_kuesioner.alumni_id
    @ManyToOne
    @JoinColumn(name = "alumni_id", nullable = false)
    private Alumni alumni;

    // Many PengisianKuesioner merujuk pada One Kuesioner.
    // Relasi OOP: Many To One (Association)
    // Relasi Database:
    // kuesioner.id -> pengisian_kuesioner.kuesioner_id
    @ManyToOne
    @JoinColumn(name = "kuesioner_id", nullable = false)
    private Kuesioner kuesioner;

    @Column(name = "tanggal_isi", nullable = false, updatable = false)
    private LocalDateTime tanggalIsi = LocalDateTime.now();

    // status_submit (TINYINT(1) / Integer) untuk penanda submit (default 1)
    @Column(name = "status_submit", nullable = false)
    private Integer statusSubmit = 1;
}