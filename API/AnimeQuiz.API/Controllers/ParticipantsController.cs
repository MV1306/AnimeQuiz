using AnimeQuiz.API.Data;
using AnimeQuiz.API.DTOs;
using AnimeQuiz.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuiz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParticipantsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ParticipantResponse>> Create(CreateParticipantRequest req)
    {
        var questions = await db.Questions
            .Where(q => q.IsActive)
            .OrderBy(q => Guid.NewGuid())
            .Take(5)
            .ToListAsync();

        if (questions.Count < 5)
            return BadRequest("Not enough active questions in the bank.");

        var participant = new QuizParticipant
        {
            Name = req.Name,
            Mobile = req.Mobile,
            Email = req.Email,
            TotalQuestions = 5
        };
        db.QuizParticipants.Add(participant);
        await db.SaveChangesAsync();

        var attempts = questions.Select((q, i) => new QuizAttempt
        {
            ParticipantId = participant.Id,
            QuestionId = q.Id,
            QuestionOrder = i + 1
        }).ToList();
        db.QuizAttempts.AddRange(attempts);
        await db.SaveChangesAsync();

        return Ok(new ParticipantResponse(participant.Id, participant.Name, participant.Email));
    }
}
