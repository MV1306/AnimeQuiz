import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizApi, type QuestionDto, type QuizQuestionsResponse } from '../api/quizApi';
import Timer from '../components/Timer';
import { useSound } from '../hooks/useSound';

const ROUND_SECONDS = 90;
const OPTIONS = ['A', 'B', 'C', 'D'] as const;
const ADVANCE_DELAY = 1400;

export default function Quiz() {
  const { participantId } = useParams<{ participantId: string }>();
  const navigate = useNavigate();
  const pid = Number(participantId);
  const { playCorrect, playWrong, playTick } = useSound();

  const [data, setData] = useState<QuizQuestionsResponse | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    quizApi.getQuestions(pid)
      .then(d => { setData(d); setTimerRunning(true); })
      .catch(() => setError('Failed to load questions.'))
      .finally(() => setLoading(false));
  }, [pid]);

  const doSubmit = useCallback(async (finalAnswers: Record<number, string>) => {
    if (!data) return;
    setTimerRunning(false);
    setSubmitting(true);
    try {
      const answerList = data.questions.map(q => ({
        questionId: q.id,
        selectedAnswer: finalAnswers[q.id] ?? '',
      }));
      const result = await quizApi.submitQuiz(pid, answerList);
      navigate(`/result/${pid}`, { state: { result } });
    } catch {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  }, [data, pid, navigate]);

  const handleSelect = useCallback((opt: string, q: QuestionDto) => {
    if (locked || submitting) return;
    setSelected(opt);
    setLocked(true);

    const isCorrect = opt === q.correctAnswer;
    if (isCorrect) playCorrect(); else playWrong();

    const newAnswers = { ...answers, [q.id]: opt };
    setAnswers(newAnswers);

    const isLast = currentQ === (data?.questions.length ?? 1) - 1;
    advanceRef.current = setTimeout(() => {
      if (isLast) {
        doSubmit(newAnswers);
      } else {
        setCurrentQ(i => i + 1);
        setSelected(null);
        setLocked(false);
      }
    }, ADVANCE_DELAY);
  }, [locked, submitting, answers, currentQ, data, playCorrect, playWrong, doSubmit]);

  const handleExpire = useCallback(() => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    doSubmit(answers);
  }, [answers, doSubmit]);

  const handleTick = useCallback((remaining: number) => {
    if (remaining <= 10) playTick();
  }, [playTick]);

  useEffect(() => () => {
    if (advanceRef.current) clearTimeout(advanceRef.current);
  }, []);

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
    <div style={{ minHeight: '100vh', padding: '1.25rem 1rem' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem' }}>
          <div>
            <h2 style={{ color: '#d4af37', fontSize: '1rem', fontFamily: 'Cinzel, serif' }}>⚔️ Demon Slayer Quiz</h2>
            <p style={{ color: '#9090a0', fontSize: '0.78rem', marginTop: '0.15rem' }}>
              {totalAnswered} of {data.questions.length} answered
            </p>
          </div>
          <Timer seconds={ROUND_SECONDS} onExpire={handleExpire} onTick={handleTick} running={timerRunning} />
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
          {data.questions.map((dq, i) => (
            <div key={dq.id} style={{
              width: 12, height: 12, borderRadius: '50%',
              background: answers[dq.id] ? '#d4af37' : i === currentQ ? '#8b0000' : '#2a2a3a',
              transition: 'background 0.3s',
              flexShrink: 0,
            }} />
          ))}
        </div>

        {/* Question card */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
            <span style={{ color: '#9090a0', fontSize: '0.82rem' }}>
              Question {currentQ + 1} / {data.questions.length}
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <span className={`badge badge-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
              <span className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37' }}>{q.category}</span>
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '1.25rem', color: '#e8e0d0' }}>
            {q.questionText}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {OPTIONS.map(opt => {
              const text = q[`option${opt}` as keyof QuestionDto] as string;
              const isSelected = selected === opt;
              const isCorrect = opt === q.correctAnswer;

              let cls = 'option-btn';
              if (locked) {
                if (isCorrect) cls += ' correct';
                else if (isSelected && !isCorrect) cls += ' wrong';
              } else if (isSelected) {
                cls += ' selected';
              }

              return (
                <button
                  key={opt}
                  className={cls}
                  onClick={() => handleSelect(opt, q)}
                  disabled={locked || submitting}
                >
                  <span className="option-label">{opt}</span>
                  {text}
                  {locked && isCorrect && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>✅</span>}
                  {locked && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>❌</span>}
                </button>
              );
            })}
          </div>

          {locked && !submitting && (
            <p style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#9090a0', textAlign: 'center' }}>
              {currentQ < data.questions.length - 1 ? '⏭ Next question in a moment...' : '⚔️ Submitting your result...'}
            </p>
          )}
          {submitting && (
            <p style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#d4af37', textAlign: 'center' }}>
              ⚔️ Calculating your result...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
