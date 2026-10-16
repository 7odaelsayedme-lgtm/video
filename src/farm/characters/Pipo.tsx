import { useCurrentFrame } from "remotion";
import { blinking, EyeState, Eye } from "./Face";

// Pipo the chick. Origin = between his boots; ~270px tall at scale 1 (half of Moomo).
// Fixed design: lemon-yellow fluff ball, three feathers poking out of a sky-blue cap
// worn BACKWARDS, shiny orange rain boots, black bead eyes with two sparkles.
export type BeakState = "closed" | "open" | "wide";

export type PipoProps = {
  x: number;
  y: number;
  scale?: number;
  leftWing?: number;
  rightWing?: number;
  beak?: BeakState;
  eyes?: EyeState;
  wink?: boolean;
  look?: number;
  puff?: number; // 0..1 feathers puffed up
  tilt?: number;
  capTilt?: number;
  squash?: number;
  legLift?: [number, number];
};

const Wing: React.FC<{ side: -1 | 1; angle: number }> = ({ side, angle }) => (
  <g transform={`translate(${side * 90} -120) rotate(${side === -1 ? angle : -angle})`}>
    <ellipse cx={side * 12} cy={30} rx={27} ry={46} transform={`rotate(${side * 22} ${side * 12} 30)`} fill="url(#pBody)" />
    <ellipse cx={side * 6} cy={18} rx={12} ry={20} fill="#fff" opacity={0.3} />
  </g>
);

export const Pipo: React.FC<PipoProps> = ({
  x,
  y,
  scale = 1,
  leftWing = 0,
  rightWing = 0,
  beak = "closed",
  eyes,
  wink = false,
  look = 0,
  puff = 0,
  tilt = 0,
  capTilt = 0,
  squash = 0,
  legLift = [0, 0],
}) => {
  const frame = useCurrentFrame();
  const eyeState: EyeState = eyes ?? (blinking(frame, 43) ? "closed" : "open");
  const p = 1 + puff * 0.28;
  const fluff = [200, 230, 260, 290, 320, 150, 120];

  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale * (1 + squash)} ${scale * (1 - squash)})`}>
      <ellipse cx={0} cy={0} rx={85} ry={14} fill="#2f5a1e" opacity={0.25} />

      {/* legs + boots */}
      {[-1, 1].map((s, i) => (
        <g key={s} transform={`translate(0 ${-legLift[i]})`}>
          <rect x={s * 34 - 5} y={-50} width={10} height={30} rx={5} fill="#f08a00" />
          <path
            d={`M ${s * 34 - s * 22} -36 L ${s * 34 + s * 22} -36 L ${s * 34 + s * 22} -12 Q ${s * 34 + s * 44} -12 ${s * 34 + s * 44} 0 L ${s * 34 - s * 24} 0 Z`}
            fill="url(#pBoot)"
          />
          <rect x={s * 34 - 26} y={-40} width={48} height={10} rx={5} fill="#ff9a2a" />
          <ellipse cx={s * 34 - 8} cy={-24} rx={6} ry={9} fill="#fff" opacity={0.55} />
        </g>
      ))}

      <g transform={`translate(0 -125) scale(${p}) translate(0 125)`}>
        {/* fluffy outline */}
        {fluff.map((deg, i) => (
          <circle
            key={i}
            cx={Math.cos((deg * Math.PI) / 180) * 98}
            cy={-125 - Math.sin((deg * Math.PI) / 180) * 98}
            r={20 + puff * 8}
            fill="url(#pBody)"
          />
        ))}
        <circle cx={0} cy={-125} r={105} fill="url(#pBody)" />
        <ellipse cx={-42} cy={-178} rx={32} ry={18} fill="#fff" opacity={0.45} />

        {/* backwards cap: brim peeks out behind, strap opening at the front */}
        <g transform={`rotate(${capTilt} 0 -205)`}>
          <ellipse cx={4} cy={-240} rx={72} ry={14} fill="#2f8fd0" />
          <path d="M -82 -198 Q -78 -268 0 -270 Q 78 -268 82 -198 Z" fill="url(#pCap)" />
          <rect x={-82} y={-206} width={164} height={14} rx={7} fill="#3c9fe0" />
          <circle cx={0} cy={-268} r={8} fill="#3c9fe0" />
          <path d="M -24 -192 Q 0 -232 24 -192 Z" fill="#f9d72a" />
          {[-1, 0, 1].map((s) => (
            <path
              key={s}
              d={`M ${s * 8} -200 Q ${s * (22 + puff * 14)} ${-240 - puff * 8} ${s * (16 + puff * 18)} ${-262 - puff * 10 + Math.abs(s) * 12}`}
              stroke="#f5c400"
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </g>

        <Eye cx={-36} cy={-138} r={19} state={wink ? "closed" : eyeState} look={look} />
        <Eye cx={36} cy={-138} r={19} state={eyeState} look={look} />
        <circle cx={-66} cy={-104} r={15} fill="#ff9a3a" opacity={0.45} />
        <circle cx={66} cy={-104} r={15} fill="#ff9a3a" opacity={0.45} />

        {beak === "closed" ? (
          <path d="M -20 -116 L 20 -116 L 0 -90 Z" fill="url(#orange)" strokeLinejoin="round" />
        ) : (
          <g>
            <path d={`M -22 -122 L 22 -122 L 0 -104 Z`} fill="url(#orange)" />
            <path
              d={beak === "wide" ? "M -24 -101 Q 0 -98 24 -101 L 0 -66 Z" : "M -16 -100 L 16 -100 L 0 -84 Z"}
              fill="url(#orange)"
            />
            <path
              d={beak === "wide" ? "M -18 -104 L 18 -104 L 0 -92 Z" : "M -12 -103 L 12 -103 L 0 -98 Z"}
              fill="#7a2730"
            />
          </g>
        )}

        <Wing side={-1} angle={leftWing} />
        <Wing side={1} angle={rightWing} />
      </g>
    </g>
  );
};
