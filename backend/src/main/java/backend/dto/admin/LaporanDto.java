package backend.dto.admin;

import java.time.LocalDateTime;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class LaporanDto {
    private Long id;
    private String adminNama;
    private String namaLaporan;
    private String filterKriteria;
    private String tipeFile;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdminNama() { return adminNama; }
    public void setAdminNama(String adminNama) { this.adminNama = adminNama; }
    public String getNamaLaporan() { return namaLaporan; }
    public void setNamaLaporan(String namaLaporan) { this.namaLaporan = namaLaporan; }
    public String getFilterKriteria() { return filterKriteria; }
    public void setFilterKriteria(String filterKriteria) { this.filterKriteria = filterKriteria; }
    public String getTipeFile() { return tipeFile; }
    public void setTipeFile(String tipeFile) { this.tipeFile = tipeFile; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

