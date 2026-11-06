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
        {/* Bốn mảng dịch vụ, bấm để nhảy tới chương tương ứng (cả điện thoại lẫn máy tính) */}
        {/* Điện thoại: hàng chữ nằm trên vùng hạt nên có dải nền giấy mờ phía sau để đọc được */}
        <nav aria-label={hero.servicesAria} className="hero-meta relative z-10 mt-6 border-t border-line pt-4 max-lg:bg-bg/85 max-lg:pb-3">
          <ul className="label flex flex-wrap gap-x-5 gap-y-1 text-fg lg:gap-x-8">
            {services.map((service) => (
              <li key={service.id}>
                <a href={`#dich-vu-${service.id}`} className="inline-flex min-h-6 items-center transition-colors hover:text-accent">
                  {service.shortTitle}
                </a>
              </li>
            ))}
          </ul>
        </nav>

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
              <p className="text-lead lg:col-span-6">{hero.description}</p>
              <div className="flex flex-col gap-5 lg:col-span-6 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-6">
                {/* Điện thoại: nút chính to, dễ chạm bằng ngón cái; máy tính: nút tròn magnetic */}
                <ButtonLink href={cta.href} className="h-14 w-full justify-center text-base lg:hidden">
                  {cta.label}
                </ButtonLink>
                <ButtonLink href={hero.secondaryCta.href} variant="link" className="min-h-11 self-center lg:self-auto">
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
    </section>
  );
}
