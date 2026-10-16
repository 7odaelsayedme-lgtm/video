import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Moomo } from "./characters/Moomo";
import { Pipo } from "./characters/Pipo";
import { Lulu } from "./characters/Lulu";
import { HAY, HAY_TOP } from "./Farm";
import { Bubble, Cam, camAt, Note, Sparkle, World } from "./World";
import { BEAT, beat, beatPhase, bump, ease, lin, SCENE } from "./timing";

// Line-up used when all three friends are together.
const M = { x: 300, y: 1730 };
const P = { x: 540, y: 1770 };
const L = { x: 790, y: 1730 };

// Opening == closing shot: tight on the hay bale, Pipo hidden inside.
export const HAY_CAM: Cam = { x: 540, y: 1430, zoom: 2.2 };
const MEDIUM: Cam = { x: 540, y: 1490, zoom: 1.35 };
const WIDE: Cam = { x: 560, y: 1470, zoom: 1.2 };

const hidden = HAY.y + 240; // Pipo's feet when fully inside the bale (clipped)
const sinBeat = (f: number, beats = 1, offset = 0) => Math.sin(((f / BEAT) * Math.PI * 2) / beats + offset);
const talk = (f: number, from: number, to: number) =>
  f >= from && f < to && Math.floor((f - from) / (BEAT / 2)) % 2 === 0;
const walkLegs = (f: number, from: number, to: number): [number, number] => {
  if (f < from || f > to) return [0, 0];
  const step = Math.floor(f / (BEAT / 2)) % 2;
  const h = 16 * Math.sin(((f % (BEAT / 2)) / (BEAT / 2)) * Math.PI);
  return step === 0 ? [h, 0] : [0, h];
};
const arc = (p: number, a: number, b: number, height: number) => a + (b - a) * p - 4 * height * p * (1 - p);

// ---------------------------------------------------------------- Scene 1: the hay pop (hook)
export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = 14;
  const rise = spring({ frame: f - pop, fps, config: { damping: 11, stiffness: 130 } });
  let px = HAY.x;
  let py = f < pop ? hidden : hidden - (hidden - HAY_TOP) * rise;
  const hop = lin(f, [150, 180], [0, 1]);
  if (f >= 150) {
    px = interpolate(hop, [0, 1], [HAY.x, 640]);
    py = arc(hop, HAY_TOP, P.y, 70);
  }
  const land = bump(f, 180, 12) * 0.12 + bump(f, pop + 10, 10) * 0.08;
  const rightWing = f < 40 ? ease(f, [18, 34], [0, 75]) : f < 125 ? 85 + 30 * sinBeat(f - 40) : ease(f, [125, 140], [85, 10]);
  const leftWing = f < 40 ? ease(f, [18, 34], [0, 75]) : ease(f, [40, 52], [75, 15]);
  const beakOpen = (f >= pop && f < pop + 14) || talk(f, beat(6), beat(10));

  const cam = camAt(f, [0, pop, 110], [HAY_CAM, HAY_CAM, WIDE]);

  // a few soft hay bits that float up and drift down when Pipo pops out
  const bits = [-150, -95, -40, 30, 85, 140].map((vx, i) => {
    const t = f - pop;
    if (t < 0 || t > 60) return null;
    const x = HAY.x + vx * 0.9 + (vx * t) / 30;
    const y = HAY_TOP + 10 - 9 * t + 0.16 * t * t;
    return (
      <rect
        key={i}
        x={x}
        y={y}
        width={22}
        height={6}
        rx={3}
        fill="#f2c862"
        opacity={lin(t, [40, 60], [1, 0])}
        transform={`rotate(${vx + t * 4} ${x} ${y})`}
      />
    );
  });

  const pipo = (
    <Pipo
      x={px}
      y={py}
      leftWing={leftWing}
      rightWing={rightWing}
      beak={beakOpen ? "open" : "closed"}
      squash={land}
      tilt={f > 190 ? 6 * sinBeat(f, 2) : 0}
    />
  );

  return (
    <World t={f} cam={cam}>
      {f < 150 ? <g clipPath="url(#hayClip)">{pipo}</g> : pipo}
      {bits}
    </World>
  );
};

