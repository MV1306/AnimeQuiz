namespace AnimeQuiz.API.Models;

public class QuizRound
{
    public int Id { get; set; }
    public int ParticipantId { get; set; }
    public int RoundNumber { get; set; }
    public int StartQuestionNo { get; set; }
    public int EndQuestionNo { get; set; }
    public int Score { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }

    public QuizParticipant Participant { get; set; } = null!;
}
