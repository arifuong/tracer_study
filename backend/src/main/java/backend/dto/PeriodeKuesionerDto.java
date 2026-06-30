package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class PeriodeKuesionerDto {

    private Long id;

    @NotBlank(message = "Nama periode tidak boleh kosong")
    private String namaPeriode;

    @NotNull(message = "Tanggal mulai tidak boleh kosong")
    private LocalDate tanggalMulai;

    @NotNull(message = "Tanggal selesai tidak boleh kosong")
    private LocalDate tanggalSelesai;

    private String keterangan;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNamaPeriode() { return namaPeriode; }
    public void setNamaPeriode(String namaPeriode) { this.namaPeriode = namaPeriode; }
    public LocalDate getTanggalMulai() { return tanggalMulai; }
    public void setTanggalMulai(LocalDate tanggalMulai) { this.tanggalMulai = tanggalMulai; }
    public LocalDate getTanggalSelesai() { return tanggalSelesai; }
    public void setTanggalSelesai(LocalDate tanggalSelesai) { this.tanggalSelesai = tanggalSelesai; }
    public String getKeterangan() { return keterangan; }
    public void setKeterangan(String keterangan) { this.keterangan = keterangan; }
}
