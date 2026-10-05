import { forwardRef } from 'react';

interface Props {
  name: string;
  score: number;
  correct: number;
  total: number;
  rankTitle: string;
  rankEmoji: string;
  rankColor: string;
}

const ShareCard = forwardRef<HTMLDivElement, Props>(
  ({ name, score, correct, total, rankTitle, rankEmoji, rankColor }, ref) => {
    const wrong = total - correct;

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 420,
          background: '#12121a',
          border: `2px solid ${rankColor}`,
          borderRadius: 16,
          padding: '2rem 2rem 1.5rem',
          fontFamily: 'Inter, sans-serif',
          color: '#e8e0d0',
          boxShadow: `0 0 40px ${rankColor}33`,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>⚔️</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.3rem', color: '#d4af37', fontWeight: 900, letterSpacing: '0.05em' }}>
            AnimeQuiz
          </div>
          <div style={{ fontSize: '0.75rem', color: '#c0392b', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', marginTop: '0.2rem' }}>
            Demon Slayer: Kimetsu no Yaiba
          </div>
        </div>

        {/* Score circle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: `conic-gradient(${rankColor} ${score * 3.6}deg, #2a2a3a 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 86, height: 86, borderRadius: '50%', background: '#12121a',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Cinzel, serif', color: rankColor, lineHeight: 1 }}>
                {score.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Rank badge */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block', padding: '0.35rem 1.1rem', borderRadius: 99,
            background: `${rankColor}22`, color: rankColor,
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '0.9rem',
          }}>
            {rankEmoji} {rankTitle}
          </span>
        </div>

        {/* Name */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#e8e0d0' }}>{name}</p>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem', marginBottom: '1.25rem',
          background: '#0a0a0f', borderRadius: 10, padding: '0.85rem',
        }}>
          {[
            { label: 'Total', value: total, color: '#e8e0d0' },
            { label: 'Correct', value: correct, color: '#2ecc71' },
            { label: 'Wrong', value: wrong, color: '#e74c3c' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#9090a0', marginTop: '0.1rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer URL */}
        <div style={{ textAlign: 'center', borderTop: '1px solid #2a2a3a', paddingTop: '0.85rem' }}>
          <p style={{ fontSize: '0.72rem', color: '#9090a0' }}>anime-quiz-henna.vercel.app</p>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
export default ShareCard;
