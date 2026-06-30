package backend.dto;

import java.util.List;

public class AlumniAnswersDto {
    private Long alumniId;
    private String namaAlumni;
    private String nim;
    private String prodi;
    private String judulKuesioner;
    private String tanggalIsi;
    private List<QuestionAnswerDto> answers;

    public AlumniAnswersDto() {}

    public Long getAlumniId() { return alumniId; }
    public void setAlumniId(Long alumniId) { this.alumniId = alumniId; }
    public String getNamaAlumni() { return namaAlumni; }
    public void setNamaAlumni(String namaAlumni) { this.namaAlumni = namaAlumni; }
    public String getNim() { return nim; }
    public void setNim(String nim) { this.nim = nim; }
    public String getProdi() { return prodi; }
    public void setProdi(String prodi) { this.prodi = prodi; }
    public String getJudulKuesioner() { return judulKuesioner; }
    public void setJudulKuesioner(String judulKuesioner) { this.judulKuesioner = judulKuesioner; }
    public String getTanggalIsi() { return tanggalIsi; }
    public void setTanggalIsi(String tanggalIsi) { this.tanggalIsi = tanggalIsi; }
    public List<QuestionAnswerDto> getAnswers() { return answers; }
    public void setAnswers(List<QuestionAnswerDto> answers) { this.answers = answers; }
}
