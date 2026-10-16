// Generates the original, royalty-free track for the FarmSong composition (45s).
// 128 BPM, C major: every scene (7.5s) is exactly 16 beats / 4 bars, matching src/farm/timing.ts.
// Instruments: ukulele strums (Karplus-Strong), marimba melody, soft bass, claps, shaker, glockenspiel,
// plus gentle animal/foley effects. Nothing loud or sudden; final loudness is normalised by `npm run farm-music`.
// Usage: node scripts/generate-farm-song.mjs  (writes public/audio/farm-song.wav, needs no deps)
import { writeFileSync, mkdirSync } from "node:fs";

const SR = 44100;
const DURATION = 45;
const BPM = 128;
const BEAT = 60 / BPM;
const SCENE = 7.5;
const N = SR * DURATION;
const L = new Float32Array(N);
const R = new Float32Array(N);

const midi = (n) => 440 * 2 ** ((n - 69) / 12);
// Wraps around so a sound that rings past 45s continues at the start of the loop.
const add = (i, l, r = l) => {
  const k = ((i % N) + N) % N;
  L[k] += l;
  R[k] += r;
};
const at = (scene, beats) => scene * SCENE + beats * BEAT;
const frame = (scene, f) => scene * SCENE + f / 30;

let seed = 7;
const noise = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
};

// ---------------------------------------------------------------- instruments
const pluck = (t, note, gain, pan = 0, len = 0.9) => {
  const f = midi(note);
  const period = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(period);
  for (let i = 0; i < period; i++) buf[i] = noise();
  const start = Math.floor(t * SR);
  let idx = 0;
  let lp = 0;
  for (let j = 0; j < SR * len; j++) {
    const next = (idx + 1) % period;
    const v = 0.5 * (buf[idx] + buf[next]) * 0.994;
    buf[idx] = v;
    idx = next;
    lp += 0.5 * (v - lp);
    const env = j < SR * len - 2000 ? 1 : (SR * len - j) / 2000;
    add(start + j, lp * gain * env * (1 - pan), lp * gain * env * (1 + pan));
  }
};

const strum = (t, chord, gain = 0.09, up = false) => {
  const notes = up ? [...chord].reverse() : chord;
  notes.forEach((n, i) => pluck(t + i * 0.012, n, gain, (i - 1.5) * 0.12));
};

const marimba = (t, note, dur, gain = 0.2) => {
  const f = midi(note);
  const start = Math.floor(t * SR);
  const len = Math.max(dur, 0.35) * SR + SR * 0.3;
  for (let j = 0; j < len; j++) {
    const x = j / SR;
    const atk = Math.min(1, x / 0.004);
    const v =
      (Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 3.2) + 0.35 * Math.sin(2 * Math.PI * f * 4 * x) * Math.exp(-x * 14)) *
      atk *
      gain;
    add(start + j, v * 0.95, v);
  }
};

const glock = (t, note, gain = 0.08) => {
  const f = midi(note);
  const start = Math.floor(t * SR);
  for (let j = 0; j < SR * 1.2; j++) {
    const x = j / SR;
    const v = (Math.sin(2 * Math.PI * f * x) + 0.25 * Math.sin(2 * Math.PI * f * 2.76 * x)) * Math.exp(-x * 4) * gain;
    add(start + j, v * 0.8, v);
  }
};

const bass = (t, note, dur, gain = 0.22) => {
  const f = midi(note);
  const start = Math.floor(t * SR);
  for (let j = 0; j < SR * dur; j++) {
    const x = j / SR;
    const env = Math.min(1, x / 0.01) * Math.exp(-x * 2.5) * Math.min(1, (dur - x) / 0.05);
    add(start + j, (Math.sin(2 * Math.PI * f * x) + 0.2 * Math.sin(4 * Math.PI * f * x)) * env * gain);
  }
};

const clap = (t, gain = 0.1) => {
  const start = Math.floor(t * SR);
  [0, 0.009, 0.018].forEach((o, k) => {
    let prev = 0;
    for (let j = 0; j < SR * 0.12; j++) {
      const n = noise();
      const hp = n - prev * 0.6;
      prev = n;
      const v = hp * Math.exp(-(j / SR) * (k === 2 ? 28 : 120)) * gain;
      add(start + Math.floor(o * SR) + j, v * 0.9, v);
    }
  });
};

