export type EyeState = "open" | "wide" | "closed" | "happy";
export type MouthState = "smile" | "open" | "o" | "laugh" | "small";

type EyeProps = {
  cx: number;
  cy: number;
  r: number;
  state: EyeState;
  look?: number; // -1 (viewer left) .. 1 (viewer right)
  iris?: string; // gradient id; omitted = solid black bead eye
};

export const Eye: React.FC<EyeProps> = ({ cx, cy, r, state, look = 0, iris }) => {
  if (state === "closed") {
    return (
      <path
        d={`M ${cx - r} ${cy} Q ${cx} ${cy + r * 0.6} ${cx + r} ${cy}`}
        stroke="#2b160a"
        strokeWidth={r * 0.28}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (state === "happy") {
    return (
      <path
        d={`M ${cx - r} ${cy + r * 0.3} Q ${cx} ${cy - r * 0.9} ${cx + r} ${cy + r * 0.3}`}
        stroke="#2b160a"
        strokeWidth={r * 0.28}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const wide = state === "wide";
  const dx = look * r * 0.28;
  if (!iris) {
    const br = wide ? r * 1.15 : r;
    return (
      <g>
        <circle cx={cx + dx * 0.4} cy={cy} r={br} fill="#1b1b22" />
        <circle cx={cx + dx * 0.4 - br * 0.32} cy={cy - br * 0.35} r={br * 0.3} fill="#fff" />
        <circle cx={cx + dx * 0.4 + br * 0.3} cy={cy + br * 0.25} r={br * 0.14} fill="#fff" />
      </g>
    );
  }
  const sclera = wide ? r * 1.18 : r;
  const ir = wide ? r * 0.58 : r * 0.74;
  return (
    <g>
      <circle cx={cx} cy={cy} r={sclera} fill="#fff" stroke="#3a2a22" strokeOpacity={0.15} strokeWidth={2} />
      <circle cx={cx + dx} cy={cy + r * 0.05} r={ir} fill={`url(#${iris})`} />
      <circle cx={cx + dx} cy={cy + r * 0.05} r={ir * 0.5} fill="#160b05" />
      <circle cx={cx + dx - ir * 0.38} cy={cy - ir * 0.4} r={ir * 0.32} fill="#fff" />
      <circle cx={cx + dx + ir * 0.35} cy={cy + ir * 0.3} r={ir * 0.14} fill="#fff" />
    </g>
  );
};

type MouthProps = { cx: number; cy: number; w: number; state: MouthState; open?: number };

export const Mouth: React.FC<MouthProps> = ({ cx, cy, w, state, open = 1 }) => {
  const stroke = { stroke: "#5b2a25", strokeWidth: w * 0.09, strokeLinecap: "round" as const, fill: "none" };
  switch (state) {
    case "smile":
      return <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + w * 0.45} ${cx + w / 2} ${cy}`} {...stroke} />;
    case "small":
      return <path d={`M ${cx - w / 4} ${cy} Q ${cx} ${cy + w * 0.22} ${cx + w / 4} ${cy}`} {...stroke} />;
    case "o":
      return (
        <ellipse cx={cx} cy={cy + w * 0.12} rx={w * 0.2} ry={w * 0.24 * (0.5 + 0.5 * open)} fill="#7a2730" />
      );
    case "open": {
      const h = w * 0.55 * (0.35 + 0.65 * open);
      return (
        <g>
          <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + h * 1.6} ${cx + w / 2} ${cy} Z`} fill="#7a2730" />
          <ellipse cx={cx} cy={cy + h * 0.55} rx={w * 0.2} ry={h * 0.22} fill="#ff8a9a" />
        </g>
      );
    }
    case "laugh":
      return (
        <g>
          <path d={`M ${cx - w * 0.6} ${cy - w * 0.05} Q ${cx} ${cy + w} ${cx + w * 0.6} ${cy - w * 0.05} Z`} fill="#7a2730" />
          <ellipse cx={cx} cy={cy + w * 0.42} rx={w * 0.26} ry={w * 0.12} fill="#ff8a9a" />
        </g>
      );
  }
};

// Auto blink: closes the eyes for 4 frames every ~3 seconds.
export const blinking = (frame: number, offset = 0) => (frame + offset) % 97 < 4;
