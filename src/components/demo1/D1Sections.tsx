import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { d1, d1ContactHref } from "@/content/demo1";

import { AsciiMobius } from "./ascii/AsciiMobius";
import { D1Button } from "./D1Button";
import { ArrowRight, Plus } from "./icons";

const pad = (n: number, size = 2) => String(n).padStart(size, "0");

/**
 * Về Aegis kiểu "Introduction" của Komma: nhãn cột trái, câu mở lớn bên phải, lời hứa bàn giao, ba nguyên tắc.
 * Khối đội ngũ chỉ hiện khi `d1.studio.team` có người (ảnh + tên thật).
 */
export function D1Studio() {
  const { studio } = d1;
  return (
    <section id="ve-aegis" data-d1-map={studio.label} aria-labelledby="ve-aegis-title" className="d1-section border-t border-line">
      <div className="d1-wrap">
        <div className="d1-grid gap-y-8">
          <p className="d1-side col-span-12 self-start lg:col-span-3">{studio.label}</p>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <h2 id="ve-aegis-title" className="d1-h2">
              {studio.title}
            </h2>
            <p className="d1-statement mt-8">{studio.statement}</p>
            <p className="mt-8 max-w-[36rem] text-muted">{studio.body}</p>
          </div>
        </div>

        <div className="d1-grid mt-16 gap-y-4 border-t border-line pt-6 lg:mt-24">
          <p className="d1-label col-span-12 text-muted lg:col-span-3">{studio.promiseLabel}</p>
          <p className="d1-h3 col-span-12 lg:col-span-8 lg:col-start-5">{studio.promise}</p>
        </div>

        <div className="mt-16 lg:mt-24">
          <h3 className="d1-label text-muted">{studio.valuesLabel}</h3>
          <ul className="mt-5 grid gap-x-(--d1-gutter) gap-y-8 md:grid-cols-3">
            {studio.values.map((value) => (
              <li key={value.title} className="border-t border-line pt-5">
                <p className="text-[1.5rem] leading-tight font-medium tracking-[-0.025em]">{value.title}</p>
                <p className="mt-3 max-w-[28rem] text-[0.9375rem] leading-relaxed text-muted">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>

        {studio.team.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h3 className="d1-label text-muted">{studio.teamLabel}</h3>
            <ul className="mt-5 grid grid-cols-2 gap-x-(--d1-gutter) gap-y-10 md:grid-cols-4">
              {studio.team.map((member) => (
                <li key={member.name}>
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={600}
                    height={750}
                    sizes="(min-width: 48rem) 22vw, 45vw"
                    className="aspect-[4/5] w-full rounded-[var(--d1-radius)] object-cover"
                  />
                  <p className="mt-3 font-medium">{member.name}</p>
                  <p className="text-[0.875rem] text-muted">{member.role}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/** Câu hỏi kiểu "Before you buy" của contentarchitecture.dev: số Q.001 mono, dấu cộng; chỉ trả lời bằng dữ kiện đã có */
export function D1Faq() {
  const { faq } = d1;
  return (
    <section id="cau-hoi" data-d1-map={faq.label} aria-labelledby="cau-hoi-title" className="d1-section bg-bg-elevated">
      <div className="d1-wrap d1-grid gap-y-10">
        <div className="col-span-12 lg:col-span-4">
          <h2 id="cau-hoi-title" className="d1-h2">
            {faq.title}
          </h2>
        </div>
        <div className="col-span-12 border-t border-line lg:col-span-7 lg:col-start-6">
          {faq.items.map((item, index) => (
            <details key={item.q} name="d1-faq" className="d1-faq-item">
              <summary>
                <span className="flex items-baseline gap-4">
                  <span className="d1-label shrink-0 text-muted">Q.{pad(index + 1, 3)}</span>
                  <span>{item.q}</span>
                </span>
                <span className="d1-plus">
                  <Plus />
                </span>
              </summary>
              <p className="max-w-[44rem] pb-6 text-muted sm:pl-[3.6rem]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Lời mời kiểu "Do you have a project in mind?" của Komma: câu hỏi lớn, nút, chọn hạng mục; bên cạnh là logo ký tự lật chậm */
export function D1ContactCta() {
  const { contact, cta, hero } = d1;
  const { email, phone } = siteConfig.contact;
  return (
    <section id="lien-he" data-d1-map={contact.label} aria-labelledby="lien-he-title" className="d1-section">
      <div className="d1-wrap d1-grid items-center gap-y-12">
        <div className="col-span-12 lg:col-span-7">
          <h2 id="lien-he-title" className="d1-display">
            {contact.title[0]} <span className="d1-faint block">{contact.title[1]}</span>
          </h2>
          <p className="d1-lead mt-7 max-w-[32rem] text-muted">{contact.lead}</p>
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
          <p className="d1-label mt-14 mb-3 text-muted">{contact.pickerLabel}</p>
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
        <div aria-hidden className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-4 lg:col-start-9">
          <AsciiMobius text={hero.markText} mode="spin" scale={0.74} />
        </div>
      </div>
    </section>
  );
}