const shaker = (t, gain = 0.025) => {
  const start = Math.floor(t * SR);
  let prev = 0;
  for (let j = 0; j < SR * 0.05; j++) {
    const n = noise();
    const v = (n - prev) * Math.sin((j / (SR * 0.05)) * Math.PI) * gain;
    prev = n;
    add(start + j, v, v * 0.8);
  }
};

const pad = (t, notes, dur, gain = 0.035) => {
  const start = Math.floor(t * SR);
  for (let j = 0; j < SR * dur; j++) {
    const x = j / SR;
    const env = Math.min(1, x / 0.4) * Math.min(1, (dur - x) / 0.6);
    let v = 0;
    notes.forEach((n) => (v += Math.sin(2 * Math.PI * midi(n) * x) + 0.15 * Math.sin(4 * Math.PI * midi(n) * x)));
    add(start + j, v * env * gain);
  }
};

// ---------------------------------------------------------------- gentle sound effects
// A two-pole resonant band-pass, used to give "voices" a vowel colour.
const bandpass = (fc, q) => {
  const w = (2 * Math.PI * fc) / SR;
  const alpha = Math.sin(w) / (2 * q);
  const b0 = alpha, b2 = -alpha, a0 = 1 + alpha, a1 = -2 * Math.cos(w), a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};

const moo = (t, base = 150, dur = 0.42, gain = 0.5) => {
  const start = Math.floor(t * SR);
  const f1 = bandpass(500, 3);
  const f2 = bandpass(900, 4);
  let ph = 0;
  for (let j = 0; j < SR * dur; j++) {
    const x = j / SR;
    const p = x / dur;
    const f = base * (1.12 - 0.25 * p) * (1 + 0.015 * Math.sin(2 * Math.PI * 5.5 * x));
    ph = (ph + f / SR) % 1;
    const src = ph * 2 - 1;
    const env = Math.min(1, x / 0.06) * Math.min(1, (dur - x) / 0.12);
    const v = (f1(src) * 1.2 + f2(src) * 0.6) * env * gain;
    add(start + j, v);
  }
};

const peep = (t, gain = 0.07, pitch = 1) => {
  const start = Math.floor(t * SR);
  const dur = 0.14;
  let ph = 0;
  for (let j = 0; j < SR * dur; j++) {
    const x = j / SR;
    const p = x / dur;
    const f = (2100 + 900 * Math.sin(p * Math.PI)) * pitch;
    ph += f / SR;
    const env = Math.sin(p * Math.PI);
    add(start + j, Math.sin(2 * Math.PI * ph) * env * gain);
  }
};

const oink = (t, gain = 0.35) => {
  [0, 0.13].forEach((o) => {
    const start = Math.floor((t + o) * SR);
    const dur = 0.11;
    const bp = bandpass(800, 2.5);
    let ph = 0;
    for (let j = 0; j < SR * dur; j++) {
      const x = j / SR;
      ph = (ph + (210 - 60 * (x / dur)) / SR) % 1;
      const src = (ph * 2 - 1) * 0.7 + noise() * 0.3;
      const env = Math.sin((x / dur) * Math.PI);
      add(start + j, bp(src) * env * gain);
    }
  });
};

const bell = (t, gain = 0.05) => {
  const start = Math.floor(t * SR);
  for (let j = 0; j < SR * 1.0; j++) {
    const x = j / SR;
    const v =
      (Math.sin(2 * Math.PI * 1760 * x) + 0.5 * Math.sin(2 * Math.PI * 4230 * x) * Math.exp(-x * 6)) * Math.exp(-x * 4) * gain;
    add(start + j, v * 0.8, v);
  }
};

const whoosh = (t, dur = 0.4, gain = 0.12) => {
  const start = Math.floor(t * SR);
  let lp = 0;
  for (let j = 0; j < SR * dur; j++) {
    const p = j / (SR * dur);
    lp += (0.03 + 0.12 * Math.sin(p * Math.PI)) * (noise() - lp);
    add(start + j, lp * Math.sin(p * Math.PI) * gain);
  }
};

