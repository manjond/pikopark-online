/**
 * Procedural sound effects via the Web Audio API.
 * No audio files needed — all sounds are synthesised at runtime.
 * The AudioContext is created lazily on the first play call (browser policy).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  // Resume if the browser suspended the context (autoplay policy)
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  freqEnd: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'square',
  startOffset = 0,
): void {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = type;
  const t = c.currentTime + startOffset;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== freq) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  }
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

export function playJump(): void {
  tone(220, 440, 0.14, 0.18, 'square');
}

export function playLand(): void {
  tone(180, 80, 0.08, 0.12, 'sine');
}

export function playButtonPress(): void {
  tone(660, 880, 0.1, 0.2, 'sine');
}

export function playDoorOpen(): void {
  // Two-note ascending whoosh
  tone(200, 500, 0.25, 0.15, 'sine');
  tone(300, 700, 0.2, 0.1, 'sine', 0.05);
}

export function playLevelComplete(): void {
  // Four-note victory fanfare: C E G C (major arpeggio)
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    tone(freq, freq, 0.22, 0.2, 'square', i * 0.13);
  });
}
