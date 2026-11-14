import { ArrowRight, ArrowUpRight } from "@/components/demo1/icons";

/**
 * Mũi tên "đi qua": rê chuột (hoặc focus bàn phím) vào liên kết chứa nó thì mũi tên đang đứng trượt ra, một mũi tên khác vào từ phía đối diện.
 * `dir="right"`: đi ngang (liên kết nội bộ). `dir="out"`: đi chéo lên phải (liên kết mở website bên ngoài).
 * Khung cắt phần tràn nên không có gì lọt ra ngoài ô. CSS: .d3-arrow-swap (shell.css).
 * Trang trí: aria-hidden. Giảm chuyển động / không có chuột: chỉ là một mũi tên đứng yên.
 */
export function ArrowSwap({ dir = "right" }: { dir?: "right" | "out" }) {
  const Icon = dir === "out" ? ArrowUpRight : ArrowRight;
  return (
    <span className="d3-arrow-swap" data-dir={dir} aria-hidden>
      <Icon />
      <Icon />
    </span>
  );
}
