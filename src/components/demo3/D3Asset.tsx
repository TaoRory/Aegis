"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowRight } from "@/components/demo1/icons";
import { d3Href, d3PlanLayers, type D3Dict, type D3LayerId, type D3PlanId } from "@/content/demo3";

import { LayerMock } from "./D3Bits";
import { D3Link } from "./D3Link";

const PLANS: D3PlanId[] = ["own", "grow", "amplify"];
const LAYERS: D3LayerId[] = ["site", "search", "social", "ai"];

/**
 * Điểm nhấn của màn đầu: "tài sản số" gồm bốn lớp (Website · Search · Social · AI) và ba nút gói.
 * Chọn gói nào thì các lớp của gói đó sáng lên; lớp AI không thuộc gói nào (làm riêng theo tư vấn) nên luôn ở trạng thái "theo yêu cầu".
 * Tự lần lượt đổi gói cho tới khi người xem bấm chọn hoặc bấm Tạm dừng. Giảm chuyển động / không JS: đứng ở gói Grow.
 */
export function D3Asset({ t }: { t: D3Dict }) {
  const { home, plans, chrome } = t;
  const [plan, setPlan] = useState<D3PlanId>("grow");
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    // Chỉ biết được sau khi gắn vào trình duyệt (SSR luôn dựng trạng thái tĩnh)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuto(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setPlan((current) => PLANS[(PLANS.indexOf(current) + 1) % PLANS.length]);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [auto]);

  const lit = d3PlanLayers[plan];

  // Chiều sâu 3D theo con trỏ (chỉ chuột, không giảm chuyển động): cả chồng lớp nghiêng nhẹ, mỗi lớp nổi ở một độ sâu
  const boardRef = useRef<HTMLDivElement>(null);
  const tilt = (event: React.PointerEvent<HTMLDivElement>) => {
    const board = boardRef.current;
    if (!board || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    board.style.setProperty("--rx", (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    board.style.setProperty("--ry", (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  };
  const untilt = () => {
    boardRef.current?.style.removeProperty("--rx");
    boardRef.current?.style.removeProperty("--ry");
  };

  return (
    <div className="d2-asset" onPointerMove={tilt} onPointerLeave={untilt}>
      <div className="d2-asset-side">
        <p className="d2-small font-semibold text-muted" id="d2-asset-label">
          {home.assetLabel}
        </p>
        <div className="d2-seg" role="group" aria-labelledby="d2-asset-label">
          {PLANS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={plan === id}
              onClick={() => {
                setPlan(id);
                setAuto(false);
              }}
            >
              {plans.items.find((item) => item.id === id)?.name}
            </button>
          ))}
          {auto && (
            <button type="button" className="d2-seg-pause" onClick={() => setAuto(false)}>
              {chrome.pause}
            </button>
          )}
        </div>
        <p className="d2-asset-note" aria-live="polite">
          {home.planNotes[plan]}
        </p>
        <D3Link href={d3Href(t.lang, `/plans#plan-${plan}`)} className="d2-link d2-small inline-flex items-center gap-2 font-semibold">
          {home.seePlan}
          <ArrowRight className="size-3.5" />
        </D3Link>
      </div>

      <div ref={boardRef} className="d2-board" aria-hidden>
        {LAYERS.map((layer) => {
          const on = lit.includes(layer);
          return (
            <div key={layer} className="d2-layer" data-layer={layer} data-on={on} data-custom={layer === "ai"}>
              <div className="d2-layer-head">
                <span>{plan === "amplify" && layer === "site" ? home.landing : home.layers[layer].name}</span>
                {layer === "ai" && <span className="d2-chip">{chrome.custom}</span>}
              </div>
              <LayerMock t={t} layer={layer} landing={plan === "amplify"} />
            </div>
          );
        })}
      </div>

      {/* Bản chữ cho trình đọc màn hình: gói đang chọn gồm những lớp nào */}
      <p className="sr-only">
        {lit.map((layer) => `${home.layers[layer].name}: ${home.layers[layer].line}`).join(". ")}. {home.layers.ai.name}: {chrome.custom}.
      </p>
    </div>
  );
}
