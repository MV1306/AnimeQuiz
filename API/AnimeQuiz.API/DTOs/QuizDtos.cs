namespace AnimeQuiz.API.DTOs;

public record CreateParticipantRequest(string Name, string Mobile, string Email);

public record ParticipantResponse(int Id, string Name, string Email);

public record QuestionDto(
    int Id,
    int QuestionOrder,
    string QuestionText,
    string Category,
    string Difficulty,
    string OptionA,
    string OptionB,
    string OptionC,
    string OptionD
);

public record QuizQuestionsResponse(
    int ParticipantId,
    List<QuestionDto> Questions
);

public record AnswerSubmission(int QuestionId, string SelectedAnswer);

public record SubmitQuizRequest(int ParticipantId, List<AnswerSubmission> Answers);

public record AnswerResultDto(
    int QuestionId,
    string QuestionText,
    string SelectedAnswer,
    string CorrectAnswer,
    bool IsCorrect,
    string? Explanation
);

public record QuizResultResponse(
    int ParticipantId,
    string ParticipantName,
    int TotalQuestions,
    int CorrectAnswers,
    int WrongAnswers,
    decimal Score,
    List<AnswerResultDto> AnswerResults
);

public record QuestionRequest(
    string QuestionText,
    string Category,
    string Difficulty,
    string OptionA,
    string OptionB,
    string OptionC,
    string OptionD,
    string CorrectAnswer,
    string? Explanation,
    bool IsActive = true
);
