/**
 * Chữ AEGIS của bộ nhận diện (Brand-guideline/…/AEGIS_Wordmark_*.svg) vẽ lại bằng hình học sạch: bản trong bộ kit là nét trace
 * tay nên răng cưa khi phóng to (README của bộ kit cũng ghi "cần designer chốt hình học"). Giữ dáng gốc: chữ A có thanh ngang
 * tách khỏi chân trái, E ba thanh, G và S vát góc, khoảng chữ rộng. Nét đều 20–21 đơn vị trên chiều cao 100. Màu = currentColor.
 * ⚑ Bản vẽ lại để demo, chờ designer duyệt trước khi dùng chính thức.
 */
const D = "M0 100 L25 100 L87 0 L62 0ZM124 100 L149 100 L87 0 L62 0ZM52 82 L120 82 L120 64 L63 64ZM186 0 L298 0 L298 20 L207 20 L207 40 L288 40 L288 60 L207 60 L207 80 L298 80 L298 100 L186 100ZM368 0 L484 0 L484 20 L376 20 L355 41 L355 62 L372 80 L463 80 L463 62 L416 62 L416 44 L484 44 L484 100 L364 100 L334 70 L334 32ZM520 0 L541 0 L541 100 L520 100ZM717 0 L607 0 L577 26 L577 36 L601 60 L687 60 L696 66 L696 74 L685 80 L577 80 L577 100 L689 100 L717 78 L717 62 L693 40 L607 40 L598 34 L598 28 L609 20 L717 20Z";

export function D1Wordmark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 717 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title} fill="currentColor">
      <path d={D} />
    </svg>
  );
}
