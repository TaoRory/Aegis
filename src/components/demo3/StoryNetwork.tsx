"use client";

import { useState, type CSSProperties, type RefObject } from "react";

import { MotionToggle } from "./HomeMotionToggle";
import { Particles, type Stream } from "./fx/Particles";

/**
 * Lối "Chỉ marketing" (Amplify): "Mạng lưới lan toả". SVG, viewBox 640 × 520.
 * Giữa: thương hiệu. Mốc 1 Chiến lược: năm kênh toả ra quanh thương hiệu (chưa mang màu).
 * Mốc 2 Giọng thương hiệu: các kênh đổi sang màu thương hiệu, quầng quanh thương hiệu. Mốc 3 Landing page: một nút riêng nối vào.
 * Mốc 4 Nội dung: xung bài đăng chạy từ thương hiệu ra các kênh. Mốc 5 Tiếp cận: vòng khán giả mọc dần (CSS tính từ --p), nối vào kênh gần nhất,
 * xung chạy tiếp từ kênh ra khán giả. Dưới: một nút "đăng vài bài rồi ngừng", dây đứt, xám.
 * Mọi thứ hiện theo một biến --p (tiến độ cuộn; không có thì = 1 → cảnh đầy đủ). Không tên nền tảng, không con số nào.
 */

const C = { x: 320, y: 196 };
const polar = (radius: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: +(C.x + radius * Math.cos(rad)).toFixed(1), y: +(C.y + radius * Math.sin(rad)).toFixed(1) };
};

/** Năm kênh, đều quanh thương hiệu (bỏ trống phía dưới cho landing page) */
const CHANNEL_DEG = [-90, -30, 30, 150, 210];
const CHANNELS = CHANNEL_DEG.map((deg) => ({ deg, ...polar(104, deg) }));

/** Vòng khán giả: 54 nút ở hai bán kính xen kẽ; mỗi nút nối vào kênh gần nhất theo góc */
const AUDIENCE = Array.from({ length: 54 }, (_, i) => {
  const deg = -90 + i * (360 / 54) + (i % 2 ? 3 : -3);
  const point = polar(i % 3 === 0 ? 182 : i % 3 === 1 ? 160 : 140, deg);
  const near = CHANNELS.reduce((best, ch) => {
    const gap = Math.abs((((deg - ch.deg) % 360) + 540) % 360 - 180);
    return gap < best.gap ? { gap, ch } : best;
  }, { gap: 999, ch: CHANNELS[0] }).ch;
  // Thứ tự mọc: xen kẽ quanh vòng để mạng dày lên đều, không mọc lần lượt một phía
  return { i, order: (i * 23) % 54, ...point, near };
});

const LANDING = { x: 320, y: 296 };

const STREAMS: Stream[] = [
  // Xung bài đăng xuất phát từ mép nút thương hiệu (không chạy đè lên chữ ở tâm)
  ...CHANNELS.map((ch) => ({ d: `M ${polar(40, ch.deg).x} ${polar(40, ch.deg).y} L ${ch.x} ${ch.y}`, at: 0.6, count: 3, speed: 0.5, r: 3 })),
  ...CHANNELS.map((ch) => ({ d: `M ${ch.x} ${ch.y} L ${polar(178, ch.deg).x} ${polar(178, ch.deg).y}`, at: 0.82, count: 2, speed: 0.55, r: 2.6, ramp: 0.1 })),
];

const at = (value: number) => ({ "--at": value }) as CSSProperties;

