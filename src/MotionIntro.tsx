import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Background } from "./scenes/Background";
import { TitleScene } from "./scenes/TitleScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { OutroScene } from "./scenes/OutroScene";
import { fontFamily } from "./theme";

export type motionIntroSchema = {
  title: string;
  subtitle: string;
  features: string[];
  brand: string;
  tagline: string;
};

export const MotionIntro: React.FC<motionIntroSchema> = ({
  title,
  subtitle,
  features,
  brand,
  tagline,
}) => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily, direction: "rtl" }}>
      <Html5Audio
        src={staticFile("audio/music.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, durationInFrames - 45, durationInFrames],
            [0, 0.8, 0.8, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      <Background />
      <Sequence durationInFrames={100} name="Title">
        <TitleScene title={title} subtitle={subtitle} />
      </Sequence>
      <Sequence from={100} durationInFrames={100} name="Features">
        <FeaturesScene features={features} />
      </Sequence>
      <Sequence from={200} durationInFrames={100} name="Outro">
        <OutroScene brand={brand} tagline={tagline} />
      </Sequence>
    </AbsoluteFill>
  );
};
