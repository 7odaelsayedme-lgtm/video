import { loopSin } from "./timing";

// The main hay bale Pipo hides in. The opening and closing shots frame it identically.
export const HAY = { x: 540, y: 1595, w: 380, h: 235 };
export const HAY_TOP = HAY.y - HAY.h;

export const HayBale: React.FC<{ x: number; y: number; w: number; h: number; wiggle?: number }> = ({
  x,
  y,
  w,
  h,
  wiggle = 0,
}) => (
  <g transform={`rotate(${wiggle} ${x} ${y})`}>
    <ellipse cx={x} cy={y} rx={w * 0.55} ry={18} fill="#2f5a1e" opacity={0.22} />
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={34} fill="url(#hay)" />
    {[0.25, 0.5, 0.75].map((p) => (
      <path
        key={p}
        d={`M ${x - w / 2 + 14} ${y - h * p} Q ${x} ${y - h * p + 10} ${x + w / 2 - 14} ${y - h * p}`}
        stroke="#c98d2a"
        strokeWidth={5}
        opacity={0.55}
        fill="none"
      />
    ))}
    <rect x={x - w * 0.3} y={y - h} width={16} height={h} fill="#b5502e" opacity={0.7} />
    <rect x={x + w * 0.3 - 16} y={y - h} width={16} height={h} fill="#b5502e" opacity={0.7} />
    {[-0.4, -0.2, 0.05, 0.22, 0.38].map((p, i) => (
      <path
        key={i}
        d={`M ${x + w * p} ${y - h + 4} l ${i % 2 ? 10 : -8} -22`}
        stroke="#f2c862"
        strokeWidth={6}
        strokeLinecap="round"
      />
    ))}
    <rect x={x - w / 2 + 20} y={y - h + 12} width={w * 0.45} height={22} rx={11} fill="#fff" opacity={0.25} />
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.95}>
    <circle cx={-70} cy={10} r={50} fill="#fff" />
    <circle cx={0} cy={-15} r={70} fill="#fff" />
    <circle cx={75} cy={10} r={52} fill="#fff" />
    <rect x={-120} y={10} width={245} height={50} rx={25} fill="#fff" />
  </g>
);

const Flower: React.FC<{ x: number; y: number; color: string; sway: number }> = ({ x, y, color, sway }) => (
  <g transform={`rotate(${sway} ${x} ${y})`}>
    <path d={`M ${x} ${y} L ${x} ${y - 50}`} stroke="#3e9a3a" strokeWidth={6} strokeLinecap="round" />
    {[0, 72, 144, 216, 288].map((d) => (
      <circle
        key={d}
        cx={x + Math.cos((d * Math.PI) / 180) * 14}
        cy={y - 56 + Math.sin((d * Math.PI) / 180) * 14}
        r={12}
        fill={color}
      />
    ))}
    <circle cx={x} cy={y - 56} r={9} fill="#ffe066" />
  </g>
);

const flowers = [
  { x: 70, y: 1780, c: "#ffb3c7" },
  { x: 180, y: 1870, c: "#c9b3ff" },
  { x: 960, y: 1800, c: "#a8e0ff" },
  { x: 1030, y: 1900, c: "#ffb3c7" },
  { x: 850, y: 1890, c: "#fff0a0" },
  { x: 300, y: 1910, c: "#a8e0ff" },
  { x: 120, y: 1320, c: "#fff0a0" },
  { x: 990, y: 1330, c: "#c9b3ff" },
];

// The whole farm set, drawn in world coordinates (1080x1920 plus margins for the camera).
// Everything that moves is periodic over the full video so the loop is seamless.
export const FarmSet: React.FC<{ t: number; hayWiggle?: number }> = ({ t, hayWiggle = 0 }) => (
  <g>
    <rect x={-1200} y={-1200} width={3480} height={2600} fill="url(#sky)" />
    <circle cx={880} cy={260} r={260} fill="url(#sunGlow)" />
    <circle cx={880} cy={260} r={95} fill="#fff1a6" />

    <Cloud x={200 + loopSin(t, 1) * 60} y={330} s={1.1} />
    <Cloud x={720 + loopSin(t, 1, 2) * 50} y={560} s={0.8} />
    <Cloud x={-60 + loopSin(t, 1, 4) * 40} y={720} s={0.7} />

    <ellipse cx={220} cy={1220} rx={700} ry={230} fill="url(#hillFar)" />
    <ellipse cx={980} cy={1240} rx={640} ry={210} fill="url(#hillFar)" />

    {/* barn */}
    <g transform="translate(250 1180)">
      <rect x={-170} y={-260} width={340} height={260} fill="url(#barnRed)" />
      <path d="M -200 -250 L 0 -420 L 200 -250 Z" fill="url(#roof)" />
      <path d="M -170 -260 L 0 -400 L 170 -260" stroke="#fff" strokeWidth={12} fill="none" />
      <circle cx={0} cy={-300} r={34} fill="#fff" />
      <circle cx={0} cy={-300} r={24} fill="#6b2a22" />
      <rect x={-75} y={-150} width={150} height={150} fill="#9b2426" stroke="#fff" strokeWidth={10} />
      <path d="M -75 -150 L 75 0 M 75 -150 L -75 0" stroke="#fff" strokeWidth={9} />
      <rect x={-170} y={-260} width={340} height={260} fill="none" stroke="#fff" strokeWidth={10} />
    </g>

    <rect x={-1200} y={1180} width={3480} height={1600} fill="url(#grass)" />

    {/* fence */}
    <g>
      <rect x={-1200} y={1225} width={3480} height={14} fill="#fff" />
      <rect x={-1200} y={1265} width={3480} height={14} fill="#fff" />
      {Array.from({ length: 22 }).map((_, i) => (
        <rect key={i} x={-560 + i * 110} y={1200} width={20} height={100} rx={8} fill="#fff" />
      ))}
    </g>

    <HayBale x={900} y={1360} w={200} h={120} />

    {flowers.map((f, i) => (
      <Flower key={i} x={f.x} y={f.y} color={f.c} sway={loopSin(t, 9, i) * 6} />
    ))}

    <HayBale x={HAY.x} y={HAY.y} w={HAY.w} h={HAY.h} wiggle={hayWiggle} />
  </g>
);
