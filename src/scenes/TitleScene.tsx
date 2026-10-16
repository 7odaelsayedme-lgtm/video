import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

export const TitleScene: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleIn = spring({ frame, fps, config: { damping: 12 } });
  const lineIn = spring({ frame: frame - 15, fps, config: { damping: 200 } });
  const subIn = spring({ frame: frame - 25, fps, config: { damping: 200 } });
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
        opacity: exit,
        transform: `scale(${interpolate(exit, [0, 1], [1.1, 1])})`,
      }}
    >
      <h1
        style={{
          fontSize: 130,
          textAlign: "center",
          lineHeight: 1.3,
          fontWeight: 900,
          color: colors.text,
          margin: 0,
          transform: `scale(${titleIn}) translateY(${interpolate(titleIn, [0, 1], [80, 0])}px)`,
          textShadow: `0 10px 40px ${colors.accent}88`,
        }}
      >
        {title}
      </h1>
      <div
        style={{
          height: 10,
          width: 600 * lineIn,
          borderRadius: 5,
          background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent3}, ${colors.accent2})`,
          margin: "20px 0 40px",
        }}
      />
      <p
        style={{
          fontSize: 52,
          textAlign: "center",
          maxWidth: 900,
          fontWeight: 400,
          color: colors.text,
          margin: 0,
          opacity: subIn,
          transform: `translateY(${interpolate(subIn, [0, 1], [40, 0])}px)`,
        }}
      >
        {subtitle}
      </p>
    </AbsoluteFill>
  );
};
