import { Epilogue, Playfair } from "next/font/google";

/** ATELIER: Playfair (trục opsz + wdth: masthead co giãn khi tải trang) + Epilogue cho nhãn/body. */
const display = Playfair({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz", "wdth"],
  style: ["normal", "italic"],
  variable: "--font-atelier-display",
  display: "swap",
});
const body = Epilogue({ subsets: ["latin", "vietnamese"], variable: "--font-atelier-body", display: "swap" });

export const atelierFonts = [display.variable, body.variable].join(" ");
