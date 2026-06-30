package backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

// Entity merepresentasikan periode kuesioner tracer study.
// Konsep OOP: Encapsulation.
// Seluruh atribut periode dibungkus dalam satu class agar mudah dikelola.
@Data
@Entity
@Table(name = "periode_kuesioner")
public class PeriodeKuesioner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nama_periode", nullable = false, length = 100)
    private String namaPeriode;

    @Column(name = "tanggal_mulai", nullable = false)
    private LocalDate tanggalMulai;

    @Column(name = "tanggal_selesai", nullable = false)
    private LocalDate tanggalSelesai;

    @Column(columnDefinition = "TEXT")
    private String keterangan;
}