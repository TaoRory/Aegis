import { ImageResponse } from "next/og";

/** Icon màn hình chính iOS (180×180) theo Brand Guideline: biểu tượng lục giác teal trên nền Deep Ink Teal (cùng hình với icon.svg). */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BLADE = "M0.93 -42.5L36.75 -21.82Q23.11 -13.12 14.9 0.83L9.61 -12.25Q8.9 -28.41 0.93 -42.5Z";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#071F1E" }}>
        <svg width="132" height="132" viewBox="-50 -50 100 100">
          <defs>
            <linearGradient id="g" x1="19.8" y1="-34.29" x2="14.72" y2="-2.86" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#84E4D6" />
              <stop offset="0.5" stopColor="#13B5A5" />
              <stop offset="1" stopColor="#075E56" />
            </linearGradient>
          </defs>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path key={deg} d={BLADE} fill="url(#g)" stroke="url(#g)" strokeWidth={2.4} strokeLinejoin="round" transform={`rotate(${deg})`} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
