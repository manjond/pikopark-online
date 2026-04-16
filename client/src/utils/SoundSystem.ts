/**
 * Procedural sound effects + background music via the Web Audio API.
 * No audio files needed — all sounds are synthesised at runtime.
 * The AudioContext is created lazily on the first call (browser autoplay policy).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
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

// ─── Sound effects ────────────────────────────────────────────────────────────

export function playJump(): void {
  tone(220, 440, 0.14, 0.18, 'square');
}

export function playButtonPress(): void {
  tone(660, 880, 0.1, 0.2, 'sine');
}

export function playDoorOpen(): void {
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

// ─── Background music ─────────────────────────────────────────────────────────
// A simple looping chiptune: bass drone + 8-note square-wave melody.
// C major pentatonic — C4 E4 G4 E4 G4 A4 G4 C5

const MELODY_FREQS = [261, 329, 392, 329, 392, 440, 392, 523];
const NOTE_DUR     = 0.28;  // seconds per note
const LOOP_DUR     = MELODY_FREQS.length * NOTE_DUR; // ~2.24s

let bgLooping = false;
let bgTimer: ReturnType<typeof setTimeout> | null = null;
// Master gain shared by all bg nodes so volume is consistent
let bgGain: GainNode | null = null;

function getBgGain(): GainNode {
  const c = getCtx();
  if (!bgGain) {
    bgGain = c.createGain();
    bgGain.gain.value = 0.08;
    bgGain.connect(c.destination);
  }
  return bgGain;
}

function scheduleBgIteration(startTime: number): void {
  if (!bgLooping) return;
  const c = getCtx();
  const g = getBgGain();

  // Bass drone (one long sine note per loop)
  const bass = c.createOscillator();
  const bassGain = c.createGain();
  bass.connect(bassGain);
  bassGain.connect(g);
  bass.type = 'sine';
  bass.frequency.value = 65; // C2
  bassGain.gain.setValueAtTime(0.5, startTime);
  bassGain.gain.setValueAtTime(0.5, startTime + LOOP_DUR - 0.05);
  bassGain.gain.linearRampToValueAtTime(0, startTime + LOOP_DUR);
  bass.start(startTime);
  bass.stop(startTime + LOOP_DUR);

  // Melody
  MELODY_FREQS.forEach((freq, i) => {
    const osc = c.createOscillator();
    const noteGain = c.createGain();
    osc.connect(noteGain);
    noteGain.connect(g);
    osc.type = 'square';
    osc.frequency.value = freq;
    const t = startTime + i * NOTE_DUR;
    noteGain.gain.setValueAtTime(0.3, t);
    noteGain.gain.exponentialRampToValueAtTime(0.001, t + NOTE_DUR * 0.85);
    osc.start(t);
    osc.stop(t + NOTE_DUR);
  });

  // Schedule the next loop ~50 ms before this one ends for seamless looping
  bgTimer = setTimeout(() => {
    scheduleBgIteration(c.currentTime + 0.05);
  }, (LOOP_DUR - 0.05) * 1000);
}

export function startBgMusic(): void {
  if (bgLooping) return;
  bgLooping = true;
  scheduleBgIteration(getCtx().currentTime + 0.1);
}

export function stopBgMusic(): void {
  bgLooping = false;
  if (bgTimer !== null) {
    clearTimeout(bgTimer);
    bgTimer = null;
  }
}
