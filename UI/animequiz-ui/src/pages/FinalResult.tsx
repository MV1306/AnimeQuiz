import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { quizApi, type QuizResultResponse } from '../api/quizApi';

function getRank(score: number): { title: string; emoji: string; color: string } {
  if (score >= 90) return { title: 'Hashira', emoji: '⚔️', color: '#d4af37' };
  if (score >= 75) return { title: 'Demon Slayer', emoji: '🗡️', color: '#2ecc71' };
  if (score >= 60) return { title: 'Mizunoto', emoji: '💧', color: '#3498db' };
  if (score >= 40) return { title: 'Apprentice', emoji: '📜', color: '#9090a0' };
  return { title: 'Trainee', emoji: '🌱', color: '#9090a0' };
}

export default function FinalResult() {
  const { participantId } = useParams<{ participantId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<QuizResultResponse | null>(location.state?.result ?? null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    if (result) return;
    quizApi.getResult(Number(participantId))
      .then(setResult)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [participantId, navigate, result]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9090a0' }}>Loading result...</p>
    </div>
  );

  if (!result) return null;

  const rank = getRank(Number(result.score));
  const pct = Number(result.score);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card" style={{ textAlign: 'center', borderColor: rank.color }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{rank.emoji}</div>
          <h1 style={{ color: '#d4af37', fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            Quiz Complete!
          </h1>
          <p style={{ color: '#9090a0', marginBottom: '1.5rem' }}>
            Participant: <strong style={{ color: '#e8e0d0' }}>{result.participantName}</strong>
          </p>

          {/* Score circle */}
          <div style={{
            width: 140, height: 140, borderRadius: '50%', margin: '0 auto 1.5rem',
            background: `conic-gradient(${rank.color} ${pct * 3.6}deg, #2a2a3a 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%', background: '#12121a',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Cinzel, serif', color: rank.color }}>
                {pct.toFixed(0)}%
              </span>
            </div>
          </div>

          <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', borderRadius: 99, background: `${rank.color}22`, color: rank.color, fontFamily: 'Cinzel, serif', fontWeight: 700, marginBottom: '1.5rem' }}>
            {rank.title}
          </div>

          <hr className="divider" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#e8e0d0' }}>{result.totalQuestions}</div>
              <div style={{ fontSize: '0.75rem', color: '#9090a0' }}>Total</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2ecc71' }}>{result.correctAnswers}</div>
              <div style={{ fontSize: '0.75rem', color: '#9090a0' }}>Correct</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#e74c3c' }}>{result.wrongAnswers}</div>
              <div style={{ fontSize: '0.75rem', color: '#9090a0' }}>Wrong</div>
            </div>
          </div>

          {/* Answer review */}
          <hr className="divider" />
          <h3 style={{ color: '#d4af37', marginBottom: '1rem', fontSize: '0.95rem', textAlign: 'left' }}>Answer Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            {result.answerResults.map((a, i) => (
              <div key={a.questionId} style={{ padding: '0.75rem', borderRadius: 8, border: `1px solid ${a.isCorrect ? '#2ecc71' : '#e74c3c'}22`, background: a.isCorrect ? 'rgba(46,204,113,0.05)' : 'rgba(231,76,60,0.05)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0 }}>{a.isCorrect ? '✅' : '❌'}</span>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#e8e0d0', marginBottom: '0.3rem' }}>
                      <strong>Q{i + 1}.</strong> {a.questionText}
                    </p>
                    {!a.isCorrect && (
                      <p style={{ fontSize: '0.78rem', color: '#e74c3c' }}>
                        Your answer: <strong>{a.selectedAnswer || 'Not answered'}</strong>
                      </p>
                    )}
                    <p style={{ fontSize: '0.78rem', color: '#2ecc71' }}>
                      Correct: <strong>{a.correctAnswer}</strong>
                    </p>
                    {a.explanation && (
                      <p style={{ fontSize: '0.75rem', color: '#9090a0', marginTop: '0.2rem' }}>{a.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/')}>
            ⚔️ Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
