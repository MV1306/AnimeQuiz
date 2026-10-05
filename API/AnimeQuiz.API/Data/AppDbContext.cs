using AnimeQuiz.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuiz.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<QuizParticipant> QuizParticipants => Set<QuizParticipant>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizRound> QuizRounds => Set<QuizRound>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<QuizAttempt>()
            .HasOne(a => a.Participant)
            .WithMany(p => p.Attempts)
            .HasForeignKey(a => a.ParticipantId);

        modelBuilder.Entity<QuizAttempt>()
            .HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId);

        modelBuilder.Entity<QuizRound>()
            .HasOne(r => r.Participant)
            .WithMany(p => p.Rounds)
            .HasForeignKey(r => r.ParticipantId);

        modelBuilder.Entity<Question>()
            .HasIndex(q => q.Category);

        modelBuilder.Entity<Question>()
            .HasIndex(q => q.Difficulty);

        modelBuilder.Entity<QuizAttempt>()
            .HasIndex(a => new { a.ParticipantId, a.QuestionOrder });
    }
}
