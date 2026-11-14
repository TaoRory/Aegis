import { d3Contact, d3Href, type D3Dict } from "@/content/demo3";

import { D3Asset } from "./D3Asset";
import { D3Btn } from "./D3Btn";
import { Magnetic } from "./fx/Magnetic";
import { HeroStage } from "./HeroStage";

/**
 * Màn đầu trang chủ /demo3: lời chào hàng + "tài sản số" bốn lớp đổi theo gói.
 * Chuyển động do HeroStage điều khiển qua các dấu data-hero: "title" = tiêu đề hiện theo dòng (data-split là cờ chờ của công thức
 * SplitReveal), "rise" = khối trồi lên (chỉ dịch chuyển, không ẩn chữ). Không JS / giảm chuyển động: mọi thứ đứng sẵn đúng chỗ.
 */
export function D3Hero({ t }: { t: D3Dict }) {
  const { home } = t;
  return (
    <HeroStage labelledBy="d2-hero-title">
      <h1 id="d2-hero-title" data-hero="title" data-split="" className="split-reveal d2-display max-w-[15em]">
        {home.h1[0]} <span className="d2-mark">{home.h1[1]}</span>
      </h1>
      <div className="d2-hero-row">
        <p className="d2-lead" data-hero="rise">
          {home.lead}
        </p>
        <div className="d2-hero-actions">
          {/* Vỏ riêng cho cảnh mở: Magnetic tự điều khiển transform của thẻ nó bọc nên không dùng chung một phần tử */}
          <span data-hero="rise" className="d3-hero-cta">
            <Magnetic strength={0.3}>
              <D3Btn href={d3Contact(t.lang)}>{t.cta}</D3Btn>
            </Magnetic>
          </span>
          <span data-hero="rise" className="d3-hero-cta">
            <D3Btn href={d3Href(t.lang, "/plans")} tone="line">
              {home.secondary}
            </D3Btn>
          </span>
        </div>
      </div>
      <D3Asset t={t} />
    </HeroStage>
  );
}
