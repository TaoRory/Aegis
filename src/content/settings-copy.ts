/** Chữ của nút "Cài đặt hiệu ứng", dùng chung cho trang chính và Factory */
export interface SettingsCopy {
  button: string;
  title: string;
  quality: { label: string; hint: string; high: string; low: string };
  cursor: { label: string; hint: string; on: string; off: string };
  reload: string;
}

export const settingsCopy: Record<"vi" | "en", SettingsCopy> = {
  vi: {
    button: "Cài đặt",
    title: "Cài đặt hiệu ứng",
    quality: { label: "Chất lượng hiệu ứng", hint: "Thấp: nhẹ máy hơn (ít hạt, không khói, thư viện style dạng CSS).", high: "Cao", low: "Thấp" },
    cursor: { label: "Con trỏ riêng", hint: "Tắt để dùng con trỏ gốc của trình duyệt.", on: "Bật", off: "Tắt" },
    reload: "Đổi cài đặt sẽ tải lại trang. Hệ thống cũng tự giảm hiệu ứng khi bạn bật “giảm chuyển động”.",
  },
  en: {
    button: "Settings",
    title: "Effects settings",
    quality: { label: "Effects quality", hint: "Low: lighter on your device (fewer particles, no smoke, a CSS-based style gallery).", high: "High", low: "Low" },
    cursor: { label: "Custom cursor", hint: "Turn off to use the browser's own cursor.", on: "On", off: "Off" },
    reload: "Changing a setting reloads the page. Effects are also reduced automatically when you turn on “reduce motion”.",
  },
};
