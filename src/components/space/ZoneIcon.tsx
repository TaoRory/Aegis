import type { ZoneId } from "@/config/space";

/**
 * Biểu tượng nét mảnh cho từng khu (thanh điều hướng, bảng chọn dịch vụ). Bốn dịch vụ dùng cùng hình với tác phẩm hạt
 * trong cảnh 3D: mạng nơ-ron, mô-đun, khung trình duyệt, sóng lan tỏa. Trang trí: tên khu luôn có trong văn bản liền kề.
 */
export function ZoneIcon({ zone, className }: { zone: ZoneId | "services"; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {zone === "ai" && (
        <>
          <circle cx="5" cy="7" r="1.8" />
          <circle cx="5" cy="17" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="6" r="1.8" />
          <circle cx="19" cy="18" r="1.8" />
          <path d="M6.6 7.8l3.8 3.2M6.6 16.2l3.8-3.2M13.6 11l3.8-3.9M13.6 13l3.8 3.9" />
        </>
      )}
      {zone === "software" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
          <path d="M13.5 17h7M17 13.5v7" />
        </>
      )}
      {zone === "web" && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <path d="M3 8.5h18" />
          <circle cx="6" cy="6.25" r="0.5" fill="currentColor" />
          <circle cx="8" cy="6.25" r="0.5" fill="currentColor" />
          <path d="M7 13h6M7 16h10" />
        </>
      )}
      {zone === "marketing" && (
        <>
          <circle cx="12" cy="12" r="1.6" />
          <path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 5.3a9.5 9.5 0 0 0 0 13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4" />
        </>
      )}
      {zone === "work" && (
        <>
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M9 20h6M12 16v4" />
        </>
      )}
      {zone === "studio" && (
        <>
          <path d="M9.5 3h5M10.5 3v6.2L5.2 18a2 2 0 0 0 1.7 3h10.2a2 2 0 0 0 1.7-3l-5.3-8.8V3" />
          <path d="M8 15h8" />
        </>
      )}
      {zone === "about" && (
        <>
          <path d="M12 3l7.5 4.3v8.4L12 20 4.5 15.7V7.3z" />
          <circle cx="12" cy="11.5" r="2.4" />
        </>
      )}
      {zone === "contact" && (
        <>
          <path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M4 21h16" />
          <circle cx="14.7" cy="12.5" r="0.7" fill="currentColor" />
        </>
      )}
      {zone === "services" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="3.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="3.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="3.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="3.5" />
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
