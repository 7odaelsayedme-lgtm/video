import { AbsoluteFill, Html5Audio, Sequence, staticFile } from "remotion";
import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6 } from "./farm/scenes";
import { Lyrics } from "./farm/Lyrics";
import { SCENE } from "./farm/timing";
import { fontFamily } from "./theme";

const scenes = [
  { name: "1 Hay pop (hook)", C: Scene1 },
  { name: "2 Moomo bell dance", C: Scene2 },
  { name: "3 Lulu twirl", C: Scene3 },
  { name: "4 Voice swap surprise", C: Scene4 },
  { name: "5 Group dance", C: Scene5 },
  { name: "6 Bye + loop", C: Scene6 },
];

// Episode 1 of "Farm Friends": 45s, 6 scenes of 225 frames (16 beats at 128 BPM).
// No audio fades: the last frame and the last beat lead straight back into the first.
export const FarmSong: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, background: "#bfe8ff" }}>
    <Html5Audio src={staticFile("audio/farm-song.mp3")} />
    {scenes.map(({ name, C }, i) => (
      <Sequence key={name} from={i * SCENE} durationInFrames={SCENE} name={name}>
        <C />
      </Sequence>
    ))}
    <Lyrics />
  </AbsoluteFill>
);
