/**
 * Chữ AEGIS cỡ lớn ở chân trang, tách thành năm chữ cái để từng chữ trồi lên từ dưới mép khung (FooterStage điều khiển).
 * Hình học lấy nguyên từ D1Wordmark (src/components/demo1/D1Wordmark.tsx, bản vẽ lại để demo, chờ designer duyệt): chỉ chia
 * một đường thành năm, không sửa nét. Khung nhìn cắt đúng chiều cao chữ, nên chữ dịch xuống là tự khuất, không cần mặt nạ riêng.
 */
const LETTERS = [
  "M0 100 L25 100 L87 0 L62 0ZM124 100 L149 100 L87 0 L62 0ZM52 82 L120 82 L120 64 L63 64Z",
  "M186 0 L298 0 L298 20 L207 20 L207 40 L288 40 L288 60 L207 60 L207 80 L298 80 L298 100 L186 100Z",
  "M368 0 L484 0 L484 20 L376 20 L355 41 L355 62 L372 80 L463 80 L463 62 L416 62 L416 44 L484 44 L484 100 L364 100 L334 70 L334 32Z",
  "M520 0 L541 0 L541 100 L520 100Z",
  "M717 0 L607 0 L577 26 L577 36 L601 60 L687 60 L696 66 L696 74 L685 80 L577 80 L577 100 L689 100 L717 78 L717 62 L693 40 L607 40 L598 34 L598 28 L609 20 L717 20Z",
];

export function FooterWordmark({ className, title }: { className?: string; title: string }) {
  return (
    <svg viewBox="0 0 717 100" className={className} role="img" aria-label={title} fill="currentColor" data-foot-word="">
      {LETTERS.map((d, i) => (
        <path key={i} d={d} data-foot-letter="" />
      ))}
    </svg>
  );
}
