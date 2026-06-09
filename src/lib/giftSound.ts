// ─────────────────────────────────────────────────────────────────────────────
// Gift sound effects — synthesized live with the Web Audio API.
//
// No audio files: every SFX is generated from oscillators + noise, so there is
// nothing to license, host, or ship. Streaming gift UIs lean heavily on punchy
// audio feedback (the "pop" on every TikTok send) — this gives us that for free.
//
// Browser-only. The AudioContext is created lazily on first play (always behind
// a user gesture, since gifts send on click) and reused.
// ─────────────────────────────────────────────────────────────────────────────

import type { GiftSound } from "./gifts";

let ctx: AudioContext | null = null;
let muted = false;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers suspend the context until a gesture resumes it.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setGiftSoundMuted(value: boolean) {
  muted = value;
}

export function isGiftSoundMuted(): boolean {
  return muted;
}

// A single enveloped oscillator tone.
function tone(
  ac: AudioContext,
  opts: { freq: number; type?: OscillatorType; start: number; dur: number; gain?: number; glideTo?: number },
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, opts.start);
  if (opts.glideTo) osc.frequency.exponentialRampToValueAtTime(opts.glideTo, opts.start + opts.dur);
  const peak = opts.gain ?? 0.18;
  g.gain.setValueAtTime(0.0001, opts.start);
  g.gain.exponentialRampToValueAtTime(peak, opts.start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.dur);
  osc.connect(g).connect(ac.destination);
  osc.start(opts.start);
  osc.stop(opts.start + opts.dur + 0.02);
}

// A burst of filtered white noise (whoosh, crowd, cymbal).
function noise(
  ac: AudioContext,
  opts: { start: number; dur: number; gain?: number; type?: BiquadFilterType; freq?: number; sweepTo?: number },
) {
  const frames = Math.floor(ac.sampleRate * opts.dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = opts.type ?? "bandpass";
  filter.frequency.setValueAtTime(opts.freq ?? 1200, opts.start);
  if (opts.sweepTo) filter.frequency.exponentialRampToValueAtTime(opts.sweepTo, opts.start + opts.dur);
  const g = ac.createGain();
  const peak = opts.gain ?? 0.15;
  g.gain.setValueAtTime(0.0001, opts.start);
  g.gain.exponentialRampToValueAtTime(peak, opts.start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, opts.start + opts.dur);
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(opts.start);
  src.stop(opts.start + opts.dur + 0.02);
}

const RECIPES: Record<GiftSound, (ac: AudioContext, t: number) => void> = {
  pop: (ac, t) => tone(ac, { freq: 420, glideTo: 900, type: "triangle", start: t, dur: 0.12, gain: 0.2 }),
  whistle: (ac, t) => tone(ac, { freq: 1800, glideTo: 2600, type: "sine", start: t, dur: 0.18, gain: 0.12 }),
  whoosh: (ac, t) => noise(ac, { start: t, dur: 0.35, freq: 300, sweepTo: 3000, gain: 0.14 }),
  drum: (ac, t) => {
    tone(ac, { freq: 160, glideTo: 60, type: "sine", start: t, dur: 0.18, gain: 0.3 });
    noise(ac, { start: t, dur: 0.06, freq: 2500, gain: 0.08, type: "highpass" });
  },
  horn: (ac, t) => {
    tone(ac, { freq: 233, type: "sawtooth", start: t, dur: 0.5, gain: 0.16 });
    tone(ac, { freq: 350, type: "sawtooth", start: t, dur: 0.5, gain: 0.1 });
  },
  sparkle: (ac, t) => {
    [880, 1175, 1568, 2093].forEach((f, i) => tone(ac, { freq: f, type: "triangle", start: t + i * 0.05, dur: 0.18, gain: 0.1 }));
  },
  boom: (ac, t) => {
    tone(ac, { freq: 120, glideTo: 40, type: "sine", start: t, dur: 0.6, gain: 0.38 });
    noise(ac, { start: t, dur: 0.5, freq: 400, sweepTo: 80, gain: 0.2, type: "lowpass" });
  },
  cheer: (ac, t) => {
    noise(ac, { start: t, dur: 0.9, freq: 1000, sweepTo: 1600, gain: 0.16 });
    [523, 659, 784].forEach((f, i) => tone(ac, { freq: f, type: "triangle", start: t + i * 0.04, dur: 0.5, gain: 0.07 }));
  },
  // Sad-trombone descent — the universal taunt for L / EZ / COPE.
  buzzer: (ac, t) => {
    [311, 277, 233, 185].forEach((f, i) => tone(ac, { freq: f, type: "sawtooth", start: t + i * 0.13, dur: 0.18, gain: 0.13 }));
  },
};

/** Play a gift's sound, scaled a little by combo size for extra punch. */
export function playGiftSound(sound: GiftSound, combo = 1) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  try {
    RECIPES[sound](ac, ac.currentTime);
    // A combo adds a quick rising echo so spamming feels escalatory.
    if (combo >= 5) tone(ac, { freq: 600 + Math.min(combo, 50) * 12, type: "triangle", start: ac.currentTime + 0.04, dur: 0.1, gain: 0.08 });
  } catch {
    // Audio is a nice-to-have; never let it break a send.
  }
}

/** Coin-purchase chime for the store. */
export function playCoinSound() {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  try {
    [784, 1047, 1319].forEach((f, i) => tone(ac, { freq: f, type: "triangle", start: ac.currentTime + i * 0.06, dur: 0.16, gain: 0.12 }));
  } catch {
    /* no-op */
  }
}
