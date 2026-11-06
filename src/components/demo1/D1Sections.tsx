import Link from "next/link";

import { MARK_IMAGE } from "@/components/brand/mark-data";
import { siteConfig } from "@/config/site";
import { d1, d1ContactHref } from "@/content/demo1";

import { AsciiMark } from "./AsciiMark";
import { D1Button } from "./D1Button";
import { D1Services } from "./D1Services";
import { D1Work } from "./D1Work";
import { ArrowDownRight, ArrowRight, Plus } from "./icons";

/** Màn đầu: câu nói rõ Aegis làm gì (hai sắc độ), lời dẫn, hai nút; bên phải là dấu Aegis dựng bằng ký tự; chân là bốn mảng dịch vụ */
export function D1Hero() {
  const { hero, cta, services } = d1;
  return (
    <section aria-labelledby="d1-hero-title" className="pt-[clamp(1.5rem,1rem+3vw,4rem)]">
      <div className="d1-wrap">
        <div className="d1-grid gap-y-10">
          <div className="col-span-12 flex flex-col lg:col-span-7">
            <h1 id="d1-hero-title" className="d1-display max-w-[15em]">
              {hero.title[0]} <span className="d1-faint">{hero.title[1]}</span>
            </h1>
            <p className="d1-lead mt-7 max-w-[32rem] text-muted lg:mt-9">{hero.lead}</p>
            <div className="mt-8 flex flex-wrap gap-2 lg:mt-10">
              <D1Button href={cta.href}>{cta.label}</D1Button>
              <D1Button href="#du-an" variant="soft" icon={false}>
                {hero.work}
              </D1Button>
            </div>
          </div>
          <figure className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-5 lg:col-start-8">
            <AsciiMark text={hero.markText} src={MARK_IMAGE.small} />
            <figcaption className="d1-label mt-3 text-muted">{hero.caption}</figcaption>
          </figure>
        </div>

        <nav aria-label={hero.servicesLabel} className="mt-12 lg:mt-14">
          <ol className="d1-hero-services grid grid-cols-2 gap-x-(--d1-gutter) lg:grid-cols-4">
            {services.items.map((service) => (
              <li key={service.id}>
                <a href={`#dich-vu-${service.id}`}>
                  <span className="text-[0.9375rem] leading-snug font-medium">{service.shortTitle}</span>
                  <ArrowDownRight className="text-muted" />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}

/** Giới thiệu: nhãn cột trái, câu mở lớn bên phải; lời hứa bàn giao; ba nguyên tắc thành một hàng */
export function D1About() {
  const { about } = d1;
  return (
    <section id="gioi-thieu" aria-labelledby="gioi-thieu-title" className="d1-section">
      <div className="d1-wrap">
        <div className="d1-grid gap-y-8">
          <h2 id="gioi-thieu-title" className="d1-side col-span-12 self-start lg:col-span-3">
            {about.label}
          </h2>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <p className="d1-statement">{about.statement}</p>
            <p className="mt-8 max-w-[36rem] text-muted">{about.body}</p>
          </div>
        </div>

        <div className="d1-grid mt-16 gap-y-4 border-t border-line pt-6 lg:mt-24">
          <p className="d1-label col-span-12 text-muted lg:col-span-3">{about.promiseLabel}</p>
          <p className="d1-h3 col-span-12 lg:col-span-8 lg:col-start-5">{about.promise}</p>
        </div>

        <div className="mt-16 lg:mt-24">
          <h3 className="d1-label text-muted">{about.valuesLabel}</h3>
          <ul className="mt-5 grid gap-x-(--d1-gutter) gap-y-8 md:grid-cols-3">
            {about.values.map((value) => (
              <li key={value.title} className="border-t border-line pt-5">
                <p className="text-[1.5rem] leading-tight font-medium tracking-[-0.025em]">{value.title}</p>
                <p className="mt-3 max-w-[28rem] text-[0.9375rem] leading-relaxed text-muted">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Dịch vụ: nhãn + lời dẫn, rồi danh sách chữ lớn (D1Services) */
export function D1ServicesSection() {
  const { services } = d1;
  return (
    <section id="dich-vu" aria-labelledby="dich-vu-title" className="d1-section bg-bg-elevated">
      <div className="d1-wrap">
        <div className="d1-grid gap-y-6">
          <h2 id="dich-vu-title" className="d1-side col-span-12 self-start lg:col-span-3">
            {services.label}
          </h2>
          <p className="d1-lead col-span-12 max-w-[34rem] text-muted lg:col-span-6 lg:col-start-5">{services.lead}</p>
        </div>
      </div>
      <D1Services />
    </section>
  );
}

export { D1Work };

/** Cách làm việc (nền mực): tiêu đề bên trái, bốn bước bên phải, không ghim, không chờ cuộn */
export function D1Process() {
  const { process } = d1;
  return (
    <section id="cach-lam-viec" data-d1-tone="dark" aria-labelledby="cach-lam-viec-title" className="d1-section">
      <div className="d1-wrap d1-grid gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <h2 id="cach-lam-viec-title" className="d1-h2">
            {process.title}
          </h2>
          <p className="mt-6 max-w-[28rem] text-muted">{process.lead}</p>
        </div>
        <ol className="d1-steps col-span-12 border-t border-line lg:col-span-6 lg:col-start-7">
          {process.steps.map((step, index) => (
            <li key={step.title}>
              <span className="d1-label pt-2 text-muted">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-[1.5rem] leading-tight font-medium tracking-[-0.025em]">{step.title}</h3>
                <p className="mt-2 max-w-[30rem] text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Câu hỏi thường gặp: chỉ trả lời bằng dữ kiện đã có trên website */
export function D1Faq() {
  const { faq } = d1;
  return (
    <section id="cau-hoi" aria-labelledby="cau-hoi-title" className="d1-section">
      <div className="d1-wrap d1-grid gap-y-10">
        <div className="col-span-12 lg:col-span-4">
          <h2 id="cau-hoi-title" className="d1-h2">
            {faq.title}
          </h2>
        </div>
        <div className="col-span-12 border-t border-line lg:col-span-7 lg:col-start-6">
          {faq.items.map((item) => (
            <details key={item.q} name="d1-faq" className="d1-faq-item">
              <summary>
                {item.q}
                <span className="d1-plus">
                  <Plus />
                </span>
              </summary>
              <p className="max-w-[44rem] pb-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Kết trang: câu mời + chọn hạng mục là bắt đầu phiếu luôn (một cú bấm) */
export function D1ContactCta() {
  const { contact, cta } = d1;
  const { email, phone } = siteConfig.contact;
  return (
    <section id="lien-he" aria-labelledby="lien-he-title" className="d1-section border-t border-line">
      <div className="d1-wrap d1-grid gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <h2 id="lien-he-title" className="d1-h2">
            {contact.title[0]} <span className="d1-faint">{contact.title[1]}</span>
          </h2>
          <p className="mt-6 max-w-[28rem] text-muted">{contact.lead}</p>
          <div className="mt-8">
            <D1Button href={cta.href}>{cta.label}</D1Button>
          </div>
          {(email || phone) && (
            <dl className="mt-10 grid gap-4">
              {email && (
                <div>
                  <dt className="d1-label text-muted">{contact.channels.email}</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${email}`} className="d1-link">
                      {email}
                    </a>
                  </dd>
                </div>
              )}
              {phone && (
                <div>
                  <dt className="d1-label text-muted">{contact.channels.phone}</dt>
                  <dd className="mt-1">
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="d1-link">
                      {phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <p className="d1-label mb-4 text-muted">{contact.pickerLabel}</p>
          <ul className="d1-pick">
            {contact.options.map((option) => (
              <li key={option.value}>
                <Link href={d1ContactHref(option.value)}>
                  {option.label}
                  <ArrowRight />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
