import { Fraunces, Lexend } from "next/font/google";

/** SERENE: Fraunces (trục SOFT + opsz: nét mềm, tròn) + Lexend cho body dễ đọc. */
const display = Fraunces({
  subsets: ["latin", "vietnamese"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-serene-display",
  display: "swap",
});
const body = Lexend({ subsets: ["latin", "vietnamese"], variable: "--font-serene-body", display: "swap" });

export const sereneFonts = [display.variable, body.variable].join(" ");