// ---------------------------------------------------------------- Scene 2: Moomo's bell dance
export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const t = SCENE + f;
  const mx = ease(f, [0, beat(4)], [-260, 300]);
  const walking = f < beat(4);
  const bob = walking ? -Math.abs(Math.sin((f / (BEAT / 2)) * Math.PI)) * 10 : 0;

  const mooing = [4, 5, 6].some((b) => f >= beat(b) && f < beat(b + 0.8));
  const swaySoft = f >= beat(8) && f < beat(12) ? 9 * sinBeat(f - beat(8), 2) : 0;
  const swayBig = f >= beat(12) && f < beat(15) ? 15 * sinBeat(f - beat(12), 2) : 0;
  const settle = f >= beat(15) ? 15 * sinBeat(beat(3), 2) * lin(f, [beat(15), beat(16)], [1, 0]) : 0;
  const headTilt = swaySoft + swayBig + settle + (mooing ? 4 * sinBeat(f, 1) : 0);
  // the bell lags a little behind the head and swings the other way
  const bell = -1.8 * (swaySoft + swayBig + settle) * 1.2;

  const cam = camAt(f, [0, SCENE], [WIDE, { x: 450, y: 1480, zoom: 1.5 }]);

  return (
    <World t={t} cam={cam}>
      <Pipo x={640} y={P.y} tilt={8 * sinBeat(f, 2)} leftWing={10 + 15 * bump(f % BEAT, 0, BEAT)} rightWing={10 + 15 * bump(f % BEAT, 0, BEAT)} look={-0.6} />
      <Moomo
        x={mx}
        y={M.y + bob}
        legLift={walkLegs(f, 0, beat(4))}
        headTilt={headTilt}
        bell={bell}
        mouth={mooing ? "o" : f >= beat(12) ? "open" : "smile"}
        mouthOpen={mooing ? 1 : 0.6}
        eyes={f >= beat(12) && f < beat(15) ? "happy" : undefined}
        leftArm={walking ? 10 * Math.sin((f / BEAT) * Math.PI) : 15}
        rightArm={walking ? -10 * Math.sin((f / BEAT) * Math.PI) : 15}
        tail={12 * sinBeat(f, 2)}
      />
    </World>
  );
};

// ---------------------------------------------------------------- Scene 3: Lulu's twirl
export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const t = SCENE * 2 + f;
  const ph = beatPhase(f);
  const clap = -58 + 33 * Math.sin(Math.PI * ph);

  const lx = ease(f, [0, beat(4)], [1320, L.x - 40]);
  const hopping = f < beat(4);
  const hopY = hopping ? -60 * Math.sin(Math.PI * ph) : 0;
  const oink = [4, 5, 6].some((b) => f >= beat(b) && f < beat(b + 0.7));
  const oinkHop = oink ? -18 * Math.sin(Math.PI * ph) : 0;
  const spin = ease(f, [beat(8), beat(12)], [0, Math.PI * 2]);
  const twirling = f >= beat(8) && f < beat(12);
  const hey = f >= beat(12) && f < beat(13.5);
  const wiggle = f >= beat(13) ? 26 * Math.sin((f / (BEAT / 2)) * Math.PI) : 0;
  const armUp = hey ? ease(f, [beat(12), beat(12.4)], [10, 150]) : twirling ? 70 : f >= beat(13.5) ? ease(f, [beat(13.5), beat(14)], [150, 15]) : 15;

  const cam = camAt(f, [0, SCENE], [{ x: 610, y: 1480, zoom: 1.35 }, { x: 560, y: 1480, zoom: 1.35 }]);

  return (
    <World t={t} cam={cam}>
      <Moomo x={330} y={M.y} scale={0.9} leftArm={clap} rightArm={clap} mouth="open" mouthOpen={0.5} look={1} />
      <Pipo x={525} y={P.y + 10} scale={0.95} leftWing={-35 + 30 * Math.sin(Math.PI * ph)} rightWing={-35 + 30 * Math.sin(Math.PI * ph)} look={1} beak="open" />
      <Lulu
        x={lx}
        y={L.y + hopY + oinkHop + (hey ? -30 * bump(f, beat(12), beat(1.5)) : 0)}
        squash={hopping && ph > 0.9 ? 0.06 : 0}
        spin={spin}
        leftArm={armUp}
        rightArm={armUp}
        mouth={oink || hey ? "open" : "smile"}
        snout={oink ? 6 * Math.sin((f / BEAT) * Math.PI * 4) : 0}
        tail={wiggle}
        lean={f >= beat(13) ? wiggle * 0.2 : 0}
        eyes={twirling ? "happy" : undefined}
        look={-0.4}
      />
    </World>
  );
};

