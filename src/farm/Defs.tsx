// Shared SVG gradients. Light comes from the top-left in every scene,
// which gives the flat shapes a soft "3D toy" look and keeps lighting consistent.
const radial = (id: string, inner: string, outer: string, cx = "35%", cy = "30%") => (
  <radialGradient id={id} cx={cx} cy={cy} r="75%">
    <stop offset="0%" stopColor={inner} />
    <stop offset="100%" stopColor={outer} />
  </radialGradient>
);

const linear = (id: string, top: string, bottom: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={top} />
    <stop offset="100%" stopColor={bottom} />
  </linearGradient>
);

export const Defs: React.FC = () => (
  <defs>
    {/* Moomo */}
    {radial("mFur", "#fffdf6", "#efdcbf")}
    {radial("mSpot", "#8a5631", "#5c331b")}
    {radial("mSnout", "#ffd3dc", "#f29bb0")}
    {radial("mRed", "#ff7070", "#d4283a")}
    {radial("gold", "#fff2a8", "#e0a400")}
    {radial("mHorn", "#fff6c4", "#f1cf6a")}
    {radial("hoof", "#8f6a55", "#4e3426")}
    {/* Pipo */}
    {radial("pBody", "#fff69a", "#f5c400")}
    {radial("pBoot", "#ffbe6b", "#ee7400")}
    {radial("pCap", "#c5edff", "#46aeee")}
    {radial("orange", "#ffb24d", "#f07c00")}
    {/* Lulu */}
    {radial("lSkin", "#ffe0e7", "#f497b0")}
    {radial("lSnout", "#ffb0c6", "#e8718f")}
    {radial("lOverall", "#c8a6ff", "#7442d6")}
    {radial("star", "#fff4a0", "#f5b800")}
    {radial("leaf", "#b6f29a", "#3fae3a")}
    {/* Farm */}
    {linear("sky", "#7cc8ff", "#e4f6ff")}
    {linear("hillFar", "#bff0a8", "#8fd77c")}
    {linear("grass", "#9be27a", "#56b84a")}
    {radial("hay", "#ffe9a3", "#e2a73f")}
    {linear("barnRed", "#f2554d", "#b92a2c")}
    {linear("roof", "#a8322e", "#7d1f22")}
    {radial("sunGlow", "#fff7c2", "rgba(255,240,170,0)", "50%", "50%")}
    {radial("eyeBrown", "#7a4a28", "#2b160a", "40%", "35%")}
    {radial("eyeBlue", "#7fd0ff", "#1f6fc4", "40%", "35%")}
  </defs>
);
