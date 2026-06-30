package backend.entity;

import jakarta.persistence.*;
import lombok.Data;


// Konsep OOP: Encapsulation.
// Seluruh data jawaban dibungkus dalam satu class agar mudah dikelola.
@Data
@Entity
@Table(name = "jawaban")
public class Jawaban {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   
    // Relasi OOP: Many To One (Association)
    // Relasi Database:
    // pengisian_kuesioner.id -> jawaban.pengisian_id
    @ManyToOne
    @JoinColumn(name = "pengisian_id", nullable = false)
    private PengisianKuesioner pengisian;

    // Many Jawaban menjawab One Pertanyaan.
    // Relasi OOP: Many To One (Association)
    // Relasi Database:
    // pertanyaan.id -> jawaban.pertanyaan_id
    @ManyToOne
    @JoinColumn(name = "pertanyaan_id", nullable = false)
    private Pertanyaan pertanyaan;

    @Column(name = "jawaban_teks", nullable = false, columnDefinition = "TEXT")
    private String jawabanTeks;
}