import type { ReactNode } from "react";

import { AegisMark } from "@/components/brand/AegisLogo";
import { PageTransition } from "@/components/motion/PageTransition";
import { d3Contact, d3Href, type D3Dict } from "@/content/demo3";

import { D3Header } from "./D3Header";
import { D3Link } from "./D3Link";
import { FooterStage } from "./FooterStage";
import { FooterWordmark } from "./FooterWordmark";

/** Vỏ chung của mọi trang /demo3: liên kết bỏ qua, header, nội dung, footer; `lang` đặt trên vỏ để chữ theo đúng ngôn ngữ */
export function D3Shell({ t, children }: { t: D3Dict; children: ReactNode }) {
  return (
    <div lang={t.lang} className="contents">
      {/* Điểm kích hoạt chuyển trang (View Transitions): nằm trong từng trang nên được gỡ / gắn lại mỗi lần đổi route */}
      <PageTransition />
      <a href="#d2-main" className="d2-skip">
        {t.chrome.skip}
      </a>
      <D3Header t={t} />
      <main id="d2-main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <D3Footer t={t} />
    </div>
  );
}

/** Chân trang: tấm tối; chữ ký chuyển động (logo Möbius tự lắp ráp cạnh tagline, chữ AEGIS trồi lên) do FooterStage điều khiển */
function D3Footer({ t }: { t: D3Dict }) {
  return (
    <footer className="d2-footer">
      <FooterStage className="d2-footer-slab">
        <div className="d2-wrap">
          <div className="d2-footer-grid">
            <div className="d3-foot-brand">
              {/* `pieces`: bảy mảnh rời để lắp ráp; không JS thì các mảnh đứng sẵn đúng chỗ, trông như logo tĩnh */}
              <AegisMark pieces small className="d3-foot-mark" />
              <p className="d2-h3 max-w-[18rem]">{t.footer.tagline}</p>
            </div>
            <div>
              <h3>{t.footer.services}</h3>
              <ul>
                {t.services.items.map((service) => (
                  <li key={service.id}>
                    <D3Link href={d3Href(t.lang, `/services/${service.id}`)}>{service.name}</D3Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.footer.company}</h3>
              <ul>
                {t.nav.slice(1).map((item) => (
                  <li key={item.path}>
                    <D3Link href={d3Href(t.lang, item.path)}>{item.label}</D3Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{t.footer.other}</h3>
              <ul>
                <li>
                  <D3Link href={d3Contact(t.lang)}>{t.cta}</D3Link>
                </li>
                <li>
                  <D3Link href="/demo1">{t.footer.demo1}</D3Link>
                </li>
                <li>
                  <D3Link href="/">{t.footer.current}</D3Link>
                </li>
              </ul>
            </div>
          </div>
          <FooterWordmark className="d2-wordmark" title="Aegis" />
          <div className="d2-footer-base">
            <span>{t.footer.rights}</span>
            <span>BUILD / DEPLOY / SCALE</span>
          </div>
        </div>
      </FooterStage>
    </footer>
  );
}
