import { SheetRise } from "@/components/fx/SheetRise";
import { SiteIntro } from "@/components/intro/SiteIntro";
import { ChapterHud } from "@/components/motion/ChapterHud";
import { PageTransition } from "@/components/motion/PageTransition";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { ServicesMarquee } from "@/components/sections/ServicesMarquee";
import { JsonLd } from "@/components/seo/JsonLd";
import { ParticleStage } from "@/components/webgl/ParticleStage";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";
import { homeJsonLd } from "@/lib/seo/jsonld";

/**
 * Trang chủ (/ và /en): Hero, Giới thiệu, bốn dịch vụ ngang hàng, Cách làm việc, Liên hệ.
 * Không có phần khoe dự án hay mẫu giao diện: sản phẩm đã làm chỉ hiện ở trang Web & web app, khi khách quan tâm tới mảng đó.
 */
export function HomePage({ lang }: { lang: Locale }) {
  const { process } = getSiteDict(lang);
  return (
    <>
      <JsonLd data={homeJsonLd(lang)} />
      <PageTransition />
      <SiteIntro />
      <ParticleStage />
      <Hero lang={lang} />
      <div data-surface="dark" className="ink relative z-10">
        <SheetRise radius="3rem">
          <About lang={lang} />
        </SheetRise>
      </div>
      <Services lang={lang} />
      <Process process={process} />
      <ServicesMarquee lang={lang} />
      <Contact lang={lang} />
      <ChapterHud />
    </>
  );
}
