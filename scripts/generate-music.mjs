// Generates an original, royalty-free background track for the video:
// 108 BPM so scene changes (every 100 frames = 3.33s) land exactly on beats 6 and 12.
// Usage: node scripts/generate-music.mjs  (writes public/audio/music.wav, needs no deps)
import { writeFileSync, mkdirSync } from "node:fs";

const SR = 44100;
const DURATION = 10;
const BPM = 108;
const BEAT = 60 / BPM;
const N = SR * DURATION;
const L = new Float32Array(N);
const R = new Float32Array(N);

const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const add = (i, l, r = l) => {
  if (i >= 0 && i < N) {
    L[i] += l;
    R[i] += r;
  }
};

let seed = 1;
const noise = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
};

// Am - F - C - G, one chord per bar
const chords = [
  [57, 60, 64],
  [53, 57, 60],
  [55, 60, 64],
  [55, 59, 62],
];
const bassRoots = [45, 41, 48, 43];
const barOf = (t) => Math.floor(t / (BEAT * 4)) % 4;

// Pad: detuned saws through a one-pole lowpass that opens over time
{
  let lpL = 0;
  let lpR = 0;
  const phases = new Float64Array(12);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const chord = chords[barOf(t)];
    let sl = 0;
    let sr = 0;
    chord.forEach((note, k) => {
      [-0.08, 0.08].forEach((det, d) => {
        const idx = k * 2 + d;
        phases[idx] = (phases[idx] + midi(note + det) / SR) % 1;
        const saw = phases[idx] * 2 - 1;
        if (d === 0) sl += saw;
        else sr += saw;
      });
    });
    const cutoff = 0.02 + 0.06 * Math.min(1, t / 6);
    lpL += cutoff * (sl - lpL);
    lpR += cutoff * (sr - lpR);
    const env = Math.min(1, t / 1.5);
    add(i, lpL * 0.09 * env, lpR * 0.09 * env);
  }
}

// Kick on every beat (from beat 2), with a pitch sweep
const kick = (start, gain = 1) => {
  let ph = 0;
  const len = Math.floor(SR * 0.35);
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    ph += (50 + 110 * Math.exp(-t * 30)) / SR;
    add(start + j, Math.sin(2 * Math.PI * ph) * Math.exp(-t * 9) * 0.55 * gain);
  }
};
for (let b = 2; b * BEAT < DURATION; b++) kick(Math.floor(b * BEAT * SR));

// Off-beat hi-hats (high-passed noise)
for (let b = 2; b * BEAT < DURATION; b++) {
  const start = Math.floor((b + 0.5) * BEAT * SR);
  let prev = 0;
  for (let j = 0; j < SR * 0.06; j++) {
    const n = noise();
    const hp = n - prev;
    prev = n;
    const v = hp * Math.exp(-(j / SR) * 60) * 0.08;
    add(start + j, v * 0.8, v);
  }
}

// Bass: eighth-note pulse on the chord root
for (let e = 4; e * BEAT * 0.5 < DURATION; e++) {
  const t0 = e * BEAT * 0.5;
  const f = midi(bassRoots[barOf(t0)]);
  const start = Math.floor(t0 * SR);
  for (let j = 0; j < SR * BEAT * 0.45; j++) {
    const t = j / SR;
    const s = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t);
    add(start + j, s * Math.exp(-t * 6) * 0.16);
  }
}

// Pluck arpeggio, panned left/right
for (let s = 0; s * BEAT * 0.5 < DURATION; s++) {
  const t0 = s * BEAT * 0.5;
  const chord = chords[barOf(t0)];
  const note = chord[s % 3] + 12;
  const f = midi(note);
  const start = Math.floor(t0 * SR);
  const pan = s % 2 === 0 ? 0.35 : -0.35;
  for (let j = 0; j < SR * 0.4; j++) {
    const t = j / SR;
    const v = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(6 * Math.PI * f * t)) * Math.exp(-t * 10) * 0.07;
    add(start + j, v * (1 - pan), v * (1 + pan));
  }
}

// Whoosh + impact at each scene change
[100 / 30, 200 / 30].forEach((hit) => {
  const len = Math.floor(SR * 0.8);
  const start = Math.floor(hit * SR) - len;
  let lp = 0;
  for (let j = 0; j < len; j++) {
    const p = j / len;
    lp += (0.02 + 0.3 * p) * (noise() - lp);
    add(start + j, lp * p * p * 0.35);
  }
  kick(Math.floor(hit * SR), 1.4);
});

// Soft clip and write 16-bit stereo WAV
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.tanh(L[i] * 1.2) * 32000), i * 4);
  data.writeInt16LE(Math.round(Math.tanh(R[i] * 1.2) * 32000), i * 4 + 2);
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
header.writeUInt32LE(data.length, 40);
header.write("data", 36);

mkdirSync("public/audio", { recursive: true });
writeFileSync("public/audio/music.wav", Buffer.concat([header, data]));
console.log("Wrote public/audio/music.wav");
