package backend.dto.admin;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class MonitoringDto {
    private String namaAlumni;
    private String nim;
    private String status; // "Sudah Mengisi" atau "Belum Mengisi"
    private String tanggalIsi; // Kosong jika belum mengisi
    private Long alumniId;

    public MonitoringDto() {}

    public MonitoringDto(String namaAlumni, String nim, String status, String tanggalIsi, Long alumniId) {
        this.namaAlumni = namaAlumni;
        this.nim = nim;
        this.status = status;
        this.tanggalIsi = tanggalIsi;
        this.alumniId = alumniId;
    }

    public String getNamaAlumni() { return namaAlumni; }
    public void setNamaAlumni(String namaAlumni) { this.namaAlumni = namaAlumni; }
    public String getNim() { return nim; }
    public void setNim(String nim) { this.nim = nim; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTanggalIsi() { return tanggalIsi; }
    public void setTanggalIsi(String tanggalIsi) { this.tanggalIsi = tanggalIsi; }
    public Long getAlumniId() { return alumniId; }
    public void setAlumniId(Long alumniId) { this.alumniId = alumniId; }
}

