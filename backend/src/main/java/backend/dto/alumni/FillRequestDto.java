package backend.dto.alumni;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class FillRequestDto {

    @NotEmpty(message = "Jawaban tidak boleh kosong")
    private List<AnswerSubmissionDto> jawaban;

    public List<AnswerSubmissionDto> getJawaban() { return jawaban; }
    public void setJawaban(List<AnswerSubmissionDto> jawaban) { this.jawaban = jawaban; }
}

