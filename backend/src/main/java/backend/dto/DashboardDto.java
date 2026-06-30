package backend.dto;

import java.util.List;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class DashboardDto {
    private Long totalAlumni;
    private Long totalResponden;
    private Long belumMengisi;
    private Double responseRate;
    private Long totalKuesionerAktif;
    private Long totalPertanyaanAktif;
    private List<QuestionAnalyticsDto> questionAnalytics;

    // Getters and Setters
    public Long getTotalAlumni() { return totalAlumni; }
    public void setTotalAlumni(Long totalAlumni) { this.totalAlumni = totalAlumni; }
    public Long getTotalResponden() { return totalResponden; }
    public void setTotalResponden(Long totalResponden) { this.totalResponden = totalResponden; }
    public Long getBelumMengisi() { return belumMengisi; }
    public void setBelumMengisi(Long belumMengisi) { this.belumMengisi = belumMengisi; }
    public Double getResponseRate() { return responseRate; }
    public void setResponseRate(Double responseRate) { this.responseRate = responseRate; }
    public Long getTotalKuesionerAktif() { return totalKuesionerAktif; }
    public void setTotalKuesionerAktif(Long totalKuesionerAktif) { this.totalKuesionerAktif = totalKuesionerAktif; }
    public Long getTotalPertanyaanAktif() { return totalPertanyaanAktif; }
    public void setTotalPertanyaanAktif(Long totalPertanyaanAktif) { this.totalPertanyaanAktif = totalPertanyaanAktif; }
    public List<QuestionAnalyticsDto> getQuestionAnalytics() { return questionAnalytics; }
    public void setQuestionAnalytics(List<QuestionAnalyticsDto> questionAnalytics) { this.questionAnalytics = questionAnalytics; }
}