const boing = (t, gain = 0.06, from = 260, to = 520) => {
  const start = Math.floor(t * SR);
  const dur = 0.3;
  let ph = 0;
  for (let j = 0; j < SR * dur; j++) {
    const x = j / SR;
    const p = x / dur;
    ph += (from + (to - from) * p + 30 * Math.sin(2 * Math.PI * 18 * x)) / SR;
    add(start + j, Math.sin(2 * Math.PI * ph) * Math.exp(-x * 6) * gain);
  }
};

const pop = (t, gain = 0.12) => {
  const start = Math.floor(t * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.09; j++) {
    const x = j / SR;
    ph += (180 - 900 * x) / SR;
    add(start + j, Math.sin(2 * Math.PI * ph) * Math.exp(-x * 40) * gain);
  }
};

const step = (t, gain = 0.06) => {
  const start = Math.floor(t * SR);
  for (let j = 0; j < SR * 0.05; j++) {
    const x = j / SR;
    add(start + j, Math.sin(2 * Math.PI * 520 * x) * Math.exp(-x * 70) * gain);
  }
};

// ---------------------------------------------------------------- harmony
const C = [55, 60, 64, 67];
const F = [57, 60, 65, 69];
const G = [55, 59, 62, 67];
const roots = { C: 36, F: 41, G: 43 };
const chordOf = { C, F, G };

// scene index -> 4 bars of chords (scene 4, index 3, is the stop-time gag)
const progressions = [
  ["C", "F", "G", "C"],
  ["C", "F", "G", "C"],
  ["C", "F", "G", "C"],
  null,
  ["C", "F", "G", "C"],
  ["C", "F", "C", "G"],
];

progressions.forEach((prog, s) => {
  if (!prog) return;
  prog.forEach((name, bar) => {
    for (let b = 0; b < 4; b++) {
      const t = at(s, bar * 4 + b);
      // pattern: down, down-up, down, down-up
      strum(t, chordOf[name], s === 0 && bar === 0 && b === 0 ? 0.06 : 0.085);
      if (b % 2 === 1) strum(t + BEAT / 2, chordOf[name], 0.05, true);
      const full = !(s === 0 && bar < 2);
      if (full && (b === 0 || b === 2)) bass(t, roots[name] + (b === 2 ? 7 : 0), BEAT * 1.6);
      if (full) {
        shaker(t + BEAT / 2);
        shaker(t);
      }
      if ((s === 1 || s === 2) && (b === 1 || b === 3)) clap(t, 0.07);
    }
  });
});

// ---------------------------------------------------------------- melody (beats inside each scene)
// G-E-C is the "peep!" motif: it opens the song and the ending leads straight back to it.
const melody = [
  [[1, 67, 1], [2, 64, 1], [3, 60, 1.5], [6, 64, 0.5], [6.5, 64, 0.5], [7, 62, 0.5], [7.5, 64, 0.5], [8, 67, 2], [10, 69, 1], [11, 67, 1], [12, 64, 1], [13, 62, 1], [14, 60, 2]],
  [[0, 60, 0.5], [0.5, 62, 0.5], [1, 64, 0.5], [1.5, 64, 0.5], [2, 67, 1], [3, 67, 1], [4, 60, 1], [5, 60, 1], [6, 60, 1.5], [8, 65, 0.5], [8.5, 65, 0.5], [9, 69, 0.5], [9.5, 69, 0.5], [10, 67, 1.5], [12, 72, 1], [13, 76, 1], [14, 79, 1.5]],
  [[0, 64, 0.5], [0.5, 64, 0.5], [1, 67, 0.5], [1.5, 67, 0.5], [2, 69, 1], [3, 67, 1], [4, 64, 1], [5, 64, 1], [6, 64, 1.5], [8, 65, 0.5], [8.5, 64, 0.5], [9, 62, 0.5], [9.5, 60, 0.5], [10, 62, 1], [11, 64, 1], [12, 67, 1.5], [14, 64, 0.5], [14.5, 62, 0.5], [15, 60, 1]],
  [],
  [[0, 60, 0.5], [0.5, 60, 0.5], [1, 64, 0.5], [1.5, 64, 0.5], [2, 67, 0.5], [2.5, 67, 0.5], [3, 72, 1], [4, 69, 1], [5, 67, 1], [6, 64, 1], [7, 67, 1], [8, 65, 0.5], [8.5, 65, 0.5], [9, 69, 0.5], [9.5, 69, 0.5], [10, 67, 0.5], [10.5, 67, 0.5], [11, 64, 1], [12, 62, 1], [13, 64, 1], [14, 60, 2]],
  [[0, 67, 1], [1, 64, 1], [2, 60, 2], [4, 62, 0.5], [4.5, 64, 0.5], [5, 65, 0.5], [5.5, 67, 1.5], [8, 72, 1], [9, 67, 1], [10, 64, 2], [12, 60, 1], [13, 62, 1], [14, 64, 1], [15, 65, 1]],
];

