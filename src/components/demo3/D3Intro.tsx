"use client";

import { useRef, useState, useSyncExternalStore } from "react";

import { AegisMark } from "@/components/brand/AegisLogo";
import { assembleMark } from "@/components/brand/mark-motion";
import { gsap, useGSAP } from "@/lib/motion";

/** Phát trên window khi intro bắt đầu mở trang (hoặc khi nó bị bỏ qua / lỗi): màn đầu nghe sự kiện này để bắt đầu dàn cảnh */
export const D3_INTRO_DONE = "d3:intro-done";

const SESSION_KEY = "aegis-d3-intro";

/**
 * Chạy lúc trình duyệt đọc HTML (trước khung hình đầu tiên), chỉ ở lần tải trang thật (điều hướng phía client không chạy script):
 * lần đầu của phiên + không giảm chuyển động (cờ data-motion do script đầu trang đặt) + đang ở trang chủ /demo3 hoặc /demo3/vi
 * thì đặt html[data-d3-intro="playing"]. Cờ phiên ghi ngay tại đây chứ không chờ intro chạy xong, để dù có lỗi gì thì lần tải sau
 * cũng không lặp lại. Vào thẳng một trang con trước thì coi như đã qua lần đầu (intro chỉ đi cùng cảnh mở của trang chủ).
 * Không dùng dấu gạch chéo ngược trong chuỗi này (template literal làm mất).
 */
const BOOT = `(function(){try{var d=document.documentElement,s=sessionStorage;if(s.getItem('${SESSION_KEY}'))return;s.setItem('${SESSION_KEY}','1');if(d.dataset.motion!=='on')return;var p=location.pathname.split('/').filter(Boolean);if(p[0]==='demo3'&&(p.length===1||(p.length===2&&p[1]==='vi')))d.dataset.d3Intro='playing';}catch(e){}})();`;

/** Intro có đang che trang không (chỉ đúng trước khi nó bắt đầu mở) */
const introPlaying = () => document.documentElement.dataset.d3Intro === "playing";

/**
 * Gọi `start` khi intro bắt đầu mở trang; không có intro thì gọi ngay. Trả về hàm huỷ.
 * Có hẹn giờ dự phòng: nếu vì lý do gì sự kiện không tới (intro lỗi trước khi kịp phát) thì vẫn chạy, không để màn đầu kẹt ở trạng thái chờ.
 */
export function onD3IntroDone(start: () => void) {
  if (!introPlaying()) {
    start();
    return () => {};
  }
  let settled = false;
  const stop = () => {
    settled = true;
    window.clearTimeout(timer);
    window.removeEventListener(D3_INTRO_DONE, run);
  };
  const run = () => {
    if (settled) return;
    stop();
    start();
  };
  const timer = window.setTimeout(run, 2600);
  window.addEventListener(D3_INTRO_DONE, run);
  return stop;
}

const subscribe = () => () => {};
const hasIntro = () => document.documentElement.dataset.d3Intro !== undefined;
const noIntro = () => false;

/** Thời lượng (giây). Tổng = OPEN_AT + OPEN = 1,2 giây kể từ lúc JS chạy. */
const ASSEMBLE = 0.95;
const OPEN_AT = 0.72;
const OPEN = 0.48;
/** Màn đầu bắt đầu khi tấm phủ đã hé (không chờ mở hết, để phần vừa lộ ra không đứng yên) */
const HERO_AT = OPEN_AT + 0.14;
/** CSS tự gỡ tấm phủ sau 3 giây nếu JS chưa tới (hero.css); JS tới muộn hơn mốc này thì không dựng lại intro lên trang đã hiện */
const TOO_LATE = 2800;

/**
 * Tấm phủ thu về đúng khung của tấm "tài sản số" ở màn đầu (cùng màu Deep Ink), phần nằm ngoài màn hình thì cắt bỏ.
 * Tấm đó chưa vào màn hình (điện thoại, hoặc người xem đã cuộn) thì tấm phủ rút xuống đáy.
 * Đo tại lúc bắt đầu mở chứ không đo trước, vì bố cục có thể đổi khi font tải xong.
 */
