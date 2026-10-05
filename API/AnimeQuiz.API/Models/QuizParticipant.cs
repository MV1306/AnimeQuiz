namespace AnimeQuiz.API.Models;

public class QuizParticipant
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Mobile { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int TotalQuestions { get; set; } = 200;
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public decimal Score { get; set; }

    public ICollection<QuizAttempt> Attempts { get; set; } = [];
    public ICollection<QuizRound> Rounds { get; set; } = [];
}
