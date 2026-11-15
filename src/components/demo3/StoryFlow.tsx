"use client";

import { useState, type CSSProperties, type RefObject } from "react";

import { MotionToggle } from "./HomeMotionToggle";
import { Particles, type Stream } from "./fx/Particles";

/**
 * Lối "Bắt đầu từ website" (Own · Grow): "Dòng khách đổ về". SVG, viewBox 640 × 520.
 * Giữa: website là một cửa hàng phát sáng. Trái: ba nguồn khách (Search, Content, Social) mở dần theo mốc, mỗi nguồn một dòng hạt chảy về.
 * Phải: lưới "Khách hàng" lấp dần (CSS tính từ --p, càng về sau càng nhanh: cộng dồn). Dưới: website bị bỏ đó, không dòng nào chảy về, lưới gần như trống.
 * Mọi thứ hiện theo một biến --p (tiến độ cuộn, D3Story ghi; không có thì = 1 → cảnh đầy đủ). Không có con số nào: minh hoạ ý tưởng.
 */

/** Mốc xuất hiện (tiến độ cuộn): 0 Launch · 0,2 Handover · 0,4 Search · 0,6 Content · 0,8 Social */
const SOURCES = [
  { y: 96, at: 0.4 },
  { y: 200, at: 0.6 },
  { y: 304, at: 0.8 },
];
const intake = (y: number) => `M 150 ${y} C 205 ${y}, 200 200, 244 200`;
const OUTFLOW = "M 356 200 C 380 200, 392 200, 418 200";

const STREAMS: Stream[] = [
  ...SOURCES.map((source) => ({ d: intake(source.y), at: source.at, count: 9, speed: 0.42, r: 3.2 })),
  { d: OUTFLOW, at: 0.42, count: 6, speed: 0.6, r: 3, ramp: 0.5 },
];

/** Lưới khách hàng: 9 cột × 8 hàng, lấp từ cột gần cửa hàng ra xa */
const COLS = 9;
const ROWS = 8;
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => ({ i, x: 434 + Math.floor(i / ROWS) * 22, y: 124 + (i % ROWS) * 22 }));

const at = (value: number) => ({ "--at": value }) as CSSProperties;

export function StoryFlow({
  labels,
  progress,
}: {
  labels: { growth: string; site: string; owned: string; sources: [string, string, string]; customers: string; pause: string; play: string };
  progress: RefObject<number>;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div className="d3-fx" data-scene="flow">
      <svg viewBox="0 0 640 520" className="d3-fx-svg">
        {/* Nguồn khách + đường dẫn về cửa hàng */}
        {SOURCES.map((source, i) => (
          <g key={source.y} className="d3-r" style={at(source.at)}>
            <path d={intake(source.y)} className="d3-fx-track" />
            <rect x={30} y={source.y - 19} width={120} height={38} rx={19} className="d3-fx-pill" />
            <circle cx={50} cy={source.y} r={7} className="d3-fx-pill-dot" />
            <text x={64} y={source.y + 4.5} className="d3-fx-pill-text">
              {labels.sources[i]}
            </text>
          </g>
        ))}

        {/* Quầng sáng lớn dần theo tiến độ (càng nhiều khách càng sáng) */}
        <g className="d3-fx-glow">
          {[0, 1, 2].map((ring) => (
            <circle key={ring} cx={300} cy={200} r={70 + ring * 30} />
          ))}
        </g>

        {/* Handover: viền "thuộc về bạn" */}
        <g className="d3-r" style={at(0.2)}>
          <rect x={232} y={146} width={136} height={108} rx={20} className="d3-fx-own" />
          <rect x={248} y={262} width={104} height={24} rx={12} className="d3-fx-chip" />
          <text x={300} y={278} textAnchor="middle" className="d3-fx-chip-text">
            {labels.owned}
          </text>
        </g>

        {/* Chữ ký phía trên cửa hàng */}
        <text x={300} y={132} textAnchor="middle" className="d3-fx-signature d3-r" style={at(0)}>
          {labels.growth}
        </text>

        {/* Cửa hàng: khung trình duyệt */}
        <g className="d3-r d3-r-pop" style={at(0)}>
          <rect x={246} y={158} width={108} height={84} rx={12} className="d3-fx-hub" />
          <circle cx={259} cy={170} r={3} className="d3-fx-hub-dot" />
          <circle cx={269} cy={170} r={3} className="d3-fx-hub-dot" />
          <circle cx={279} cy={170} r={3} className="d3-fx-hub-dot" />
          <rect x={258} y={186} width={56} height={6} rx={3} className="d3-fx-hub-line" />
          <rect x={258} y={198} width={84} height={5} rx={2.5} className="d3-fx-hub-line" data-soft />
          <text x={300} y={228} textAnchor="middle" className="d3-fx-hub-text">
            {labels.site}
          </text>
        </g>

        {/* Lưới khách hàng */}
        <path d={OUTFLOW} className="d3-fx-track d3-r" style={at(0.4)} />
        <text x={434} y={104} className="d3-fx-caption">
          {labels.customers}
        </text>
        <g className="d3-fx-cells">
          {CELLS.map((cell) => (
            <g key={cell.i} style={{ "--i": cell.i } as CSSProperties}>
              <circle cx={cell.x} cy={cell.y} r={7} className="d3-fx-cell" />
              <circle cx={cell.x} cy={cell.y} r={7} className="d3-fx-cell-on" />
            </g>
          ))}
        </g>

        {/* Website bị bỏ đó: không nguồn nào, lưới gần như trống */}
        <g className="d3-fx-alone">
          <line x1={30} x2={610} y1={392} y2={392} className="d3-fx-rule" />
          <path d="M 150 452 C 200 452, 205 452, 270 452" className="d3-fx-track" data-dead />
          <rect x={270} y={430} width={60} height={44} rx={8} className="d3-fx-hub" data-dead />
          <text x={300} y={457} textAnchor="middle" className="d3-fx-hub-text" data-small>
            {labels.site}
          </text>
          {Array.from({ length: COLS }, (_, i) => (
            <circle key={i} cx={434 + i * 22} cy={452} r={7} className={i < 2 ? "d3-fx-cell-dead" : "d3-fx-cell"} />
          ))}
        </g>

        <Particles streams={STREAMS} progress={progress} paused={paused} />
      </svg>
      <MotionToggle className="d3-fx-toggle" paused={paused} labels={{ pause: labels.pause, play: labels.play }} onToggle={() => setPaused((value) => !value)} />
    </div>
  );
}
