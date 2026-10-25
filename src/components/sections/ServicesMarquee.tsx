import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { services } from "@/content/services";

/**
 * Dải chữ khổng lồ giữa các chương: tên 4 nhóm dịch vụ, chạy theo tốc độ và chiều cuộn (Emotion/Signal-A pattern).
 * Chỉ trang trí (nội dung đã có ở mục Dịch vụ) nên ẩn với trình đọc màn hình.
 */
export function ServicesMarquee() {
  return (
    <div aria-hidden data-surface="dark" className="ink relative z-10 border-y border-line py-6 lg:py-10">
      <VelocityMarquee speed={0.7}>
        {services.map((service, i) => (
          <span key={service.shortTitle} className="flex items-center text-mega font-semibold">
            <span className={i % 2 === 1 ? "marquee-outline" : undefined}>{i % 2 === 1 ? <em>{service.shortTitle}</em> : service.shortTitle}</span>
            <span className="mx-[0.35em] text-accent">+</span>
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}
