import { Archivo, Noto_Serif_Display } from "next/font/google";

/** HEARTH: Noto Serif Display (trục wdth: condensed ở cỡ lớn, nghiêng cho tên món) + Archivo cho nhãn/body. */
const display = Noto_Serif_Display({
  subsets: ["latin", "vietnamese"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-hearth-display",
  display: "swap",
});
const body = Archivo({ subsets: ["latin", "vietnamese"], variable: "--font-hearth-body", display: "swap" });

export const hearthFonts = [display.variable, body.variable].join(" ");
