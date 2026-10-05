using AnimeQuiz.API.Models;

namespace AnimeQuiz.API.Data;

public static class DbSeeder
{
    private static readonly string[] Letters = ["A", "B", "C", "D"];

    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        if (db.Questions.Any()) return;

        var questions = SeedData.GetQuestions();
        var rng = new Random();

        foreach (var q in questions)
        {
            // Build list of (letter, text) pairs
            var options = new List<(string Letter, string Text)>
            {
                ("A", q.OptionA),
                ("B", q.OptionB),
                ("C", q.OptionC),
                ("D", q.OptionD),
            };

            // Find the correct answer text before shuffling
            var correctText = options.First(o => o.Letter == q.CorrectAnswer).Text;

            // Fisher-Yates shuffle
            for (int i = options.Count - 1; i > 0; i--)
            {
                int j = rng.Next(i + 1);
                (options[i], options[j]) = (options[j], options[i]);
            }

            // Reassign options
            q.OptionA = options[0].Text;
            q.OptionB = options[1].Text;
            q.OptionC = options[2].Text;
            q.OptionD = options[3].Text;

            // Remap correct answer to new position
            q.CorrectAnswer = Letters[options.FindIndex(o => o.Text == correctText)];
        }

        db.Questions.AddRange(questions);
        await db.SaveChangesAsync();
    }
}
