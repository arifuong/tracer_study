package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class PertanyaanDto {

    private Long id;
    private Long kuesionerId;

    @NotBlank(message = "Teks pertanyaan tidak boleh kosong")
    private String teksPertanyaan;

    @NotBlank(message = "Tipe pertanyaan tidak boleh kosong")
    private String tipePertanyaan; // "TEXT" or "CHOICE"

    private String pilihan; // Holds choices as a JSON string

    private Integer orderIndex = 0;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getKuesionerId() { return kuesionerId; }
    public void setKuesionerId(Long kuesionerId) { this.kuesionerId = kuesionerId; }
    public String getTeksPertanyaan() { return teksPertanyaan; }
    public void setTeksPertanyaan(String teksPertanyaan) { this.teksPertanyaan = teksPertanyaan; }
    public String getTipePertanyaan() { return tipePertanyaan; }
    public void setTipePertanyaan(String tipePertanyaan) { this.tipePertanyaan = tipePertanyaan; }
    public String getPilihan() { return pilihan; }
    public void setPilihan(String pilihan) { this.pilihan = pilihan; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
