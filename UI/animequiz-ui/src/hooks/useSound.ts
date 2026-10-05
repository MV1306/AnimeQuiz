import { useCallback, useRef } from 'react';

function getCtx(): AudioContext | null {
  try { return new (window.AudioContext || (window as any).webkitAudioContext)(); }
  catch { return null; }
}

function playTone(ctx: AudioContext, freq: number, type: OscillatorType, duration: number, gainVal = 0.3) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getOrCreate = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = getCtx();
    return ctxRef.current;
  }, []);

  const playCorrect = useCallback(() => {
    const ctx = getOrCreate();
    if (!ctx) return;
    ctx.resume().then(() => {
      playTone(ctx, 523, 'sine', 0.15, 0.25);
      setTimeout(() => playTone(ctx, 659, 'sine', 0.15, 0.25), 120);
      setTimeout(() => playTone(ctx, 784, 'sine', 0.25, 0.3), 240);
    });
  }, [getOrCreate]);

  const playWrong = useCallback(() => {
    const ctx = getOrCreate();
    if (!ctx) return;
    ctx.resume().then(() => {
      playTone(ctx, 300, 'sawtooth', 0.12, 0.2);
      setTimeout(() => playTone(ctx, 220, 'sawtooth', 0.2, 0.25), 100);
    });
  }, [getOrCreate]);

  const playTick = useCallback(() => {
    const ctx = getOrCreate();
    if (!ctx) return;
    ctx.resume().then(() => playTone(ctx, 880, 'square', 0.05, 0.08));
  }, [getOrCreate]);

  return { playCorrect, playWrong, playTick };
}