// ---------------------------------------------------------------- Scene 4: the voice swap surprise
export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const t = SCENE * 3 + f;

  const cam = camAt(
    f,
    [0, 20, 36, 82, 98, 145, 165],
    [
      MEDIUM,
      MEDIUM,
      { x: 300, y: 1360, zoom: 1.9 },
      { x: 300, y: 1360, zoom: 1.9 },
      { x: 540, y: 1620, zoom: 2.2 },
      { x: 540, y: 1620, zoom: 2.2 },
      MEDIUM,
    ],
  );

  const laughing = f >= 165;
  const shake = laughing ? -Math.abs(Math.sin(f * 0.45)) * 10 : 0;
  const lookingAround = f >= 145 && f < 165;

  // Moomo: big breath → tiny "peep!" → freezes and covers her mouth
  const breath = -0.05 * bump(f, 12, 16);
  const moomoMouth = laughing ? "laugh" : f >= 26 && f < 36 ? "o" : "small";
  const cover = f < 165 ? ease(f, [38, 50], [15, -137]) : ease(f, [165, 175], [-137, 20]);

  // Pipo: puffs up → giant "MOOOO"
  const puff = ease(f, [88, 100], [0, 1]) * (1 - ease(f, [145, 160], [0, 1]));
  const pipoBeak = laughing ? (Math.floor(f / 6) % 2 ? "open" : "wide") : f >= 100 && f < 142 ? "wide" : "closed";

  const notes = laughing
    ? [0, 1, 2, 3, 4].map((i) => {
        const nt = f - 168 - i * 9;
        if (nt < 0) return null;
        return (
          <Note
            key={i}
            x={180 + i * 180 + Math.sin(nt / 10 + i) * 20}
            y={1250 - nt * 3.2}
            s={0.9}
            color={["#ff7aa2", "#7a5cff", "#ffb800", "#3fbf5a", "#3aa8ff"][i]}
            opacity={lin(nt, [0, 8, 40, 55], [0, 0.9, 0.9, 0])}
          />
        );
      })
    : null;

  return (
    <World
      t={t}
      cam={cam}
      overlay={
        <>
          <Bubble x={430} y={1290} text="بيب!" from={28} to={84} size={56} color="#f5a800" />
          <Bubble x={660} y={1430} text="موووو!" from={101} to={150} size={82} color="#7a4a28" />
        </>
      }
    >
      <Lulu
        x={L.x}
        y={L.y + shake}
        look={lookingAround ? -1 * Math.sign(Math.sin(f / 5)) : -1}
        eyes={laughing ? "happy" : (f > 32 && f < 80) || (f > 100 && f < 145) ? "wide" : undefined}
        mouth={laughing ? "laugh" : f > 32 && f < 145 ? "o" : "smile"}
        leftArm={laughing ? -45 : 15}
        rightArm={laughing ? -45 : 15}
      />
      <Moomo
        x={M.x}
        y={M.y + shake}
        squash={breath}
        mouth={moomoMouth}
        eyes={laughing ? "happy" : f >= 32 && f < 145 ? "wide" : undefined}
        look={lookingAround ? Math.sign(Math.sin(f / 5 + 1)) : f > 90 ? 1 : 0}
        rightArm={cover}
        leftArm={laughing ? -30 : 15}
        headTilt={f >= 32 && f < 80 ? -4 : laughing ? 4 * Math.sin(f * 0.45) : 0}
      />
      <Pipo
        x={P.x}
        y={P.y + shake * 0.6}
        puff={puff}
        beak={pipoBeak}
        eyes={laughing ? "happy" : f >= 100 && f < 145 ? "wide" : undefined}
        look={lookingAround ? Math.sin(f / 4) : 0}
        tilt={f >= 100 && f < 142 ? -6 : 0}
        capTilt={puff * 12}
        leftWing={laughing ? 40 + 30 * Math.sin(f * 0.6) : puff * 50}
        rightWing={laughing ? 40 + 30 * Math.sin(f * 0.6) : puff * 50}
      />
      {notes}
    </World>
  );
};

