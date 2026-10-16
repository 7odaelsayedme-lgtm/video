import { useCurrentFrame } from "remotion";
import { blinking, Eye, EyeState, Mouth, MouthState } from "./Face";

// Moomo the baby cow. Origin = between her feet; ~520px tall at scale 1.
// Fixed design: cream fur, brown heart on the belly, brown patch around HER LEFT eye
// (viewer's right), butter-yellow horns, red polka-dot bandana with one golden bell.
export type MoomoProps = {
  x: number;
  y: number;
  scale?: number;
  headTilt?: number;
  bell?: number;
  leftArm?: number; // viewer-left arm, degrees raised outward (negative = inward, for clapping)
  rightArm?: number;
  mouth?: MouthState;
  mouthOpen?: number;
  eyes?: EyeState;
  look?: number;
  squash?: number;
  lean?: number;
  tail?: number;
  legLift?: [number, number];
  flip?: boolean;
};

const Arm: React.FC<{ side: -1 | 1; angle: number }> = ({ side, angle }) => (
  <g transform={`translate(${side * 118} -245) rotate(${side === -1 ? angle : -angle})`}>
    <ellipse cx={0} cy={55} rx={28} ry={60} fill="url(#mFur)" />
    <ellipse cx={0} cy={108} rx={27} ry={17} fill="url(#hoof)" />
  </g>
);

export const Moomo: React.FC<MoomoProps> = ({
  x,
  y,
  scale = 1,
  headTilt = 0,
  bell = 0,
  leftArm = 0,
  rightArm = 0,
  mouth = "smile",
  mouthOpen = 1,
  eyes,
  look = 0,
  squash = 0,
  lean = 0,
  tail = 0,
  legLift = [0, 0],
  flip = false,
}) => {
  const frame = useCurrentFrame();
  const eyeState: EyeState = eyes ?? (blinking(frame, 11) ? "closed" : "open");
  const sx = scale * (1 + squash) * (flip ? -1 : 1);
  const sy = scale * (1 - squash);

  return (
    <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${sx} ${sy})`}>
      <ellipse cx={0} cy={0} rx={150} ry={22} fill="#2f5a1e" opacity={0.25} />

      {/* tail */}
      <g transform={`rotate(${tail} 115 -150)`}>
        <path d="M 115 -150 Q 175 -140 172 -70" stroke="#efdcbf" strokeWidth={12} fill="none" strokeLinecap="round" />
        <ellipse cx={172} cy={-62} rx={16} ry={22} fill="url(#mSpot)" />
      </g>

      {/* legs */}
      {[-1, 1].map((s, i) => (
        <g key={s} transform={`translate(0 ${-legLift[i]})`}>
          <rect x={s * 55 - 32} y={-100} width={64} height={100} rx={30} fill="url(#mFur)" />
          <rect x={s * 55 - 33} y={-28} width={66} height={30} rx={14} fill="url(#hoof)" />
        </g>
      ))}

      {/* body */}
      <ellipse cx={0} cy={-185} rx={135} ry={128} fill="url(#mFur)" />
      <ellipse cx={-55} cy={-250} rx={45} ry={26} fill="#fff" opacity={0.4} />
      <path
        d="M0,25 C -60,-15 -35,-60 0,-30 C 35,-60 60,-15 0,25 Z"
        transform="translate(0 -150) scale(1.15)"
        fill="url(#mSpot)"
      />

      {/* bandana + bell */}
      <path d="M -108 -308 Q 0 -272 108 -308 L 102 -284 Q 0 -246 -102 -284 Z" fill="url(#mRed)" />
      <path d="M -62 -282 L 62 -282 L 0 -222 Z" fill="url(#mRed)" />
      {[
        [-80, -292],
        [-40, -278],
        [40, -278],
        [80, -292],
        [-25, -262],
        [25, -262],
        [0, -244],
      ].map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={6} fill="#fff" />
      ))}
      <g transform={`rotate(${bell} 0 -262)`}>
        <rect x={-6} y={-266} width={12} height={10} rx={3} fill="#c58b00" />
        <circle cx={0} cy={-238} r={21} fill="url(#gold)" />
        <rect x={-14} y={-232} width={28} height={4} rx={2} fill="#b07a00" />
        <circle cx={0} cy={-222} r={5} fill="#8a5d00" />
        <circle cx={-7} cy={-246} r={5} fill="#fff" opacity={0.7} />
      </g>

      {/* head */}
      <g transform={`rotate(${headTilt} 0 -300)`}>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 128} -418) rotate(${s * 28})`}>
            <ellipse cx={s * 20} cy={0} rx={58} ry={27} fill="url(#mFur)" />
            <ellipse cx={s * 24} cy={2} rx={38} ry={15} fill="#f8b4c4" />
          </g>
        ))}
        {[-1, 1].map((s) => (
          <ellipse
            key={s}
            cx={s * 60}
            cy={-492}
            rx={17}
            ry={27}
            transform={`rotate(${s * 18} ${s * 60} -492)`}
            fill="url(#mHorn)"
          />
        ))}
        <ellipse cx={0} cy={-395} rx={128} ry={112} fill="url(#mFur)" />
        <ellipse cx={-55} cy={-465} rx={40} ry={20} fill="#fff" opacity={0.45} />
        <ellipse cx={54} cy={-412} rx={48} ry={44} fill="url(#mSpot)" />
        <Eye cx={-52} cy={-410} r={27} state={eyeState} look={look} iris="eyeBrown" />
        <Eye cx={52} cy={-410} r={27} state={eyeState} look={look} iris="eyeBrown" />
        <circle cx={-98} cy={-352} r={20} fill="#ff8fa6" opacity={0.5} />
        <circle cx={98} cy={-352} r={20} fill="#ff8fa6" opacity={0.5} />
        <ellipse cx={0} cy={-332} rx={88} ry={54} fill="url(#mSnout)" />
        <ellipse cx={-30} cy={-346} rx={10} ry={14} fill="#c9677f" />
        <ellipse cx={30} cy={-346} rx={10} ry={14} fill="#c9677f" />
        <Mouth cx={0} cy={-312} w={50} state={mouth} open={mouthOpen} />
      </g>

      <Arm side={-1} angle={leftArm} />
      <Arm side={1} angle={rightArm} />
    </g>
  );
};
