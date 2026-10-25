import type { ComponentProps, ReactNode } from "react";

import { Magnetic } from "@/components/motion/Magnetic";
import { SmartLink, type NavType } from "@/components/ui/SmartLink";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "link";

const variants: Record<Variant, string> = {
  primary: "btn btn-box h-12 bg-accent px-5 text-on-accent hover:bg-accent-strong",
  outline: "btn btn-box h-12 border border-line-strong px-5 text-fg hover:border-fg",
  link: "btn-link text-fg",
};

/** Chữ cuộn khi hover: bản sao (aria-hidden) trượt lên thay chỗ — CSS thuần, xem effects.css .roll */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span className="roll-a">{children}</span>
      <span className="roll-b" aria-hidden>
        {children}
      </span>
    </span>
  );
}

interface StyleProps {
  variant?: Variant;
  children: string;
  /** Mũi tên ↗ cho liên kết ra ngoài, → cho điều hướng */
  arrow?: "→" | "↗" | "↓" | false;
}

function Content({ children, arrow }: Pick<StyleProps, "children" | "arrow">) {
  return (
    <>
      <Roll>{children}</Roll>
      {arrow && (
        <span aria-hidden className="btn-arrow">
          {arrow}
        </span>
      )}
    </>
  );
}

export function ButtonLink({
  variant = "primary",
  arrow = "→",
  className,
  children,
  href = "#",
  navType,
  ...props
}: StyleProps & Omit<ComponentProps<"a">, "children"> & { navType?: NavType }) {
  return (
    <SmartLink href={href} navType={navType} className={cn(variants[variant], className)} {...props}>
      <Content arrow={arrow}>{children}</Content>
    </SmartLink>
  );
}

export function Button({
  variant = "primary",
  arrow = "→",
  className,
  children,
  type = "button",
  ...props
}: StyleProps & Omit<ComponentProps<"button">, "children">) {
  return (
    <button type={type} className={cn(variants[variant], className)} {...props}>
      <Content arrow={arrow}>{children}</Content>
    </button>
  );
}

/** Nút tròn lớn có hiệu ứng magnetic, dùng cho CTA chính */
export function RoundButton({
  children,
  className,
  size = "md",
  href = "#",
  ...props
}: { children: ReactNode; size?: "md" | "lg" } & ComponentProps<"a">) {
  return (
    <Magnetic strength={0.3}>
      <SmartLink href={href} className={cn("round-btn", size === "lg" && "round-btn-lg", className)} data-cursor="link" {...props}>
        <span className="round-btn-fill" aria-hidden />
        <span className="relative">{children}</span>
        <span aria-hidden className="relative text-[1.4em] leading-none">
          ↘
        </span>
      </SmartLink>
    </Magnetic>
  );
}
