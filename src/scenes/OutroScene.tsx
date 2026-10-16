import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

export const OutroScene: React.FC<{ brand: string; tagline: string }> = ({
  brand,
  tagline,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const ring = spring({ frame: frame - 10, fps, config: { damping: 10 } });
  const textIn = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const tagIn = spring({ frame: frame - 35, fps, config: { damping: 200 } });
  const rotation = interpolate(frame, [0, 100], [0, 180]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill
        style={{
          background: colors.accent,
          clipPath: `circle(${reveal * 75}% at 50% 50%)`,
          opacity: 0.15,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 950,
          height: 950,
          borderRadius: "50%",
          border: `8px dashed ${colors.accent3}`,
          transform: `scale(${ring}) rotate(${rotation}deg)`,
          opacity: 0.6,
        }}
      />
      <h2
        style={{
          fontSize: 140,
          fontWeight: 900,
          color: colors.text,
          margin: 0,
          opacity: textIn,
          transform: `scale(${interpolate(textIn, [0, 1], [0.7, 1])})`,
        }}
      >
        {brand}
      </h2>
      <p
        style={{
          fontSize: 54,
          color: colors.accent2,
          margin: "20px 0 0",
          opacity: tagIn,
          transform: `translateY(${interpolate(tagIn, [0, 1], [30, 0])}px)`,
        }}
      >
        {tagline}
      </p>
    </AbsoluteFill>
  );
};
