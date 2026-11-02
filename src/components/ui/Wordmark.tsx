import { AegisLogo } from "@/components/brand/AegisLogo";
import { cn } from "@/lib/cn";

/**
 * Logo trên header: bản MỘT MÀU (header dùng mix-blend-difference để luôn tương phản trên mọi nền, nên bản chuyển sắc teal
 * sẽ bị đảo màu). Mọi nơi dùng Wordmark tự cập nhật khi đổi logo trong components/brand/AegisLogo.tsx.
 */
export function Wordmark({ className }: { className?: string }) {
  return <AegisLogo variant="mono" className={cn("aegis-logo-header", className)} />;
}
