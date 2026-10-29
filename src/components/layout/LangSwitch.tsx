"use client";

import { usePathname } from "next/navigation";

import { useSite } from "@/components/layout/SiteLang";
import { counterpartPath } from "@/config/routes";
import { locales } from "@/config/space";
import { cn } from "@/lib/cn";

/**
 * Nút đổi ngôn ngữ VI | EN của trang chính, giữ nguyên trang đang xem. Dùng liên kết thường (tải lại trang) vì đây là thao tác hiếm,
 * và để thuộc tính html[lang] đổi đúng (xem script đầu trang trong app/layout.tsx); vì vậy cũng không chạy màn chuyển trang (data-no-cover).
 */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, chrome } = useSite();
  const pathname = usePathname();
  return (
    <div role="group" aria-label={chrome.language.label} className={cn("lang-switch label inline-flex items-center", className)}>
      {locales.map((l) => (
        <a
          key={l}
          href={counterpartPath(pathname, l)}
          hrefLang={l}
          data-no-cover
          lang={l}
          aria-current={l === lang ? "true" : undefined}
          aria-label={l === lang ? undefined : chrome.language.switchTo}
          className="lang-switch-link"
        >
          {chrome.language[l]}
        </a>
      ))}
    </div>
  );
}
