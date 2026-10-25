import { FooterWordmark } from "@/components/layout/FooterWordmark";
import { RoundButton } from "@/components/ui/Button";
import { SmartLink } from "@/components/ui/SmartLink";
import { siteConfig } from "@/config/site";
import { services } from "@/content/services";

export function Footer() {
  const { email, phone, address } = siteConfig.contact;

  return (
    <footer data-surface="dark" data-chapter="Kết" className="ink relative z-10 overflow-hidden">
      <div className="container-page pt-24 lg:pt-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label text-muted">BV-06 — Hoàn công</p>
            <p className="mt-6 max-w-[34rem] text-statement font-medium">
              Aegis xây dựng nền tảng công nghệ <em>vững chắc,</em> giúp doanh nghiệp tự tin tiến xa.
            </p>
            <div className="mt-10">
              <RoundButton href={siteConfig.cta.href}>{siteConfig.cta.label}</RoundButton>
            </div>
          </div>

          <nav aria-label="Điều hướng chân trang" className="lg:col-span-2 lg:col-start-8">
            <h2 className="label text-muted">Điều hướng</h2>
            <ul className="mt-5 space-y-2.5">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <SmartLink href={item.href} className="link-underline">
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="label text-muted">Dịch vụ</h2>
            <ul className="mt-5 space-y-2.5">
              {services.map((service, index) => (
                <li key={service.id}>
                  <SmartLink href={`/#dich-vu-${service.id}`} className="link-underline">
                    <span className="label mr-2 text-accent">0{index + 1}</span>
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
        <p className="label text-muted">© {siteConfig.name} — Giải pháp công nghệ &amp; marketing</p>
        <a href="#noi-dung" className="label inline-flex items-center gap-2 self-start text-muted transition-colors hover:text-fg">
          Lên đầu trang <span aria-hidden>↑</span>
        </a>
      </div>
    </footer>
  );
}
