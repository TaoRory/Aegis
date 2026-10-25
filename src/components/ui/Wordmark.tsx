import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Wordmark chữ TẠM THỜI. Khi có logo chính thức, thay phần nội dung component này
 * (ví dụ bằng <Image src="/brand/logo.svg" … />). Mọi nơi dùng Wordmark tự cập nhật.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-sans text-[1.5rem] font-semibold tracking-[-0.045em]", className)}>
      {siteConfig.name}
    </span>
  );
}
