import { Archivo, IBM_Plex_Mono } from "next/font/google";

/** BROADCAST: Archivo (trục wdth 62–125: tuyên ngôn trộn chữ hẹp/rộng) + IBM Plex Mono cho timecode, nhãn. */
const display = Archivo({ subsets: ["latin", "vietnamese"], axes: ["wdth"], variable: "--font-broadcast-display", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin", "vietnamese"], weight: ["400", "500"], variable: "--font-broadcast-mono", display: "swap" });

export const broadcastFonts = [display.variable, mono.variable].join(" ");
