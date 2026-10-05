import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizApi, type QuestionDto, type QuizQuestionsResponse } from '../api/quizApi';
import Timer from '../components/Timer';

const ROUND_SECONDS = 90;
const OPTIONS = ['A', 'B', 'C', 'D'] as const;

export default function Quiz() {
  const { participantId } = useParams<{ participantId: string }>();
  const navigate = useNavigate();
  const pid = Number(participantId);

  const [data, setData] = useState<QuizQuestionsResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    quizApi.getQuestions(pid)
      .then(d => { setData(d); setTimerRunning(true); })
      .catch(() => setError('Failed to load questions.'))
      .finally(() => setLoading(false));
  }, [pid]);

  const handleSubmit = useCallback(async () => {
    if (!data) return;
    setTimerRunning(false);
    setSubmitting(true);
    try {
      const answerList = data.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] ?? '',
      }));
      const result = await quizApi.submitQuiz(pid, answerList);
      navigate(`/result/${pid}`, { state: { result } });
    } catch {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  }, [data, answers, pid, navigate]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
        <p style={{ color: '#9090a0' }}>Loading questions...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
        <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );

  if (!data) return null;

  const q: QuestionDto = data.questions[currentQ];
  const totalAnswered = Object.keys(answers).length;

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem 1rem' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: '#d4af37', fontSize: '1.1rem', fontFamily: 'Cinzel, serif' }}>⚔️ Demon Slayer Quiz</h2>
            <p style={{ color: '#9090a0', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              {totalAnswered} of {data.questions.length} answered
            </p>
          </div>
          <Timer seconds={ROUND_SECONDS} onExpire={handleSubmit} running={timerRunning} />
        </div>

        {/* Question card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ color: '#9090a0', fontSize: '0.85rem' }}>
              Question {currentQ + 1} of {data.questions.length}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className={`badge badge-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
              <span className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37' }}>{q.category}</span>
            </div>
          </div>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1.5rem', color: '#e8e0d0' }}>
            {q.questionText}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {OPTIONS.map(opt => {
              const text = q[`option${opt}` as keyof QuestionDto] as string;
              const selected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  className={`option-btn ${selected ? 'selected' : ''}`}
                  onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                >
                  <span className="option-label">{opt}</span>
                  {text}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            disabled={currentQ === 0}
          >
            ← Prev
          </button>

          {/* Question dots */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {data.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQ(i)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: answers[q.id] ? '#d4af37' : i === currentQ ? '#8b0000' : '#2a2a3a',
                  color: answers[q.id] || i === currentQ ? '#fff' : '#9090a0',
                  fontSize: '0.8rem', fontWeight: 700,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQ < data.questions.length - 1 ? (
            <button className="btn btn-outline" onClick={() => setCurrentQ(q => q + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '✓ Submit'}
            </button>
          )}
        </div>

        {/* Submit button when all answered but not on last question */}
        {totalAnswered === data.questions.length && currentQ < data.questions.length - 1 && (
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '✓ Submit Quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
