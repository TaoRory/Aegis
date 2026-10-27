import { SplitReveal } from "@/components/motion/SplitReveal";
import { ButtonLink, RoundButton } from "@/components/ui/Button";
import { Rich } from "@/components/ui/Rich";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";

import { HeroFx } from "./HeroFx";

export function Hero({ lang }: { lang: Locale }) {
  const { hero, cta, services } = getSiteDict(lang);
  return (
    <section
      id="trang-chu"
      data-surface="dark"
      data-chapter={hero.chapter}
      aria-labelledby="hero-title"
      className="hero relative isolate flex min-h-svh flex-col overflow-hidden pt-(--header-h)"
    >
      {/* Lưới bản vẽ + dấu "+" (trang trí) */}
      <div aria-hidden className="blueprint-grid pointer-events-none absolute inset-0 -z-10" />
      <HeroFx />

      <div className="container-page relative flex flex-1 flex-col">
        <div className="hero-meta relative z-10 mt-6 grid grid-cols-2 gap-6 border-t border-line pt-4 text-muted lg:grid-cols-4">
          <p className="label">{hero.label}</p>
          <p className="label hidden lg:block">{hero.scale}</p>
          <ul className="label col-span-2 flex flex-wrap gap-x-4 gap-y-1 max-lg:hidden lg:col-span-2 lg:justify-end">
            {services.map((service) => (
              <li key={service.id}>
                <a href={`#dich-vu-${service.id}`} className="transition-colors hover:text-fg">
                  {service.shortTitle}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Điện thoại: nửa trên dành trọn cho artwork phân tử, chữ bắt đầu từ giữa màn hình */}
        <div className="flex flex-1 items-end pt-10 pb-10 max-lg:pt-[38svh] lg:pb-14">
          <div className="w-full">
            <SplitReveal
              as="h1"
              id="hero-title"
              trigger="intro"
              className="hero-title text-hero font-semibold"
            >
              {hero.lines.map((line, index) => (
                <span key={line} className="block">
                  {index === 1 && (
                    <span aria-hidden className="hero-indent">
                      ↳
                    </span>
                  )}
                  <Rich text={line} />
                </span>
              ))}
            </SplitReveal>

            <div className="hero-foot mt-10 grid gap-8 border-t border-line pt-6 lg:mt-14 lg:grid-cols-12 lg:items-end">
              <p className="text-lead text-muted lg:col-span-5">{hero.description}</p>
              <div className="flex flex-col gap-5 lg:col-span-7 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-6">
                {/* Điện thoại: nút chính to, dễ chạm bằng ngón cái; máy tính: nút tròn magnetic */}
                <ButtonLink href={cta.href} className="h-14 w-full justify-center text-base lg:hidden">
                  {cta.label}
                </ButtonLink>
                <ButtonLink href={hero.secondaryCta.href} variant="link" className="self-center lg:self-auto">
                  {hero.secondaryCta.label}
                </ButtonLink>
                <RoundButton href={cta.href} className="max-lg:hidden">
                  {cta.label}
                </RoundButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#gioi-thieu"
        className="label absolute right-[var(--gutter)] bottom-6 hidden items-center gap-3 text-muted transition-colors hover:text-fg lg:inline-flex"
      >
        {hero.scrollHint}
        <span aria-hidden className="scroll-cue inline-block">
          ↓
        </span>
      </a>
    </section>
  );
}
