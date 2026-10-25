import { Nunito, Patrick_Hand, Unbounded } from "next/font/google";

/** PLAYGROUND: Unbounded (display tròn rộng), Nunito (body), Patrick Hand (chữ viết tay). Cả ba có tiếng Việt. */
const display = Unbounded({ subsets: ["latin", "vietnamese"], variable: "--font-pg-display", display: "swap" });
const body = Nunito({ subsets: ["latin", "vietnamese"], variable: "--font-pg-body", display: "swap" });
const hand = Patrick_Hand({ subsets: ["latin", "vietnamese"], weight: "400", variable: "--font-pg-hand", display: "swap" });

export const playgroundFonts = [display.variable, body.variable, hand.variable].join(" ");
