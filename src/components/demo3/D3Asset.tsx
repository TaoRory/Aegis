"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowRight } from "@/components/demo1/icons";
import { d3Href, d3PlanLayers, type D3Dict, type D3LayerId, type D3PlanId } from "@/content/demo3";
import { MQ } from "@/lib/motion";

import { LayerMock } from "./D3Bits";
import { D3Link } from "./D3Link";

const PLANS: D3PlanId[] = ["own", "grow", "amplify"];
const LAYERS: D3LayerId[] = ["site", "search", "social", "ai"];

/**
 * Điểm nhấn của màn đầu: "tài sản số" gồm bốn lớp (Website · Search · Social · AI) và ba nút gói.
 * Chọn gói nào thì các lớp của gói đó sáng lên; lớp AI không thuộc gói nào (làm riêng theo tư vấn) nên luôn ở trạng thái "theo yêu cầu".
 * Tự lần lượt đổi gói cho tới khi người xem bấm chọn hoặc bấm Tạm dừng. Giảm chuyển động / không JS: đứng ở gói Grow.
 *
 * Mỗi lớp có ba tầng phần tử, mỗi tầng một loại chuyển động, để chúng không giành nhau thuộc tính transform:
 *   .d2-board  nghiêng theo con trỏ (biến --rx / --ry, CSS)
 *   .d3-stack  ngả ra sau khi màn đầu trôi đi (biến --d3-ex, CSS)
 *   .d3-slot   vị trí của lớp; cảnh mở bay vào (GSAP, xem HeroStage) và tách theo chiều sâu khi cuộn (--d3-ex, CSS)
 *   .d2-layer  mặt thẻ: sáng / tối theo gói, nhấc nhẹ, trôi (CSS)
 *
 * Nút Tạm dừng / Chạy tiếp dừng mọi thứ tự chạy trong khối này: vòng đổi gói, lớp trôi và các mô hình minh hoạ lặp vô hạn.
 * Chọn một gói thì vòng đổi gói dừng (để người xem đọc), các mô hình vẫn chạy cho tới khi bấm Tạm dừng.
 */
export function D3Asset({ t }: { t: D3Dict }) {
  const { home, plans, chrome } = t;
  const [plan, setPlan] = useState<D3PlanId>("grow");
  const [auto, setAuto] = useState(false);
  /** Người xem đã bấm Tạm dừng: các vòng lặp CSS trong khối cũng đứng yên */
  const [still, setStill] = useState(false);

  useEffect(() => {
    // Chỉ biết được sau khi gắn vào trình duyệt (SSR luôn dựng trạng thái tĩnh)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuto(!window.matchMedia(MQ.reduced).matches);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setPlan((current) => PLANS[(PLANS.indexOf(current) + 1) % PLANS.length]);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [auto]);

  const lit = d3PlanLayers[plan];
  const moving = auto || !still;

  // Chiều sâu 3D theo con trỏ (chỉ chuột, không giảm chuyển động): cả chồng lớp nghiêng nhẹ, mỗi lớp nổi ở một độ sâu
  const boardRef = useRef<HTMLDivElement>(null);
  const tilt = (event: React.PointerEvent<HTMLDivElement>) => {
    const board = boardRef.current;
    if (!board || event.pointerType !== "mouse" || !window.matchMedia(`${MQ.fineHover} and ${MQ.anyMotion}`).matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    board.style.setProperty("--rx", (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    board.style.setProperty("--ry", (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  };
  const untilt = () => {
    boardRef.current?.style.removeProperty("--rx");
    boardRef.current?.style.removeProperty("--ry");
  };

  return (
    <div className="d2-asset" data-still={still || undefined} onPointerMove={tilt} onPointerLeave={untilt}>
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
          {/* Luôn có trong HTML để hàng nút không đổi chiều cao sau khi hydrate; hero.css chỉ cho hiện khi html[data-motion="on"] */}
          <button
            type="button"
            className="d2-seg-pause"
            onClick={() => {
              setAuto(!moving);
              setStill(moving);
            }}
          >
            {moving ? chrome.pause : chrome.play}
          </button>
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
        <div className="d3-stack">
          {LAYERS.map((layer) => {
            const on = lit.includes(layer);
            return (
              <div key={layer} className="d3-slot" data-layer={layer} data-on={on}>
                <div className="d2-layer" data-layer={layer} data-on={on} data-custom={layer === "ai"}>
                  <div className="d2-layer-head">
                    <span>{plan === "amplify" && layer === "site" ? home.landing : home.layers[layer].name}</span>
                    {layer === "ai" && <span className="d2-chip">{chrome.custom}</span>}
                  </div>
                  <LayerMock t={t} layer={layer} landing={plan === "amplify"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bản chữ cho trình đọc màn hình: gói đang chọn gồm những lớp nào */}
      <p className="sr-only">
        {lit.map((layer) => `${home.layers[layer].name}: ${home.layers[layer].line}`).join(". ")}. {home.layers.ai.name}: {chrome.custom}.
      </p>
    </div>
  );
}
