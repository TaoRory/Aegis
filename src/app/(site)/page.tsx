import { SheetRise } from "@/components/fx/SheetRise";
import { ChapterHud } from "@/components/motion/ChapterHud";
import { Preloader } from "@/components/motion/Preloader";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { ServicesMarquee } from "@/components/sections/ServicesMarquee";
import { TemplatesTeaser } from "@/components/sections/TemplatesTeaser";
import { ParticleStage } from "@/components/webgl/ParticleStage";

export default function HomePage() {
  return (
    <>
      <Preloader />
      <ParticleStage />
      <Hero />
      <div data-surface="dark" className="ink relative z-10">
        <SheetRise radius="3rem">
          <About />
        </SheetRise>
      </div>
      <Services />
      <Process />
      <ServicesMarquee />
      <Projects />
      <div data-surface="dark" className="ink relative z-10">
        <SheetRise radius="3rem">
          <TemplatesTeaser />
        </SheetRise>
      </div>
      <Contact />
      <ChapterHud />
    </>
  );
}
