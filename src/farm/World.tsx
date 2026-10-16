import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Defs } from "./Defs";
import { FarmSet, HAY_TOP } from "./Farm";
import { fontFamily } from "../theme";

export type Cam = { x: number; y: number; zoom: number };

// Renders the farm through a virtual camera. `children` are SVG in world coordinates,
// `overlay` is HTML in world coordinates (used for Arabic speech bubbles).
export const World: React.FC<{
  t: number;
  cam: Cam;
  hayWiggle?: number;
  children?: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ t, cam, hayWiggle, children, overlay }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#bfe8ff" }}>
    <div
      style={{
        position: "absolute",
        width: 1080,
        height: 1920,
        transformOrigin: "0 0",
        transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
      }}
    >
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ overflow: "visible", position: "absolute" }}>
        <Defs />
        <clipPath id="hayClip">
          <rect x={-2000} y={-2000} width={5000} height={2000 + HAY_TOP + 10} />
        </clipPath>
        <FarmSet t={t} hayWiggle={hayWiggle} />
        {children}
      </svg>
      {overlay}
    </div>
  </AbsoluteFill>
);

// Camera keyframes: interpolate x, y and zoom over the same frame keys.
export const camAt = (f: number, keys: number[], cams: Cam[]): Cam => {
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const e = (vals: number[]) => {
    // smoothstep per segment for gentle starts and stops
    for (let i = 0; i < keys.length - 1; i++) {
      if (f <= keys[i + 1]) {
        const p = interpolate(f, [keys[i], keys[i + 1]], [0, 1], opts);
        const s = p * p * (3 - 2 * p);
        return vals[i] + (vals[i + 1] - vals[i]) * s;
      }
    }
    return vals[vals.length - 1];
  };
  return { x: e(cams.map((c) => c.x)), y: e(cams.map((c) => c.y)), zoom: e(cams.map((c) => c.zoom)) };
};

export const Bubble: React.FC<{ x: number; y: number; text: string; from: number; to: number; size?: number; color?: string }> = ({
  x,
  y,
  text,
  from,
  to,
  size = 70,
  color = "#ff5b8a",
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from || f > to) return null;
  const s = spring({ frame: f - from, fps, config: { damping: 12, stiffness: 140 } });
  const out = interpolate(f, [to - 8, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${s * out})`,
        transformOrigin: "50% 100%",
        background: "#fff",
        borderRadius: size * 0.6,
        padding: `${size * 0.15}px ${size * 0.45}px`,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        color,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 0 rgba(60,40,120,0.15)",
        direction: "rtl",
      }}
    >
      {text}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -size * 0.28,
          width: size * 0.5,
          height: size * 0.5,
          background: "#fff",
          transform: "translateX(-50%) rotate(45deg)",
          borderRadius: 6,
        }}
      />
    </div>
  );
};

export const Note: React.FC<{ x: number; y: number; s?: number; color: string; opacity: number }> = ({
  x,
  y,
  s = 1,
  color,
  opacity,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={18} ry={14} transform="rotate(-20)" fill={color} />
    <rect x={13} y={-62} width={7} height={62} rx={3} fill={color} />
    <path d="M 20 -62 Q 44 -50 36 -26" stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);

export const Sparkle: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <path
    d="M0,-30 Q4,-4 30,0 Q4,4 0,30 Q-4,4 -30,0 Q-4,-4 0,-30 Z"
    transform={`translate(${x} ${y}) scale(${s})`}
    fill="#fff6a8"
  />
);