// ---------------------------------------------------------------- Scene 5: group dance
// 16 beats = the same 8-beat routine twice: clap ×2, jump ×2, lean in and wave ×4.
export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const t = SCENE * 4 + f;
  const i = Math.floor(f / BEAT);
  const ph = beatPhase(f);
  const k = i % 8;

  const clap = k < 2 ? -58 + 33 * Math.sin(Math.PI * ph) : null;
  const jumpY = k === 2 || k === 3 ? -90 * Math.sin(Math.PI * Math.min(ph / 0.85, 1)) : 0;
  const squash = (k === 2 || k === 3) && ph > 0.85 ? 0.08 : k === 4 && ph < 0.12 ? 0.06 : 0;
  const waving = k >= 4;
  const wave = 140 + 22 * Math.sin(ph * Math.PI * 4);
  const lean = waving ? 1 + 0.07 * Math.min(1, (k - 4 + ph) / 0.5) : 1;
  const arm = clap ?? (waving ? null : 45);

  const sing = (b: number) => i === b && ph < 0.8;
  const cam = { ...MEDIUM, y: MEDIUM.y + jumpY * 0.06 };

  return (
    <World t={t} cam={cam}>
      <Moomo
        x={M.x}
        y={M.y + jumpY}
        scale={lean}
        squash={squash}
        leftArm={arm ?? 25}
        rightArm={arm ?? wave}
        mouth={sing(0) || i === 3 ? "o" : waving ? "open" : "smile"}
        mouthOpen={0.7}
        bell={jumpY * -0.15}
        eyes={i >= 12 ? "happy" : undefined}
      />
      <Pipo
        x={P.x}
        y={P.y + jumpY}
        scale={lean}
        squash={squash}
        leftWing={clap !== null ? -40 + 30 * Math.sin(Math.PI * ph) : waving ? 20 : 60}
        rightWing={clap !== null ? -40 + 30 * Math.sin(Math.PI * ph) : waving ? 100 + 25 * Math.sin(ph * Math.PI * 4) : 60}
        beak={sing(1) || i === 3 || waving ? "open" : "closed"}
        eyes={i >= 12 ? "happy" : undefined}
      />
      <Lulu
        x={L.x}
        y={L.y + jumpY}
        scale={lean}
        squash={squash}
        leftArm={arm ?? wave}
        rightArm={arm ?? 25}
        mouth={sing(2) || i === 3 ? "open" : waving ? "open" : "smile"}
        mouthOpen={0.7}
        tail={20 * Math.sin(f / 3)}
        eyes={i >= 12 ? "happy" : undefined}
      />
    </World>
  );
};

// ---------------------------------------------------------------- Scene 6: bye-bye and back to the start
export const Scene6: React.FC = () => {
  const f = useCurrentFrame();
  const t = SCENE * 5 + f;
  const waving = f < beat(6);
  const wave = 140 + 22 * Math.sin((f / BEAT) * Math.PI * 4);

  // Pipo winks, hops back onto the bale and dives in
  const wink = f >= 86 && f < 104;
  let px = P.x;
  let py = P.y;
  const hopBack = lin(f, [106, 136], [0, 1]);
  if (f >= 106) py = arc(hopBack, P.y, HAY_TOP, 140);
  if (f >= 136) py = ease(f, [136, 150], [HAY_TOP, hidden]);
  const pipoScale = 1;
  px = HAY.x;
  const hayWiggle = f >= 148 ? 2.5 * Math.sin((f - 148) / 2.2) * lin(f, [148, 178], [1, 0]) : 0;

  const moomoX = ease(f, [112, 200], [M.x, -330]);
  const luluX = ease(f, [112, 200], [L.x, 1420]);
  const leaving = f >= 112 && f <= 200;

  const cam = camAt(f, [0, 130, 215], [MEDIUM, MEDIUM, HAY_CAM]);

  const pipo = (
    <Pipo
      x={px}
      y={py}
      scale={pipoScale}
      wink={wink}
      beak={talk(f, beat(4), beat(7)) ? "open" : "closed"}
      leftWing={f >= 106 && f < 136 ? 80 : 10}
      rightWing={waving ? 100 + 25 * Math.sin((f / BEAT) * Math.PI * 4) : f >= 106 && f < 136 ? 80 : 10}
      squash={bump(f, 100, 8) * 0.1}
    />
  );

  return (
    <World t={t} cam={cam} hayWiggle={hayWiggle}>
      <Moomo
        x={moomoX}
        y={M.y}
        flip={leaving}
        legLift={walkLegs(f, 112, 200)}
        rightArm={waving ? wave : 15}
        leftArm={15}
        mouth={talk(f, 0, beat(3)) ? "open" : "smile"}
        mouthOpen={0.6}
        eyes={f >= 104 && f < 130 ? "happy" : undefined}
      />
      <Lulu
        x={luluX}
        y={L.y - (leaving ? Math.abs(Math.sin((f / (BEAT / 2)) * Math.PI)) * 8 : 0)}
        legLift={walkLegs(f, 112, 200)}
        leftArm={waving ? wave : 15}
        rightArm={15}
        mouth={talk(f, 0, beat(3)) ? "open" : "smile"}
        mouthOpen={0.6}
        eyes={f >= 104 && f < 130 ? "happy" : undefined}
      />
      {f >= 136 ? <g clipPath="url(#hayClip)">{pipo}</g> : pipo}
      {wink && <Sparkle x={P.x - 78} y={P.y - 178} s={lin(f, [86, 94, 104], [0, 1, 0])} />}
    </World>
  );
};