export function StoryNetwork({
  labels,
  progress,
}: {
  labels: { brand: string; channels: string; landing: string; reach: string; pause: string; play: string };
  progress: RefObject<number>;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="d3-fx" data-scene="network">
      <svg viewBox="0 0 640 520" className="d3-fx-svg">
        {/* Sóng lan (mốc 5) */}
        <g className="d3-r" style={at(0.8)}>
          {[120, 200, 250].map((radius) => (
            <circle key={radius} cx={C.x} cy={C.y} r={radius} className="d3-fx-wave" />
          ))}
        </g>

        {/* Khán giả: dây nối vào kênh gần nhất + nút; mọc dần theo --p */}
        <g className="d3-fx-audience">
          {AUDIENCE.map((node) => (
            <g key={node.i} style={{ "--i": node.order } as CSSProperties}>
              <line x1={node.near.x} y1={node.near.y} x2={node.x} y2={node.y} className="d3-fx-link" data-soft />
              <circle cx={node.x} cy={node.y} r={node.i % 3 === 0 ? 5 : 3.6} className="d3-fx-person" />
            </g>
          ))}
        </g>

        {/* Dây thương hiệu → kênh */}
        {CHANNELS.map((ch) => (
          <line key={ch.deg} x1={C.x} y1={C.y} x2={ch.x} y2={ch.y} className="d3-fx-link d3-r" style={at(0.02)} />
        ))}

        {/* Landing page (mốc 3) */}
        <g className="d3-r d3-r-pop" style={at(0.4)}>
          <line x1={C.x} y1={C.y} x2={LANDING.x} y2={LANDING.y - 14} className="d3-fx-link" />
          <rect x={LANDING.x - 54} y={LANDING.y - 14} width={108} height={28} rx={8} className="d3-fx-landing" />
          <text x={LANDING.x} y={LANDING.y + 4.5} textAnchor="middle" className="d3-fx-landing-text">
            {labels.landing}
          </text>
        </g>

        {/* Kênh: nút xám (mốc 1) phủ màu thương hiệu (mốc 2) */}
        {CHANNELS.map((ch, i) => (
          <g key={ch.deg} className="d3-r d3-r-pop" style={at(0.02 + i * 0.02)}>
            <circle cx={ch.x} cy={ch.y} r={17} className="d3-fx-channel" />
            <circle cx={ch.x} cy={ch.y} r={17} className="d3-fx-channel-on d3-r" style={at(0.2 + i * 0.015)} />
            <rect x={ch.x - 6} y={ch.y - 6} width={12} height={12} rx={3} className="d3-fx-channel-glyph" />
          </g>
        ))}

        {/* Thương hiệu + quầng (mốc 2) */}
        <circle cx={C.x} cy={C.y} r={50} className="d3-fx-halo d3-r" style={at(0.2)} />
        <g className="d3-r d3-r-pop" style={at(0)}>
          <circle cx={C.x} cy={C.y} r={36} className="d3-fx-brand" />
          <text x={C.x} y={C.y + 5} textAnchor="middle" className="d3-fx-brand-text">
            {labels.brand}
          </text>
        </g>

        <Particles streams={STREAMS} progress={progress} paused={paused} />

        {/* Nhãn */}
        <text x={CHANNELS[1].x + 26} y={CHANNELS[1].y - 18} className="d3-fx-caption d3-r" style={at(0.06)}>
          {labels.channels}
        </text>
        <text x={612} y={372} textAnchor="end" className="d3-fx-caption d3-r" style={at(0.82)}>
          {labels.reach}
        </text>

        {/* Đăng vài bài rồi ngừng: nút xám, hai bài, dây đứt */}
        <g className="d3-fx-alone">
          <line x1={30} x2={610} y1={392} y2={392} className="d3-fx-rule" />
          <circle cx={300} cy={452} r={20} className="d3-fx-brand" data-dead />
          <line x1={320} y1={452} x2={360} y2={452} className="d3-fx-link" data-dead />
          <line x1={372} y1={452} x2={392} y2={452} className="d3-fx-link" data-dead />
          <rect x={346} y={426} width={12} height={12} rx={3} className="d3-fx-channel-glyph" data-dead />
          <rect x={364} y={432} width={12} height={12} rx={3} className="d3-fx-channel-glyph" data-dead />
          <circle cx={410} cy={452} r={4} className="d3-fx-person" data-dead />
        </g>
      </svg>
      <MotionToggle className="d3-fx-toggle" paused={paused} labels={{ pause: labels.pause, play: labels.play }} onToggle={() => setPaused((value) => !value)} />
    </div>
  );
}
