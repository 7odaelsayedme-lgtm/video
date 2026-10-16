import { useCurrentFrame } from "remotion";
import { blinking, Eye, EyeState, Mouth, MouthState } from "./Face";

// Lulu the piglet. Origin = between her feet; ~430px tall at scale 1.
// Fixed design: watermelon-pink, blue eyes, purple overalls with ONE yellow star button,
// green flower clip on HER RIGHT ear (viewer's left), tiny curly tail.
export type LuluProps = {
  x: number;
  y: number;
  scale?: number;
  headTilt?: number;
  leftArm?: number;
  rightArm?: number;
  mouth?: MouthState;
  mouthOpen?: number;
  eyes?: EyeState;
  look?: number;
  squash?: number;
  lean?: number;
  tail?: number;
  spin?: number; // radians, for the twirl
  snout?: number; // wiggle offset
  legLift?: [number, number];
};

const Arm: React.FC<{ side: -1 | 1; angle: number }> = ({ side, angle }) => (
  <g transform={`translate(${side * 100} -200) rotate(${side === -1 ? angle : -angle})`}>
    <ellipse cx={0} cy={45} rx={24} ry={50} fill="url(#lSkin)" />
    <ellipse cx={0} cy={90} rx={22} ry={14} fill="#e47a96" />
  </g>
);

export const Lulu: React.FC<LuluProps> = ({
  x,
  y,
  scale = 1,
  headTilt = 0,
  leftArm = 0,
  rightArm = 0,
  mouth = "smile",
  mouthOpen = 1,
  eyes,
  look = 0,
  squash = 0,
  lean = 0,
  tail = 0,
  spin = 0,
  snout = 0,
  legLift = [0, 0],
}) => {
  const frame = useCurrentFrame();
  const eyeState: EyeState = eyes ?? (blinking(frame, 71) ? "closed" : "open");
  const turn = Math.cos(spin);
  const facingAway = turn < 0;
  // keep a minimum width so she never becomes a sliver while twirling
  const sx = scale * (1 + squash) * Math.sign(turn || 1) * Math.max(0.25, Math.abs(turn));

  return (
    <g transform={`translate(${x} ${y}) rotate(${lean})`}>
      <ellipse cx={0} cy={0} rx={120} ry={20} fill="#2f5a1e" opacity={0.25} />
      <g transform={`scale(${sx} ${scale * (1 - squash)})`}>
        {/* curly tail (in front while she faces away) */}
        {!facingAway && <Tail angle={tail} />}

        {[-1, 1].map((s, i) => (
          <g key={s} transform={`translate(0 ${-legLift[i]})`}>
            <rect x={s * 48 - 26} y={-80} width={52} height={80} rx={24} fill="url(#lSkin)" />
            <rect x={s * 48 - 27} y={-22} width={54} height={24} rx={11} fill="#d9627f" />
          </g>
        ))}

        <ellipse cx={0} cy={-160} rx={118} ry={112} fill="url(#lSkin)" />
        {/* overalls */}
        <path d="M -116 -150 Q -112 -52 0 -48 Q 112 -52 116 -150 Z" fill="url(#lOverall)" />
        <rect x={-62} y={-232} width={124} height={96} rx={18} fill="url(#lOverall)" />
        <rect x={-74} y={-262} width={18} height={70} rx={9} fill="#8a5be6" transform="rotate(-12 -65 -230)" />
        <rect x={56} y={-262} width={18} height={70} rx={9} fill="#8a5be6" transform="rotate(12 65 -230)" />
        {!facingAway && (
          <path
            d="M0,-22 L6,-7 L22,-7 L9,3 L14,19 L0,9 L-14,19 L-9,3 L-22,-7 L-6,-7 Z"
            transform="translate(0 -190) scale(1.15)"
            fill="url(#star)"
          />
        )}
        {facingAway && <Tail angle={tail} />}
        <ellipse cx={-50} cy={-225} rx={30} ry={14} fill="#fff" opacity={0.3} />

        <g transform={`rotate(${headTilt} 0 -250)`}>
          {[-1, 1].map((s) => (
            <path
              key={s}
              d={`M ${s * 40} -385 L ${s * 98} -440 L ${s * 102} -360 Z`}
              fill="url(#lSkin)"
              stroke="#f497b0"
              strokeWidth={10}
              strokeLinejoin="round"
            />
          ))}
          <path d="M -88 -420 L -92 -375 L -55 -385 Z" fill="#f78aa5" />
          <path d="M 88 -420 L 92 -375 L 55 -385 Z" fill="#f78aa5" />
          <ellipse cx={0} cy={-325} rx={118} ry={102} fill="url(#lSkin)" />
          {!facingAway && (
            <>
              <ellipse cx={-50} cy={-385} rx={36} ry={18} fill="#fff" opacity={0.4} />
              <Eye cx={-44} cy={-345} r={26} state={eyeState} look={look} iris="eyeBlue" />
              <Eye cx={44} cy={-345} r={26} state={eyeState} look={look} iris="eyeBlue" />
              <circle cx={-86} cy={-295} r={18} fill="#ff7f9e" opacity={0.5} />
              <circle cx={86} cy={-295} r={18} fill="#ff7f9e" opacity={0.5} />
              <g transform={`translate(${snout} 0)`}>
                <ellipse cx={0} cy={-292} rx={48} ry={34} fill="url(#lSnout)" />
                <ellipse cx={-16} cy={-292} rx={8} ry={12} fill="#b9506d" />
                <ellipse cx={16} cy={-292} rx={8} ry={12} fill="#b9506d" />
              </g>
              <Mouth cx={0} cy={-252} w={44} state={mouth} open={mouthOpen} />
            </>
          )}
          {/* flower clip on her right ear = viewer's left (the mirror while twirling keeps it on her right) */}
          <g transform="translate(-86 -410)">
            {[0, 72, 144, 216, 288].map((d) => (
              <circle
                key={d}
                cx={Math.cos((d * Math.PI) / 180) * 14}
                cy={Math.sin((d * Math.PI) / 180) * 14}
                r={12}
                fill="url(#leaf)"
              />
            ))}
            <circle cx={0} cy={0} r={9} fill="#fff59a" />
          </g>
        </g>

        <Arm side={-1} angle={leftArm} />
        <Arm side={1} angle={rightArm} />
      </g>
    </g>
  );
};

const Tail: React.FC<{ angle: number }> = ({ angle }) => (
  <g transform={`rotate(${angle} 105 -120)`}>
    <path
      d="M 105 -120 C 140 -130 150 -95 128 -92 C 110 -90 112 -115 132 -118 C 150 -120 160 -100 152 -82"
      stroke="#f08fab"
      strokeWidth={9}
      fill="none"
      strokeLinecap="round"
    />
  </g>
);
