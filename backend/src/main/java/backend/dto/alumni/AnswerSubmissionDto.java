package backend.dto.alumni;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


// Mencegah Entity dikirim langsung ke frontend.
public class AnswerSubmissionDto {

    @NotNull(message = "Pertanyaan ID tidak boleh kosong")
    private Long pertanyaanId;

    @NotBlank(message = "Jawaban tidak boleh kosong")
    private String jawabanTeks;

    public Long getPertanyaanId() { return pertanyaanId; }
    public void setPertanyaanId(Long pertanyaanId) { this.pertanyaanId = pertanyaanId; }
    public String getJawabanTeks() { return jawabanTeks; }
    public void setJawabanTeks(String jawabanTeks) { this.jawabanTeks = jawabanTeks; }
}

