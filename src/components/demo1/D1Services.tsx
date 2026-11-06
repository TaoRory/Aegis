import { d1, d1ContactHref } from "@/content/demo1";

import { D1Button } from "./D1Button";
import { Plus } from "./icons";

/**
 * Bốn mảng dịch vụ dạng danh sách chữ lớn: mục đang mở màu mực, các mục khác xám (rê chuột thì đậm lên).
 * Dùng <details name> gốc của trình duyệt: mở một mục thì mục khác tự đóng, chạy được cả khi chưa có JS.
 * Mục đầu mở sẵn để màn đầu của phần này đã có nội dung.
 */
export function D1Services() {
  const copy = d1.services;
  return (
    <div className="d1-wrap mt-12 lg:mt-16">
      {copy.items.map((service, index) => (
        <details key={service.id} id={`dich-vu-${service.id}`} name="d1-services" open={index === 0} className="d1-svc">
          <summary>
            <span className="d1-label self-start pt-[0.9em] text-muted">({String(index + 1).padStart(2, "0")})</span>
            <h3 className="d1-svc-title">{service.title}</h3>
            <span className="d1-plus">
              <Plus />
            </span>
          </summary>

          <div className="d1-svc-body d1-grid gap-y-10">
            <div className="col-span-12 lg:col-span-5 lg:col-start-1 lg:pl-[calc(3.25rem+var(--d1-gutter))]">
              {service.hook && <p className="d1-lead">{service.hook}</p>}
              <p className="mt-4 max-w-[34rem] text-muted">{service.summary}</p>
              <div className="mt-8 max-w-[34rem] border-t border-line pt-4">
                <p className="d1-label text-muted">{copy.value}</p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed">{service.value}</p>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-7">
              <h4 className="d1-label mb-3 text-muted">{copy.needs}</h4>
              <ul className="d1-bullets text-[0.9375rem] leading-relaxed">
                {service.needs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <h4 className="d1-label mb-3 text-muted">{copy.scope}</h4>
              <ul className="d1-bullets text-[0.9375rem] leading-relaxed">
                {service.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 flex flex-wrap gap-2 lg:pl-[calc(3.25rem+var(--d1-gutter))]">
              <D1Button href={d1ContactHref(service.id)}>{copy.talk}</D1Button>
              {service.id === "web" && (
                <D1Button href="#du-an" variant="soft" icon={false}>
                  {copy.work}
                </D1Button>
              )}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
