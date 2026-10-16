import { Easing, interpolate } from "remotion";

// 128 BPM: every scene (7.5s = 225 frames) is exactly 16 beats = 4 bars,
// so every cut lands on a downbeat. scripts/generate-farm-song.mjs uses the same grid.
export const FPS = 30;
export const BPM = 128;
export const BEAT = (FPS * 60) / BPM; // 14.0625 frames
export const SCENE = 225;
export const TOTAL = SCENE * 6;

export const beat = (b: number) => b * BEAT;

const smooth = Easing.inOut(Easing.cubic);

// Clamped, eased interpolation over frame keys.
export const ease = (f: number, input: number[], output: number[]) =>
  interpolate(f, input, output, {
    easing: smooth,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const lin = (f: number, input: number[], output: number[]) =>
  interpolate(f, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// 0 → 1 → 0 bump between start and start + len.
export const bump = (f: number, start: number, len: number) => {
  if (f < start || f > start + len) return 0;
  return Math.sin(((f - start) / len) * Math.PI);
};

// Position inside the current beat, 0..1.
export const beatPhase = (f: number) => (f / BEAT) % 1;

// Periodic over the whole video so the last frame flows into the first.
export const loopSin = (absFrame: number, cycles: number, offset = 0) =>
  Math.sin((absFrame / TOTAL) * cycles * Math.PI * 2 + offset);
