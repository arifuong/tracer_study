package backend.dto.admin;

import java.util.List;

public class QuestionAnalyticsDto {
    private Long questionId;
    private String questionText;
    private String mostSelectedAnswer;
    private Long mostSelectedCount;
    private Double mostSelectedPercentage;
    private List<AnswerAnalyticsDto> answers;

    // Getters and Setters
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getMostSelectedAnswer() { return mostSelectedAnswer; }
    public void setMostSelectedAnswer(String mostSelectedAnswer) { this.mostSelectedAnswer = mostSelectedAnswer; }
    public Long getMostSelectedCount() { return mostSelectedCount; }
    public void setMostSelectedCount(Long mostSelectedCount) { this.mostSelectedCount = mostSelectedCount; }
    public Double getMostSelectedPercentage() { return mostSelectedPercentage; }
    public void setMostSelectedPercentage(Double mostSelectedPercentage) { this.mostSelectedPercentage = mostSelectedPercentage; }
    public List<AnswerAnalyticsDto> getAnswers() { return answers; }
    public void setAnswers(List<AnswerAnalyticsDto> answers) { this.answers = answers; }
}

