import { Geologica } from "next/font/google";

/** SIGNAL: Geologica (trục SHRP: góc sắc tăng khi hover tiêu đề). Mono dùng JetBrains Mono có sẵn của Aegis. */
export const signalDisplay = Geologica({
  subsets: ["latin", "vietnamese"],
  axes: ["SHRP"],
  variable: "--font-signal-display",
  display: "swap",
});

export const signalFonts = signalDisplay.variable;
