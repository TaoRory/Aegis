import { Inter_Tight, Literata } from "next/font/google";

/** CAMPUS: Literata (serif sách, trục opsz) + Inter Tight cho nhãn và điều hướng. */
const display = Literata({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-campus-display",
  display: "swap",
});
const body = Inter_Tight({ subsets: ["latin", "vietnamese"], variable: "--font-campus-body", display: "swap" });

export const campusFonts = [display.variable, body.variable].join(" ");
