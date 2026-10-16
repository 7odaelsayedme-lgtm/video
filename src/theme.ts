import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Cairo (SIL Open Font License) is bundled in public/fonts so rendering works offline.
export const fontFamily = "Cairo";

loadFont({
  family: fontFamily,
  url: staticFile("fonts/Cairo-arabic.woff2"),
  weight: "200 1000",
  unicodeRange:
    "U+0600-06FF, U+0750-077F, U+0870-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FEFC",
});

loadFont({
  family: fontFamily,
  url: staticFile("fonts/Cairo-latin.woff2"),
  weight: "200 1000",
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212, U+FEFF, U+FFFD",
});

export const colors = {
  bgFrom: "#0f0c29",
  bgTo: "#302b63",
  accent: "#ff6b6b",
  accent2: "#4ecdc4",
  accent3: "#ffd93d",
  text: "#ffffff",
};
