import type { ZoneId } from "@/config/space";

/** Biểu tượng nét mảnh cho từng khu (thanh điều hướng điện thoại). Trang trí: tên khu đã có trong văn bản liền kề. */
export function ZoneIcon({ zone, className }: { zone: ZoneId; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {zone === "trung-bay" && (
        <>
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M9 20h6M12 16v4" />
        </>
      )}
      {zone === "thi-nghiem" && (
        <>
          <path d="M9.5 3h5M10.5 3v6.2L5.2 18a2 2 0 0 0 1.7 3h10.2a2 2 0 0 0 1.7-3l-5.3-8.8V3" />
          <path d="M8 15h8" />
        </>
      )}
      {zone === "mau-giao-dien" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
        </>
      )}
      {zone === "dich-vu" && (
        <>
          <path d="M5 3.5h10l4 4V20.5H5z" />
          <path d="M15 3.5v4h4M8.5 12h7M8.5 15.5h7" />
        </>
      )}
      {zone === "ve-aegis" && (
        <>
          <path d="M12 3l7.5 4.3v8.4L12 20 4.5 15.7V7.3z" />
          <circle cx="12" cy="11.5" r="2.4" />
        </>
      )}
      {zone === "lien-he" && (
        <>
          <path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M4 21h16" />
          <circle cx="14.7" cy="12.5" r="0.7" fill="currentColor" />
        </>
      )}
      {zone === "nhat-ky" && (
        <>
          <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v16.5H6.5A1.5 1.5 0 0 0 5 21z" />
          <path d="M5 4.5V21M9 8h6" />
        </>
      )}
      {zone === "hub" && (
        <>
          <path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" />
          <path d="M9 4.5v13M15 6.5v13" />
        </>
      )}
    </svg>
  );
}