melody.forEach((notes, s) =>
  notes.forEach(([b, n, d]) => {
    marimba(at(s, b), n, d * BEAT, s === 5 && b >= 8 ? 0.14 : 0.2);
    if (s === 4) glock(at(s, b), n + 12, 0.05); // big finish: glockenspiel doubles the tune
  }),
);

// ---------------------------------------------------------------- scene-by-scene effects (synced to src/farm/scenes.tsx)
// 1: Pipo pops out of the hay at frame 14
whoosh(frame(0, 8), 0.3, 0.1);
peep(frame(0, 15), 0.09);
whoosh(frame(0, 150), 0.25, 0.06);
pop(frame(0, 180));

// 2: Moomo walks in, moos, rings her bell
for (let b = 0; b < 4; b++) [0, 0.5].forEach((h) => step(at(1, b + h)));
[4, 5, 6].forEach((b) => moo(at(1, b), 150, BEAT * 0.8));
[8, 10].forEach((b) => bell(at(1, b), 0.025));
[12, 13, 14].forEach((b) => bell(at(1, b), 0.05));

// 3: Lulu hops in, oinks, twirls, wiggles her tail
[1, 2, 3, 4].forEach((b) => pop(at(2, b) - 0.02, 0.07));
[4, 5, 6].forEach((b) => oink(at(2, b)));
whoosh(at(2, 8), BEAT * 4, 0.08);
[72, 76, 79].forEach((n) => glock(at(2, 12), n, 0.05));
[13, 14, 15].forEach((b) => boing(at(2, b), 0.04));

// 4: stop-time gag — soft held chord, Moomo says "peep!", Pipo says "MOOO", everyone giggles
pad(at(3, 0), [48, 55, 60, 64], 3.0, 0.03);
pad(at(3, 0) + 3.0, [53, 57, 60, 65], 2.6, 0.03);
pad(at(3, 0) + 5.4, [48, 55, 60, 64], 2.1, 0.035);
peep(frame(3, 28), 0.06, 0.85);
moo(frame(3, 100), 82, 1.25, 0.6);
[0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => glock(frame(3, 168) + i * 0.16, [79, 76, 79, 76, 77, 74, 72, 76][i], 0.045));

// 5: group dance — animal call-and-response, claps and jump landings
[0, 0.5].forEach((b) => moo(at(4, b), 150, 0.22, 0.4));
[1, 1.5].forEach((b) => peep(at(4, b), 0.07));
[2, 2.5].forEach((b) => oink(at(4, b), 0.28));
[0, 1, 8, 9].forEach((b) => clap(at(4, b), 0.11));
[3, 4, 11, 12].forEach((b) => pop(at(4, b) - 0.07, 0.1));
for (let b = 0; b < 16; b++) if (b % 2 === 1) clap(at(4, b), 0.05);

// 6: goodbye, Pipo winks and dives back into the hay
glock(frame(5, 88), 88, 0.04);
glock(frame(5, 92), 91, 0.035);
boing(frame(5, 106), 0.05, 300, 600);
whoosh(frame(5, 138), 0.35, 0.09);
for (let b = 8; b < 14; b++) step(at(5, b), 0.04);

// ---------------------------------------------------------------- write 16-bit stereo WAV
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.tanh(L[i]) * 30000), i * 4);
  data.writeInt16LE(Math.round(Math.tanh(R[i]) * 30000), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

mkdirSync("public/audio", { recursive: true });
writeFileSync("public/audio/farm-song.wav", Buffer.concat([header, data]));
console.log("Wrote public/audio/farm-song.wav");
