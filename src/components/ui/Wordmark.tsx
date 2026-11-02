import { AegisLogo, AegisMark } from "@/components/brand/AegisLogo";
import { cn } from "@/lib/cn";

/**
 * Logo trên header gồm hai lớp chồng khít nhau:
 *  - Wordmark (lớp header, mix-blend-difference để chữ luôn tương phản trên mọi nền): chữ "Aegis"; biểu tượng chỉ CHỪA CHỖ (ẩn).
 *  - HeaderMark (lớp riêng, không blend): biểu tượng kính đủ màu, đặt đúng chỗ đã chừa. Blend sẽ đảo màu biểu tượng nên phải tách lớp.
 * Hai lớp dùng cùng cấu trúc (AegisLogo) nên luôn trùng vị trí, kể cả khi đổi cỡ chữ hay font.
 */
export function Wordmark({ className }: { className?: string }) {
  return <AegisLogo className={cn("aegis-logo-header", className)} markHidden />;
}

export function HeaderMark() {
  return (
    <span aria-hidden className="aegis-logo aegis-logo-header">
      <AegisMark small />
      <span className="aegis-wordmark invisible">Aegis</span>
    </span>
  );
}
