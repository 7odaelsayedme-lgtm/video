import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

const cardColors = [colors.accent, colors.accent2, colors.accent3];

export const FeaturesScene: React.FC<{ features: string[] }> = ({
  features,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const exit = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 60,
        opacity: exit,
      }}
    >
      {features.map((feature, i) => {
        const p = spring({ frame: frame - i * 10, fps, config: { damping: 14 } });
        const color = cardColors[i % cardColors.length];
        const float = Math.sin((frame + i * 20) / 15) * 8;
        return (
          <div
            key={feature}
            style={{
              width: 420,
              height: 420,
              borderRadius: 48,
              background: "rgba(255,255,255,0.08)",
              border: `4px solid ${color}`,
              boxShadow: `0 20px 60px ${color}55`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 30,
              transform: `translateY(${interpolate(p, [0, 1], [300, 0]) + float}px) rotate(${interpolate(p, [0, 1], [-15, 0])}deg)`,
              opacity: p,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: color,
                transform: `scale(${spring({ frame: frame - i * 10 - 10, fps })})`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 64,
                fontWeight: 900,
                color: colors.bgFrom,
              }}
            >
              {i + 1}
            </div>
            <span style={{ fontSize: 80, fontWeight: 700, color: colors.text }}>
              {feature}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
