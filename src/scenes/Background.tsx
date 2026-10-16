import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

const shapes = [
  { size: 420, x: 12, y: 18, color: colors.accent, speed: 0.6 },
  { size: 300, x: 82, y: 72, color: colors.accent2, speed: -0.8 },
  { size: 200, x: 70, y: 15, color: colors.accent3, speed: 1.1 },
  { size: 260, x: 25, y: 80, color: colors.accent2, speed: -0.5 },
];

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = interpolate(frame, [0, 300], [120, 200]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${colors.bgFrom}, ${colors.bgTo})`,
        overflow: "hidden",
      }}
    >
      {shapes.map((s, i) => {
        const dx = Math.sin((frame / 40) * s.speed + i) * 60;
        const dy = Math.cos((frame / 50) * s.speed + i) * 40;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: s.color,
              opacity: 0.18,
              filter: "blur(60px)",
              transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
