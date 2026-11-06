import Link from "next/link";

import { siteConfig } from "@/config/site";
import { D1_BASE, d1 } from "@/content/demo1";

/** Footer /demo1 (nền mực): bốn cột chữ nhỏ, dòng bản quyền + tagline, rồi chữ "Aegis" khổng lồ tràn ngang khép trang */
export function D1Footer() {
  const { footer, nav, services, cta } = d1;
  const { email, phone } = siteConfig.contact;
  return (
    <footer id="d1-footer" data-d1-tone="dark" className="d1-footer overflow-hidden">
      <div className="d1-wrap pt-[clamp(4rem,3rem+4vw,7rem)]">
        <div className="grid grid-cols-2 gap-x-(--d1-gutter) gap-y-10 text-[0.9375rem] md:grid-cols-4">
          <div>
            <h2 className="d1-label text-subtle">{footer.contact}</h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href={cta.href}>{footer.contactLink}</Link>
              </li>
              {email && (
                <li>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
                </li>
              )}
            </ul>
          </div>
          <nav aria-label={footer.pages}>
            <h2 className="d1-label text-subtle">{footer.pages}</h2>
            <ul className="mt-4 space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="d1-label text-subtle">{footer.services}</h2>
            <ul className="mt-4 space-y-2">
              {services.items.map((service) => (
                <li key={service.id}>
                  <Link href={`${D1_BASE}#dich-vu-${service.id}`}>{service.shortTitle}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="d1-label text-subtle">{footer.more}</h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/mau-giao-dien">{footer.templates}</Link>
              </li>
              <li>
                <Link href="/">{footer.current}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-[clamp(3.5rem,2.5rem+4vw,6rem)] flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-5 text-muted">
          <p className="d1-label">{footer.copyright}</p>
          <p className="text-[0.875rem]">{footer.tagline}</p>
        </div>
        <p aria-hidden className="d1-wordmark mt-[clamp(1.5rem,1rem+2vw,3rem)]">
          {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
