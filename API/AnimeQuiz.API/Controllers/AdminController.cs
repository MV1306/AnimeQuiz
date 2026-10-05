using AnimeQuiz.API.Data;
using AnimeQuiz.API.DTOs;
using AnimeQuiz.API.Models;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuiz.API.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController(AppDbContext db) : ControllerBase
{
    // Questions
    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions([FromQuery] string? category, [FromQuery] string? difficulty)
    {
        var query = db.Questions.AsQueryable();
        if (!string.IsNullOrEmpty(category)) query = query.Where(q => q.Category == category);
        if (!string.IsNullOrEmpty(difficulty)) query = query.Where(q => q.Difficulty == difficulty);
        return Ok(await query.OrderBy(q => q.Id).ToListAsync());
    }

    [HttpGet("questions/{id}")]
    public async Task<IActionResult> GetQuestion(int id)
    {
        var q = await db.Questions.FindAsync(id);
        return q == null ? NotFound() : Ok(q);
    }

    [HttpPost("questions")]
    public async Task<IActionResult> CreateQuestion(QuestionRequest req)
    {
        var question = new Question
        {
            QuestionText = req.QuestionText,
            Category = req.Category,
            Difficulty = req.Difficulty,
            OptionA = req.OptionA,
            OptionB = req.OptionB,
            OptionC = req.OptionC,
            OptionD = req.OptionD,
            CorrectAnswer = req.CorrectAnswer,
            Explanation = req.Explanation,
            IsActive = req.IsActive
        };
        db.Questions.Add(question);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetQuestion), new { id = question.Id }, question);
    }

    [HttpPut("questions/{id}")]
    public async Task<IActionResult> UpdateQuestion(int id, QuestionRequest req)
    {
        var question = await db.Questions.FindAsync(id);
        if (question == null) return NotFound();

        question.QuestionText = req.QuestionText;
        question.Category = req.Category;
        question.Difficulty = req.Difficulty;
        question.OptionA = req.OptionA;
        question.OptionB = req.OptionB;
        question.OptionC = req.OptionC;
        question.OptionD = req.OptionD;
        question.CorrectAnswer = req.CorrectAnswer;
        question.Explanation = req.Explanation;
        question.IsActive = req.IsActive;

        await db.SaveChangesAsync();
        return Ok(question);
    }

    [HttpPatch("questions/{id}/toggle")]
    public async Task<IActionResult> ToggleQuestion(int id)
    {
        var question = await db.Questions.FindAsync(id);
        if (question == null) return NotFound();
        question.IsActive = !question.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { question.Id, question.IsActive });
    }

    [HttpDelete("questions/{id}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        var question = await db.Questions.FindAsync(id);
        if (question == null) return NotFound();
        db.Questions.Remove(question);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Leaderboard
    [HttpGet("/api/leaderboard")]
    public async Task<IActionResult> GetLeaderboard([FromQuery] int top = 10)
    {
        var leaders = await db.QuizParticipants
            .Where(p => p.CompletedAt != null)
            .OrderByDescending(p => p.Score)
            .ThenBy(p => p.CompletedAt)
            .Take(top)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.CorrectAnswers,
                p.TotalQuestions,
                p.Score,
                p.CompletedAt
            })
            .ToListAsync();
        return Ok(leaders);
    }

    // Participants / Results
    [HttpGet("participants")]
    public async Task<IActionResult> GetParticipants()
    {
        var participants = await db.QuizParticipants
            .OrderByDescending(p => p.StartedAt)
            .Select(p => new
            {
                p.Id, p.Name, p.Mobile, p.Email,
                p.StartedAt, p.CompletedAt,
                p.TotalQuestions, p.CorrectAnswers, p.WrongAnswers, p.Score,
                IsComplete = p.CompletedAt != null
            })
            .ToListAsync();
        return Ok(participants);
    }

    [HttpGet("participants/{id}/attempts")]
    public async Task<IActionResult> GetParticipantAttempts(int id)
    {
        var attempts = await db.QuizAttempts
            .Include(a => a.Question)
            .Where(a => a.ParticipantId == id)
            .OrderBy(a => a.QuestionOrder)
            .Select(a => new
            {
                a.QuestionOrder,
                a.Question.QuestionText,
                a.Question.Category,
                a.SelectedAnswer,
                a.Question.CorrectAnswer,
                a.IsCorrect,
                a.AnsweredAt
            })
            .ToListAsync();
        return Ok(attempts);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalParticipants = await db.QuizParticipants.CountAsync();
        var completed = await db.QuizParticipants.CountAsync(p => p.CompletedAt != null);
        var avgScore = await db.QuizParticipants
            .Where(p => p.CompletedAt != null)
            .AverageAsync(p => (double?)p.Score) ?? 0;
        var totalQuestions = await db.Questions.CountAsync();
        var activeQuestions = await db.Questions.CountAsync(q => q.IsActive);

        return Ok(new
        {
            totalParticipants,
            completedParticipants = completed,
            inProgressParticipants = totalParticipants - completed,
            averageScore = Math.Round(avgScore, 2),
            totalQuestions,
            activeQuestions
        });
    }

    [HttpGet("export/results")]
    public async Task<IActionResult> ExportResults()
    {
        var participants = await db.QuizParticipants
            .OrderByDescending(p => p.StartedAt)
            .ToListAsync();

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Results");

        string[] headers = ["Id", "Name", "Mobile", "Email", "Started At", "Completed At", "Correct", "Wrong", "Score %"];
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(1, i + 1).Value = headers[i];
            ws.Cell(1, i + 1).Style.Font.Bold = true;
        }

        for (int i = 0; i < participants.Count; i++)
        {
            var p = participants[i];
            int row = i + 2;
            ws.Cell(row, 1).Value = p.Id;
            ws.Cell(row, 2).Value = p.Name;
            ws.Cell(row, 3).Value = p.Mobile;
            ws.Cell(row, 4).Value = p.Email;
            ws.Cell(row, 5).Value = p.StartedAt.ToString("yyyy-MM-dd HH:mm");
            ws.Cell(row, 6).Value = p.CompletedAt?.ToString("yyyy-MM-dd HH:mm") ?? "In Progress";
            ws.Cell(row, 7).Value = p.CorrectAnswers;
            ws.Cell(row, 8).Value = p.WrongAnswers;
            ws.Cell(row, 9).Value = (double)p.Score;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        wb.SaveAs(stream);
        stream.Position = 0;

        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "quiz-results.xlsx");
    }
}
