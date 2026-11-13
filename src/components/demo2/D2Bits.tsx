import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRight } from "@/components/demo1/icons";
import { d2Contact, d2Href, type D2Dict, type D2LayerId } from "@/content/demo2";
import previewsJson from "@/content/project-previews.json";
import type { Project, ProjectPreviews } from "@/content/types";

import { Check } from "./D2Icons";

export const d2Previews = previewsJson as ProjectPreviews;
export const d2Host = (url: string) => new URL(url).host.replace(/^www\./, "");

/** Ảnh chụp dự án thật trong khung trình duyệt mảnh */
export function Shot({ project, alt, sizes, priority }: { project: Project; alt: string; sizes: string; priority?: boolean }) {
  const cover = d2Previews[project.slug]?.cover;
  if (!cover) return null;
  return (
    <div className="d2-shot">
      <div className="d2-shot-bar" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <Image src={cover.src} alt={alt} width={cover.width} height={cover.height} sizes={sizes} priority={priority} />
    </div>
  );
}

/** Đầu trang con: tiêu đề lớn căn trái + câu dẫn (không nhãn nhỏ phía trên) */
export function PageHead({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="d2-wrap d2-pagehead">
      <h1 className="d2-display max-w-[16em]">{title}</h1>
      {lead && <p className="d2-lead mt-6">{lead}</p>}
      {children}
    </header>
  );
}

/** Lời mời cuối trang: hai ô lớn (xem dự án / nhận báo giá) */
export function FinalCta({ t }: { t: D2Dict }) {
  return (
    <section aria-labelledby="d2-final-title" className="d2-wrap d2-section-tight pb-(--d2-section)">
      <h2 id="d2-final-title" className="d2-display">
        {t.final.title}
      </h2>
      <div className="d2-final">
        <Link href={d2Href(t.lang, "/work")} data-rise="pop">
          <span className="d2-final-title">
            {t.final.work}
            <ArrowRight />
          </span>
          <p className="text-muted">{t.final.workLine}</p>
        </Link>
        <Link href={d2Contact(t.lang)} data-rise="pop">
          <span className="d2-final-title">
            {t.final.call}
            <ArrowRight />
          </span>
          <p>{t.final.callLine}</p>
        </Link>
      </div>
    </section>
  );
}

/** Danh sách có dấu tick */
export function Checks({ items }: { items: string[] }) {
  return (
    <ul className="d2-checks">
      {items.map((item) => (
        <li key={item}>
          <Check />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Mô hình minh hoạ cho từng lớp của "tài sản số" (HTML/CSS thuần, không số liệu):
 * site = khung trang web · search = ô tìm kiếm + kết quả, dòng của bạn được tô · social = lịch nội dung · ai = luồng yêu cầu → agent → xong.
 */
export function LayerMock({ t, layer, landing = false }: { t: D2Dict; layer: D2LayerId; landing?: boolean }) {
  const { mock, home } = t;
  if (layer === "site") {
    return (
      <div className="d2-lm d2-lm-site">
        <div className="d2-shot-bar">
          <i />
          <i />
          <i />
        </div>
        <div className="d2-lm-body">
          <span className="d2-bar w-[38%]" data-tone="ink" />
          <span className="d2-bar mt-3 h-4! w-[82%]" data-tone="ink" />
          <span className="d2-bar mt-1.5 h-4! w-[58%]" data-tone="ink" />
          <span className="d2-bar mt-3 w-[72%]" />
          <span className="d2-bar mt-1.5 w-[64%]" />
          <span className="d2-pill mt-3.5" data-soft="true">
            {landing ? home.landing : mock.site.cta}
          </span>
        </div>
      </div>
    );
  }
  if (layer === "search") {
    return (
      <div className="d2-lm">
        <div className="d2-lm-query">{mock.search.query}</div>
        {mock.search.results.map((result, i) => (
          <div key={result} className="d2-lm-result" data-you={i === 1}>
            <span>{result}</span>
            {i === 1 && (
              <span className="d2-pill" data-on="true">
                {mock.search.yours}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (layer === "social") {
    const tiles = ["teal", "", "aqua", "ink", "aqua", "", "", "teal", "ink"];
    return (
      <div className="d2-lm">
        <div className="d2-lm-tabs">
          {mock.social.tabs.map((tab, i) => (
            <span key={tab} className="d2-pill" data-on={i === 2}>
              {tab}
            </span>
          ))}
        </div>
        <div className="d2-lm-grid">
          {tiles.map((tone, i) => (
            <i key={i} data-tone={tone || undefined} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="d2-lm d2-lm-flow">
      {mock.ai.nodes.map((node, i) => (
        <span key={node} className="d2-pill" data-on={i === 1} data-soft={i === 2}>
          {node}
        </span>
      ))}
    </div>
  );
}

/** Mô hình giao diện minh hoạ cho từng bước quy trình (có nhãn "Minh hoạ"; không chứa số liệu) */
export function StepMock({ t, kind }: { t: D2Dict; kind: D2Dict["process"]["steps"][number]["mock"] }) {
  const { mock, chrome, own } = t;
  const head = (title: string) => (
    <div className="d2-mock-head">
      <span>{title}</span>
      <span>{chrome.illustration}</span>
    </div>
  );
  if (kind === "brief") {
    return (
      <div className="d2-mock">
        {head(mock.brief.title)}
        {mock.brief.fields.map(([label, value]) => (
          <div key={label} className="d2-mock-field">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="d2-mock-chips">
          {mock.brief.chips.map((chip, i) => (
            <span key={chip} className="d2-pill" data-on={i === 0}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "scope" || kind === "build") {
    return (
      <div className="d2-mock">
        {head(mock[kind].title)}
        {mock[kind].rows.map(([label, state], i) => (
          <div key={label} className="d2-mock-row">
            <span>{label}</span>
            <span className="d2-pill" data-on={kind === "scope" || i === 0} data-soft={kind === "build" && i === 1}>
              {state}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "handover") {
    return (
      <div className="d2-mock">
        {head(mock.handover.title)}
        {own.items.map((item) => (
          <div key={item.name} className="d2-mock-row">
            <span>{item.name}</span>
            <span className="d2-tick size-5!">
              <Check />
            </span>
          </div>
        ))}
      </div>
    );
  }
  const pattern = ["soft", "", "true", "", "soft", "", "true", "true", "", "true", "true", "", "soft", "true", ""];
  return (
    <div className="d2-mock">
      {head(mock.grow.title)}
      <div className="d2-cal">
        <span />
        {mock.grow.days.map((day) => (
          <b key={day}>{day}</b>
        ))}
        {mock.grow.rows.map((row, r) => [
          <span key={row}>{row}</span>,
          ...pattern.slice(r * 5, r * 5 + 5).map((on, i) => <i key={`${row}-${i}`} data-on={on || undefined} />),
        ])}
      </div>
    </div>
  );
}
