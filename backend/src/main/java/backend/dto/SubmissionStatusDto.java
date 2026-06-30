package backend.dto;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class SubmissionStatusDto {
    private Long kuesionerId;
    private String judulKuesioner;
    private String namaPeriode;
    private String status; // "Sudah Mengisi" atau "Belum Mengisi"
    private String tanggalIsi; // Formatted date string

    public SubmissionStatusDto(Long kuesionerId, String judulKuesioner, String namaPeriode, String status, String tanggalIsi) {
        this.kuesionerId = kuesionerId;
        this.judulKuesioner = judulKuesioner;
        this.namaPeriode = namaPeriode;
        this.status = status;
        this.tanggalIsi = tanggalIsi;
    }

    // Getters and Setters
    public Long getKuesionerId() { return kuesionerId; }
    public void setKuesionerId(Long kuesionerId) { this.kuesionerId = kuesionerId; }
    public String getJudulKuesioner() { return judulKuesioner; }
    public void setJudulKuesioner(String judulKuesioner) { this.judulKuesioner = judulKuesioner; }
    public String getNamaPeriode() { return namaPeriode; }
    public void setNamaPeriode(String namaPeriode) { this.namaPeriode = namaPeriode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTanggalIsi() { return tanggalIsi; }
    public void setTanggalIsi(String tanggalIsi) { this.tanggalIsi = tanggalIsi; }
}
