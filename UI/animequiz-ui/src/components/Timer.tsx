import { useEffect, useState } from 'react';

interface Props {
  seconds: number;
  onExpire: () => void;
  onTick?: (remaining: number) => void;
  running: boolean;
}

export default function Timer({ seconds, onExpire, onTick, running }: Props) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) { onExpire(); return; }
    onTick?.(remaining);
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, running]); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = (remaining / seconds) * 100;
  const warning = remaining <= 15;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
      <span className={`timer ${warning ? 'timer-warning' : ''}`} style={{ color: warning ? '#e74c3c' : '#d4af37' }}>
        ⏱ {String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}
      </span>
      <div className="progress-bar" style={{ width: 110 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: warning ? '#e74c3c' : undefined }} />
      </div>
    </div>
  );
}
