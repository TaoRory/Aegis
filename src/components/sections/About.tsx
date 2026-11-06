import { Rich } from "@/components/ui/Rich";
import type { Locale } from "@/config/space";
import { getSiteDict } from "@/content/site";

/**
 * Giới thiệu: câu tuyên ngôn (hiện đủ ngay, không bắt cuộn mới sáng), đoạn mô tả, lời hứa bàn giao,
 * và ba nguyên tắc gọn trong một hàng thấp (không chiếm trọn một màn hình).
 */
export function About({ lang }: { lang: Locale }) {
  const { about, values } = getSiteDict(lang);
  return (
    <section
      id="gioi-thieu"
      data-chapter={about.chapter}
      aria-labelledby="gioi-thieu-title"
      data-surface="light"
      className="paper relative z-10 section-y"
    >
      <div className="container-page">
        <div className="grid gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 id="gioi-thieu-title" className="label text-muted lg:sticky lg:top-28">
              {about.label}
            </h2>
          </div>
          <div className="lg:col-span-9">
            <p className="about-statement text-statement font-medium">
              <Rich text={about.statement} />
            </p>
            <p className="mt-12 max-w-[38rem] text-lead text-muted lg:ml-[25%]">{about.body}</p>
          </div>
        </div>

        {/* Lời hứa bàn giao chung cho cả 4 dịch vụ */}
        <div className="mt-20 grid gap-6 border-y border-line py-10 lg:mt-28 lg:grid-cols-12 lg:items-baseline lg:py-14">
          <p className="label text-accent lg:col-span-3">{about.promise.label}</p>
          <p className="text-h3 font-semibold lg:col-span-9">
            <Rich text={about.promise.text} />
          </p>
        </div>

        {/* Ba nguyên tắc: một hàng ba cột trên máy tính, danh sách gọn trên điện thoại */}
        <div className="mt-16 lg:mt-20">
          <h3 className="label text-muted">{about.valuesLabel}</h3>
          <ul className="mt-6 grid gap-8 md:grid-cols-3 md:gap-10">
            {values.map((value) => (
              <li key={value.title} className="border-t border-line pt-5">
                <p className="text-[clamp(1.5rem,1.2rem+1vw,2.1rem)] leading-tight font-semibold tracking-[-0.03em]">{value.title}</p>
                <p className="mt-3 max-w-[30rem] leading-relaxed text-muted">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
