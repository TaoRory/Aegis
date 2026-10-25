import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google";

/** VOYAGE: Cormorant Garamond (display mảnh, nghiêng đẹp) + Manrope (body) + IBM Plex Mono (mã chuyến bay, ngày). */
const display = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-voyage-display",
  display: "swap",
});
const body = Manrope({ subsets: ["latin", "vietnamese"], variable: "--font-voyage-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin", "vietnamese"], weight: ["400", "500"], variable: "--font-voyage-mono", display: "swap" });

export const voyageFonts = [display.variable, body.variable, mono.variable].join(" ");
