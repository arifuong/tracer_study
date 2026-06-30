package backend.entity;

import jakarta.persistence.*;
import lombok.Data;

// Entity merepresentasikan objek Pertanyaan dalam domain bisnis kuesioner.
// Konsep OOP: Encapsulation.
// Seluruh atribut pertanyaan dibungkus dalam satu class agar mudah dikelola.
@Data
@Entity
@Table(name = "pertanyaan")
public class Pertanyaan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many Pertanyaan terhubung ke One Kuesioner.
    // Relasi OOP: Many To One (Association)
    // Relasi Database:
    // kuesioner.id -> pertanyaan.kuesioner_id
    @ManyToOne
    @JoinColumn(name = "kuesioner_id", nullable = false)
    private Kuesioner kuesioner;

    @Column(name = "teks_pertanyaan", nullable = false, columnDefinition = "TEXT")
    private String teksPertanyaan;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipe_pertanyaan", nullable = false)
    private TipePertanyaan tipePertanyaan;

    // Pilihan ganda (JSON array, hanya untuk tipe CHOICE)
    @Column(name = "pilihan", columnDefinition = "TEXT")
    private String pilihan;

    // Urutan tampilan pertanyaan
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    public enum TipePertanyaan {
        TEXT, CHOICE
    }
}