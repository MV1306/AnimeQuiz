using AnimeQuiz.API.Data;
using AnimeQuiz.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuiz.API.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController(AppDbContext db) : ControllerBase
{
    [HttpGet("{participantId}/questions")]
    public async Task<ActionResult<QuizQuestionsResponse>> GetQuestions(int participantId)
    {
        var participant = await db.QuizParticipants.FindAsync(participantId);
        if (participant == null) return NotFound("Participant not found.");
        if (participant.CompletedAt != null) return BadRequest("Quiz already completed.");

        var attempts = await db.QuizAttempts
            .Include(a => a.Question)
            .Where(a => a.ParticipantId == participantId)
            .OrderBy(a => a.QuestionOrder)
            .ToListAsync();

        var questions = attempts.Select(a => new QuestionDto(
            a.QuestionId,
            a.QuestionOrder,
            a.Question.QuestionText,
            a.Question.Category,
            a.Question.Difficulty,
            a.Question.OptionA,
            a.Question.OptionB,
            a.Question.OptionC,
            a.Question.OptionD
        )).ToList();

        return Ok(new QuizQuestionsResponse(participantId, questions));
    }

    [HttpPost("submit")]
    public async Task<ActionResult<QuizResultResponse>> Submit(SubmitQuizRequest req)
    {
        var participant = await db.QuizParticipants.FindAsync(req.ParticipantId);
        if (participant == null) return NotFound("Participant not found.");
        if (participant.CompletedAt != null) return BadRequest("Quiz already submitted.");

        var attempts = await db.QuizAttempts
            .Include(a => a.Question)
            .Where(a => a.ParticipantId == req.ParticipantId)
            .ToListAsync();

        var answerMap = req.Answers.ToDictionary(a => a.QuestionId, a => a.SelectedAnswer);
        var results = new List<AnswerResultDto>();
        int correct = 0;

        foreach (var attempt in attempts)
        {
            answerMap.TryGetValue(attempt.QuestionId, out var selected);
            var isCorrect = !string.IsNullOrEmpty(selected) &&
                            selected.Equals(attempt.Question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);

            attempt.SelectedAnswer = selected;
            attempt.IsCorrect = isCorrect;
            attempt.AnsweredAt = DateTime.UtcNow;

            if (isCorrect) correct++;

            results.Add(new AnswerResultDto(
                attempt.QuestionId,
                attempt.Question.QuestionText,
                selected ?? "",
                attempt.Question.CorrectAnswer,
                isCorrect,
                attempt.Question.Explanation
            ));
        }

        participant.CorrectAnswers = correct;
        participant.WrongAnswers = attempts.Count - correct;
        participant.Score = Math.Round((decimal)correct / attempts.Count * 100, 2);
        participant.CompletedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(new QuizResultResponse(
            participant.Id,
            participant.Name,
            attempts.Count,
            correct,
            attempts.Count - correct,
            participant.Score,
            results
        ));
    }

    [HttpGet("{participantId}/result")]
    public async Task<ActionResult<QuizResultResponse>> GetResult(int participantId)
    {
        var participant = await db.QuizParticipants.FindAsync(participantId);
        if (participant == null) return NotFound();

        var attempts = await db.QuizAttempts
            .Include(a => a.Question)
            .Where(a => a.ParticipantId == participantId)
            .OrderBy(a => a.QuestionOrder)
            .ToListAsync();

        var results = attempts.Select(a => new AnswerResultDto(
            a.QuestionId,
            a.Question.QuestionText,
            a.SelectedAnswer ?? "",
            a.Question.CorrectAnswer,
            a.IsCorrect ?? false,
            a.Question.Explanation
        )).ToList();

        return Ok(new QuizResultResponse(
            participant.Id,
            participant.Name,
            attempts.Count,
            participant.CorrectAnswers,
            participant.WrongAnswers,
            participant.Score,
            results
        ));
    }
}
