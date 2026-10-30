import { ImageResponse } from "next/og";

/** Icon màn hình chính iOS (180×180). TẠM THỜI: cùng chữ A và màu với icon.svg, thay khi có logo chính thức. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#060a14" }}>
        <svg width="140" height="140" viewBox="0 0 32 32">
          <path fill="#9db1ff" fillRule="evenodd" d="M14.1 7h3.8l7.6 18h-3.9l-1.6-4h-8l-1.6 4H6.5zm1.9 4.4L13.2 18h5.6z" />
        </svg>
      </div>
    ),
    size,
  );
}
