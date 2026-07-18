package backend.dto.admin;

public class AnswerAnalyticsDto {
    private String answer;
    private Long total;
    private Double percentage;

    // Getters and Setters
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public Long getTotal() { return total; }
    public void setTotal(Long total) { this.total = total; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
}

