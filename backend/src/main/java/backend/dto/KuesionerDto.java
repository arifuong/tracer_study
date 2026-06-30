package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class KuesionerDto {

    private Long id;

    @NotNull(message = "Periode ID tidak boleh kosong")
    private Long periodeId;

    private String periodeNama;

    @NotBlank(message = "Judul kuesioner tidak boleh kosong")
    private String judulKuesioner;

    private String deskripsi;

    private List<PertanyaanDto> pertanyaan;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPeriodeId() { return periodeId; }
    public void setPeriodeId(Long periodeId) { this.periodeId = periodeId; }
    public String getPeriodeNama() { return periodeNama; }
    public void setPeriodeNama(String periodeNama) { this.periodeNama = periodeNama; }
    public String getJudulKuesioner() { return judulKuesioner; }
    public void setJudulKuesioner(String judulKuesioner) { this.judulKuesioner = judulKuesioner; }
    public String getDeskripsi() { return deskripsi; }
    public void setDeskripsi(String deskripsi) { this.deskripsi = deskripsi; }
    public List<PertanyaanDto> getPertanyaan() { return pertanyaan; }
    public void setPertanyaan(List<PertanyaanDto> pertanyaan) { this.pertanyaan = pertanyaan; }
}
