import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi, type LeaderboardEntry } from '../api/quizApi';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

function getRankTitle(score: number): string {
  if (score >= 90) return 'Hashira';
  if (score >= 75) return 'Demon Slayer';
  if (score >= 60) return 'Mizunoto';
  if (score >= 40) return 'Apprentice';
  return 'Trainee';
}

export default function Landing() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);

  useEffect(() => {
    quizApi.getLeaderboard(10)
      .then(setLeaders)
      .catch(() => setLeaders([]))
      .finally(() => setLoadingBoard(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="container">

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '2rem 0 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>⚔️</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#d4af37', marginBottom: '0.4rem', lineHeight: 1.1 }}>
            AnimeQuiz
          </h1>
          <p style={{ fontSize: '1rem', color: '#c0392b', fontFamily: 'Cinzel, serif', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>
            Demon Slayer: Kimetsu no Yaiba
          </p>
          <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'left', maxWidth: 520, margin: '0 auto 1.5rem' }}>
            <p style={{ color: '#9090a0', lineHeight: 1.7, marginBottom: '1rem' }}>
              Test your knowledge of the Demon Slayer universe — characters, Hashira, demons, breathing styles, story arcs and more.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              {[['📋', '200 Questions in bank'], ['🎯', '5 Random per session'], ['⏱️', '90 Second timer'], ['🏆', 'Score & leaderboard']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e8e0d0', fontSize: '0.88rem' }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }}
            onClick={() => navigate('/register')}
          >
            ⚔️ Start Quiz
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#9090a0' }}>
            By participating you consent to your name, mobile and email being collected for quiz tracking purposes.
          </p>
        </div>

        <hr className="divider" />

        {/* Leaderboard */}
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: '#d4af37', fontSize: '1.3rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            🏆 Leaderboard
          </h2>

          {loadingBoard ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9090a0' }}>Loading...</div>
          ) : leaders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#9090a0', padding: '2rem' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚔️</p>
              <p>No completed quizzes yet. Be the first!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {leaders.map((entry, i) => {
                const isTop3 = i < 3;
                return (
                  <div
                    key={entry.id}
                    className="card"
                    style={{
                      padding: '0.9rem 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      borderColor: i === 0 ? '#d4af37' : i === 1 ? '#9090a0' : i === 2 ? '#cd7f32' : '#2a2a3a',
                      background: i === 0 ? 'rgba(212,175,55,0.06)' : undefined,
                    }}
                  >
                    {/* Rank */}
                    <div style={{ minWidth: 36, textAlign: 'center' }}>
                      {isTop3 ? (
                        <span style={{ fontSize: '1.5rem' }}>{RANK_MEDALS[i]}</span>
                      ) : (
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#9090a0', fontFamily: 'Cinzel, serif' }}>
                          #{i + 1}
                        </span>
                      )}
                    </div>

                    {/* Name + title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#e8e0d0', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9090a0', marginTop: '0.1rem' }}>
                        {getRankTitle(Number(entry.score))}
                      </p>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1.1rem',
                        color: Number(entry.score) >= 80 ? '#d4af37' : Number(entry.score) >= 60 ? '#2ecc71' : '#9090a0'
                      }}>
                        {Number(entry.score).toFixed(0)}%
                      </p>
                      <p style={{ fontSize: '0.72rem', color: '#9090a0' }}>
                        {entry.correctAnswers}/{entry.totalQuestions} correct
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
