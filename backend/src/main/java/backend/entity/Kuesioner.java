package backend.entity;

import jakarta.persistence.*;
import lombok.Data;

// Entity merepresentasikan kuesioner tracer study.
// Konsep OOP: Encapsulation.
// Seluruh atribut kuesioner dibungkus dalam satu class agar mudah dikelola.
@Data
@Entity
@Table(name = "kuesioner")
public class Kuesioner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many Kuesioner terhubung ke One PeriodeKuesioner.
    // Relasi OOP : Many To One (Association)
    // Relasi Database:
    // periode_kuesioner.id -> kuesioner.periode_id
    @ManyToOne
    @JoinColumn(name = "periode_id", nullable = false)
    private PeriodeKuesioner periode;

    @Column(name = "judul_kuesioner", nullable = false, length = 200)
    private String judulKuesioner;

    @Column(columnDefinition = "TEXT")
    private String deskripsi;
}