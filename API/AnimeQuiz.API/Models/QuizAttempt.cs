namespace AnimeQuiz.API.Models;

public class QuizAttempt
{
    public int Id { get; set; }
    public int ParticipantId { get; set; }
    public int QuestionId { get; set; }
    public int QuestionOrder { get; set; }
    public string? SelectedAnswer { get; set; }
    public bool? IsCorrect { get; set; }
    public DateTime? AnsweredAt { get; set; }

    public QuizParticipant Participant { get; set; } = null!;
    public Question Question { get; set; } = null!;
}
