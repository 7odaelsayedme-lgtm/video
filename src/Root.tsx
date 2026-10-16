import { Composition } from "remotion";
import { MotionIntro, motionIntroSchema } from "./MotionIntro";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MotionIntro"
      component={MotionIntro}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "موشن جرافيك",
        subtitle: "فيديو متحرك باستخدام Remotion و React",
        features: ["تصميم", "حركة", "إبداع"],
        brand: "اسم البراند",
        tagline: "شكراً للمشاهدة",
      } satisfies motionIntroSchema}
    />
  );
};