function openTarget() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const slab = document.querySelector<HTMLElement>(".d3-hero .d2-asset");
  const rect = slab?.getBoundingClientRect();
  if (!slab || !rect || rect.top > vh - 48 || rect.bottom < 48) return `inset(${vh}px 0px 0px 0px round 0px)`;
  const px = (n: number) => `${Math.max(0, Math.round(n))}px`;
  const radius = parseFloat(getComputedStyle(slab).borderTopLeftRadius) || 0;
  return `inset(${px(rect.top)} ${px(vw - rect.right)} ${px(vh - rect.bottom)} ${px(rect.left)} round ${radius}px)`;
}

/**
 * Intro thương hiệu của /demo3 (chữ ký): logo Möbius tự lắp ráp trên nền Deep Ink, rồi tấm phủ thu lại thành chính tấm "tài sản số"
 * của màn đầu, như thể màn hình intro trở thành mặt bàn để bốn lớp xếp lên.
 * - Chỉ hiện khi html[data-d3-intro] (script BOOT). Không JS, giảm chuyển động, lần tải sau, điều hướng phía client: không có gì.
 * - Trang vẫn được dựng đầy đủ bên dưới từ đầu; intro chỉ là một lớp phủ trang trí (aria-hidden), không khoá cuộn hay bàn phím.
 * - Bỏ qua: bấm, phím bất kỳ, lăn chuột hoặc chạm. Lỗi bất kỳ hoặc quá 2,2 giây: gỡ ngay. JS không chạy tới đây: CSS tự gỡ sau 3 giây.
 */
export function D3Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  // Máy chủ luôn dựng "không có intro"; trình duyệt đọc cờ sau khi hydrate nên HTML không lệch
  const active = useSyncExternalStore(subscribe, hasIntro, noIntro) && !gone;

  useGSAP(
    () => {
      const root = rootRef.current;
      const html = document.documentElement;
      if (!active || !root || !introPlaying()) return;

      let announced = false;
      let finished = false;
      const announce = () => {
        if (announced) return;
        announced = true;
        html.dataset.d3Intro = "leaving";
        window.dispatchEvent(new Event(D3_INTRO_DONE));
      };
      const finish = () => {
        if (finished) return;
        finished = true;
        announce();
        delete html.dataset.d3Intro;
        setGone(true);
      };

      if (performance.now() > TOO_LATE) {
        finish();
        return;
      }

      let tl: gsap.core.Timeline | null = null;
      // Nhảy thẳng tới đoạn mở (logo coi như đã lắp xong) và mở nhanh gấp đôi
      const skip = () => {
        if (tl && tl.time() < OPEN_AT) tl.seek("open");
        tl?.timeScale(2);
      };
      const hardStop = window.setTimeout(finish, 2200);
      const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
      events.forEach((name) => window.addEventListener(name, skip, { passive: true }));

      try {
        const svg = root.querySelector<SVGSVGElement>("svg");
        if (!svg) throw new Error("d3-intro: thiếu logo");
        tl = assembleMark(svg, { duration: ASSEMBLE });
        tl.addLabel("open", OPEN_AT)
          .to(svg, { scale: 0.86, opacity: 0, duration: 0.26, ease: "power2.in", transformOrigin: "50% 50%" }, "open")
          // immediateRender: false → đích (hàm openTarget) chỉ được đo khi đầu phát chạm tới đoạn này
          .fromTo(root, { clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: openTarget, duration: OPEN, ease: "power3.inOut", immediateRender: false }, "open")
          .call(announce, [], HERO_AT)
          .call(finish);
        root.dataset.live = "on";
      } catch {
        finish();
      }

      return () => {
        window.clearTimeout(hardStop);
        events.forEach((name) => window.removeEventListener(name, skip));
        delete root.dataset.live;
      };
    },
    { scope: rootRef, dependencies: [active] },
  );

  return (
    <>
      {/* Theo hướng dẫn "preventing flash before hydration" của Next: máy chủ phát script thật, còn khi React dựng ở phía client
          (điều hướng không tải lại trang) thì là text/plain, vì script dựng ở client không bao giờ chạy và React sẽ cảnh báo */}
      <script type={typeof window === "undefined" ? "text/javascript" : "text/plain"} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: BOOT }} />
      <div ref={rootRef} className="d3-intro" aria-hidden>
        {active && <AegisMark pieces small className="d3-intro-mark" />}
      </div>
    </>
  );
}
