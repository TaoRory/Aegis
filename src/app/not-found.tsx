import type { Metadata } from "next";

import { d2Sans } from "@/components/demo2/fonts";
import { D3NotFound } from "@/components/demo3/D3NotFound";
import { ThemeGuard } from "@/components/layout/ThemeGuard";

import "@/styles/demo2.css";
import "@/styles/motion-kit.css";
import "@/styles/demo3/base.css";
import "@/styles/demo3/shell.css";
import "@/styles/demo3/type.css";
import "@/styles/demo3/hero.css";
import "@/styles/demo3/home.css";
import "@/styles/demo3/services.css";
import "@/styles/demo3/plans.css";
import "@/styles/demo3/work.css";
import "@/styles/demo3/process.css";
import "@/styles/demo3/about.css";

/** 404 chung của website (địa chỉ không khớp route nào), cùng giao diện website chính. Factory có not-found riêng trong (spatial). */
export const metadata: Metadata = {
  title: "404 — Aegis",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className={`d2 d3 ${d2Sans.variable}`} data-no-cover>
      <ThemeGuard />
      <D3NotFound />
    </div>
  );
}
