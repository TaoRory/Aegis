import Image from "next/image";
import { Fragment, type ReactNode } from "react";

import { Plus } from "@/components/demo1/icons";
import { d3Contact, d3Href, type D3Dict } from "@/content/demo3";

import { D3Link } from "./D3Link";
import { Rise } from "./fx/Rise";
import { SplitReveal } from "./fx/SplitReveal";
import { ArrowSwap } from "./HomeArrowSwap";

/**
 * Lưới thương hiệu đã làm cùng (trang chủ ngay sau màn đầu, trang Work cuối tường dự án).
 * Mỗi ô: logo giữ nguyên màu gốc của thương hiệu (public/brands, nền đã tách; Integritas dùng bản nền sáng: vàng giữ nguyên, chữ bạc đổi sang navy của họ), tên, việc Aegis đã làm,
 * dẫn tới trang dự án nếu có. Thương hiệu chưa có file logo thì hiện tên bằng chữ (không tự vẽ logo cho họ).
 * Ô cuối: "Thương hiệu của bạn" dẫn tới form. Các ô trồi lên so le theo cột.
 */
/** Tên viết liền (TEDxVinUniversity) được phép xuống dòng ở chỗ đổi chữ hoa, không bị cắt giữa chữ trong ô hẹp */
function breakable(name: string) {
  return name.split(/(?<=[a-z])(?=[A-Z])/).map((part, i) => (
    <Fragment key={part}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}

export function BrandWall({ t }: { t: D3Dict }) {
  const brands = t.x.work.brands;
  return (
    <section aria-labelledby="d3-brands-title" className="d2-wrap d2-section-tight">
      <div className="d2-split-head">
        <div>
          <p className="d2-small font-semibold text-muted">{brands.label}</p>
          <SplitReveal as="h2" id="d3-brands-title" className="d2-h2 d3-lines mt-3 max-w-[16em]">
            {brands.title}
          </SplitReveal>
        </div>
        <p className="d2-lead">{brands.lead}</p>
      </div>
      <ul className="d3-brands">
        {brands.items.map((item, index) => {
          const body: ReactNode = (
            <>
              <span className="d3-brand-mark" aria-hidden>
                {item.logo ? <Image className="d3-brand-logo" data-brand={item.id} src={item.logo.src} width={item.logo.width} height={item.logo.height} alt="" sizes="11rem" /> : <span className="d3-brand-word">{breakable(item.name)}</span>}
              </span>
              <span className="d3-brand-text">
                <span className="d3-brand-name">{item.name}</span>
                <span className="d3-brand-work">
                  {item.work}
                  {!item.slug && <span className="d3-brand-soon">{brands.soon}</span>}
                </span>
              </span>
              {item.slug && <ArrowSwap />}
            </>
          );
          return (
            <Rise as="li" key={item.id} index={index % 4} className="d3-brand" data-word={item.logo ? undefined : ""}>
              {item.slug ? (
                <D3Link href={d3Href(t.lang, `/work/${item.slug}`)} data-cursor="view">
                  {body}
                </D3Link>
              ) : (
                <div>{body}</div>
              )}
            </Rise>
          );
        })}
        <Rise as="li" index={3} className="d3-brand" data-next>
          <D3Link href={d3Contact(t.lang)} data-cursor="open">
            <span className="d3-brand-mark" aria-hidden>
              <span className="d3-brand-plus">
                <Plus />
              </span>
            </span>
            <span className="d3-brand-text">
              <span className="d3-brand-name">{brands.next}</span>
              <span className="d3-brand-work">{brands.nextLine}</span>
            </span>
            <ArrowSwap />
          </D3Link>
        </Rise>
      </ul>
    </section>
  );
}
