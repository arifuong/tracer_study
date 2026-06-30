package backend.dto;

public class QuestionAnswerDto {
    private Long questionId;
    private String questionText;
    private String questionType;
    private String answerText;

    public QuestionAnswerDto() {}

    public QuestionAnswerDto(Long questionId, String questionText, String questionType, String answerText) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.questionType = questionType;
        this.answerText = answerText;
    }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }
}
