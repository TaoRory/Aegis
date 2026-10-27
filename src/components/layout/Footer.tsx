import { FooterWordmark } from "@/components/layout/FooterWordmark";
import { RoundButton } from "@/components/ui/Button";
import { Rich } from "@/components/ui/Rich";
import { SmartLink } from "@/components/ui/SmartLink";
import { serviceHref } from "@/config/routes";
import type { Locale } from "@/config/space";
import { siteConfig } from "@/config/site";
import { getSiteDict } from "@/content/site";

export function Footer({ lang }: { lang: Locale }) {
  const { email, phone, address } = siteConfig.contact;
  const dict = getSiteDict(lang);
  const { footer, chrome, nav, cta, services } = dict;

  return (
    <footer data-surface="dark" data-chapter={footer.chapter} className="ink relative z-10 overflow-hidden">
      <div className="container-page pt-24 lg:pt-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label text-muted">{footer.label}</p>
            <p className="mt-6 max-w-[34rem] text-statement font-medium">
              <Rich text={footer.statement} />
            </p>
            <div className="mt-10">
              <RoundButton href={cta.href}>{cta.label}</RoundButton>
            </div>
          </div>

          <nav aria-label={chrome.navFooter} className="lg:col-span-2 lg:col-start-8">
            <h2 className="label text-muted">{footer.navTitle}</h2>
            <ul className="mt-5 space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <SmartLink href={item.href} className="link-underline">
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="label text-muted">{footer.servicesTitle}</h2>
            <ul className="mt-5 space-y-2.5">
              {services.map((service) => (
                <li key={service.id}>
                  <SmartLink href={serviceHref(lang, service.id)} className="link-underline">
                    {service.shortTitle}
                  </SmartLink>
                </li>
              ))}
            </ul>
            {(email || phone || address) && (
              <ul className="mt-8 space-y-2 text-muted">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="link-underline">
                      {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="link-underline">
                      {phone}
                    </a>
                  </li>
                )}
                {address && <li>{address}</li>}
              </ul>
            )}
          </div>
        </div>
      </div>

      <FooterWordmark />

      <div className="container-page flex flex-col-reverse gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label text-muted">{footer.copyright}</p>
        <a href="#noi-dung" className="label inline-flex items-center gap-2 self-start text-muted transition-colors hover:text-fg">
          {footer.top} <span aria-hidden>↑</span>
        </a>
      </div>
    </footer>
  );
}
