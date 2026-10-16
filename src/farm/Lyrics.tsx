import { interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../theme";
import { beat, SCENE } from "./timing";

const s = (n: number) => n * SCENE;

// Absolute frames. Each line follows the melody in scripts/generate-farm-song.mjs.
export const lyrics = [
  { from: 14, to: 52, text: "بيب!" },
  { from: beat(5.5), to: beat(10.5), text: "مرحبا يا أصحاب!" },
  { from: s(1), to: s(1) + beat(8), text: "البقرة موومو… موو موو موو!" },
  { from: s(1) + beat(8), to: s(2), text: "تهز الجرس… رن رن رن!" },
  { from: s(2), to: s(2) + beat(8), text: "لولو الحلوة… أُنك أُنك أُنك!" },
  { from: s(2) + beat(8), to: s(3), text: "تلف وتلف… هيييه! وتهز الذيل!" },
  { from: s(3) + 20, to: s(3) + 88, text: "موومو تقول… «بيب»؟!" },
  { from: s(3) + 92, to: s(3) + 160, text: "بيبو يقول… «موووو»!" },
  { from: s(3) + 165, to: s(4), text: "ههههه! غلطنا… نعيد من جديد!" },
  { from: s(4), to: s(4) + beat(8), text: "موو موو… بيب بيب… أُنك أُنك… هيه!" },
  { from: s(4) + beat(8), to: s(5), text: "صفّق صفّق… اقفز اقفز… يلا معانا!" },
  { from: s(5), to: s(5) + beat(4), text: "باي يا أصحاب…" },
  { from: s(5) + beat(4), to: s(5) + beat(9.5), text: "نرجع نغني؟" },
];

const textStyle: React.CSSProperties = {
  fontFamily,
  fontWeight: 900,
  fontSize: 80,
  lineHeight: 1.25,
  textAlign: "center",
  direction: "rtl",
  maxWidth: 940,
};

// Sing-along captions in the top safe area (clear of the Shorts UI at the bottom/right).
export const Lyrics: React.FC = () => {
  const f = useCurrentFrame();
  const line = lyrics.find((l) => f >= l.from && f < l.to);
  if (!line) return null;
  const fade = 7;
  const opacity = interpolate(f, [line.from, line.from + fade, line.to - fade, line.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(f, [line.from, line.from + fade], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 190,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${lift}px)`,
      }}
    >
      <div style={{ position: "relative" }}>
        <div style={{ ...textStyle, color: "#6b3fd1", WebkitTextStroke: "18px #6b3fd1" }}>{line.text}</div>
        <div style={{ ...textStyle, color: "#fff", position: "absolute", inset: 0 }}>{line.text}</div>
      </div>
    </div>
  );
};
