"use client";

import { useSyncExternalStore } from "react";

import { SiteShell } from "@/components/layout/SiteShell";
import { PageTransition } from "@/components/motion/PageTransition";
import { ButtonLink } from "@/components/ui/Button";
import { Lines } from "@/components/ui/Rich";
import { contactHref, homeHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";

const noop = () => () => {};
const langFromLocation = (): Locale => {
  const p = location.pathname;
  return p === "/en" || p.startsWith("/en/") ? "en" : "vi";
};

/**
 * Trang 404 của trang chính, song ngữ. Trang này được dựng sẵn lúc build (/_not-found) nên server không biết đường dẫn thật;
 * ngôn ngữ chọn ở client theo location (/en/... → tiếng Anh), server trả bản tiếng Việt. Dùng chung vỏ SiteShell để vẫn có header,
 * footer và nút bỏ qua.
 */
export function NotFoundView() {
  const lang = useSyncExternalStore<Locale>(noop, langFromLocation, () => "vi");
  const { notFound } = getSiteDict(lang);
  return (
    <SiteShell lang={lang}>
      <PageTransition />
      <section data-surface="dark" aria-labelledby="not-found-title" className="ink relative pt-[calc(var(--header-h)+var(--section-y)*0.6)] pb-(--section-y)">
        <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0" />
        <div className="container-page relative">
          <p className="label text-muted">{notFound.label}</p>
          <h1 id="not-found-title" className="mt-6 max-w-[14ch] text-h2 font-semibold">
            <Lines lines={notFound.lines} />
          </h1>
          <p className="mt-8 max-w-[34rem] text-lead text-muted">{notFound.body}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href={homeHref(lang)} className="h-12 px-6">
              {notFound.home}
            </ButtonLink>
            <ButtonLink href={contactHref(lang)} variant="outline" className="h-12 px-6">
              {notFound.contact}
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
