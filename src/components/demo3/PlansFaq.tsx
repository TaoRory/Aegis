"use client";

import { useRef } from "react";

import { Plus } from "@/components/demo1/icons";
import type { D3Dict } from "@/content/demo3";
import { DUR, EASE, gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";

import { Rise } from "./fx/Rise";

/**
 * Câu hỏi thường gặp: vẫn là <details>/<summary> gốc (không JS, giảm chuyển động, tìm trong trang, trình đọc màn hình đều chạy như thường),
 * thêm chuyển động mở / đóng theo chiều cao khi người dùng không giảm chuyển động.
 *
 * Vì sao dùng GSAP thay cho CSS `interpolate-size` + `::details-content`: hai thứ đó chưa có trên mọi trình duyệt (nhất là Safari
 * trên iPhone), nơi không có thì câu trả lời bật ra tức thì. Một đường mã chạy như nhau ở mọi nơi dễ kiểm hơn hai đường.
 *
 * Vì sao gỡ thuộc tính `name` khi JS chạy: nhóm cùng `name` được trình duyệt tự đóng TỨC THÌ khi một mục khác mở, không có cách
 * chen animation vào. Ở đây tự đóng mục cũ bằng animation rồi mới gỡ `open`. Không JS thì `name` vẫn giữ kiểu "mở một mục".
 *
 * Trong lúc đang đóng, mục vẫn mang `open` (nội dung phải còn để co lại) nên đánh dấu thêm `data-closing`:
 * CSS dựa vào đó để xoay dấu cộng về ngay từ đầu chứ không chờ co xong.
 */
export function PlansFaq({ items }: { items: D3Dict["faq"]["items"] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = ref.current;
      if (!root || !contextSafe) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.anyMotion, () => {
        const rows = gsap.utils.toArray<HTMLDetailsElement>("details", root);
        const parts = (row: HTMLDetailsElement) => {
          const body = row.querySelector<HTMLElement>(".d3-plans-faq-body");
          return body ? ([body, body.firstElementChild as HTMLElement] as const) : null;
        };
        const names = rows.map((row) => row.getAttribute("name"));
        rows.forEach((row) => row.removeAttribute("name"));

        // Chiều cao trang đổi sau khi mở / đóng: báo ScrollTrigger đo lại MỘT lần khi cả hai animation đã xong (và đã ngừng cuộn)
        let settle: gsap.core.Tween | undefined;
        const refreshSoon = () => {
          settle?.kill();
          settle = gsap.delayedCall(DUR.ui * 1.1 + 0.1, () => ScrollTrigger.refresh(true));
        };

        const open = contextSafe((row: HTMLDetailsElement) => {
          const found = parts(row);
          if (!found) return;
          const [body, text] = found;
          // Bấm lại khi đang đóng dở: mở tiếp từ chiều cao hiện tại, không giật về 0
          const from = row.open ? body.offsetHeight : 0;
          row.removeAttribute("data-closing");
          row.open = true;
          gsap.killTweensOf([body, text]);
          gsap.fromTo(
            body,
            { height: from },
            { height: "auto", duration: DUR.ui * 1.1, ease: EASE.inOut, onComplete: () => gsap.set(body, { clearProps: "height" }) },
          );
          if (from === 0) {
            gsap.fromTo(text, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.ui, delay: 0.1, ease: "power2.out", clearProps: "transform,opacity" });
          } else {
            gsap.set(text, { clearProps: "transform,opacity" });
          }
        });

        const close = contextSafe((row: HTMLDetailsElement) => {
          const found = parts(row);
          if (!found) return;
          const [body, text] = found;
          row.setAttribute("data-closing", "");
          gsap.killTweensOf([body, text]);
          // Đóng nhanh hơn mở khoảng 30%: thứ đang rời đi không nên giữ chân người xem
          gsap.to(body, {
            height: 0,
            duration: DUR.ui * 0.75,
            ease: EASE.inOut,
            onComplete: () => {
              row.open = false;
              row.removeAttribute("data-closing");
              gsap.set([body, text], { clearProps: "all" });
            },
          });
        });

        const isOpen = (row: HTMLDetailsElement) => row.open && !row.hasAttribute("data-closing");
        const onClick = (event: MouseEvent) => {
          const row = (event.currentTarget as HTMLElement).parentElement as HTMLDetailsElement;
          // Chặn bật / tắt tức thì của trình duyệt; phím Enter và Space trên <summary> cũng đi qua sự kiện click này
          event.preventDefault();
          if (isOpen(row)) {
            close(row);
          } else {
            rows.forEach((other) => other !== row && isOpen(other) && close(other));
            open(row);
          }
          refreshSoon();
        };
        const summaries = rows.map((row) => row.querySelector("summary"));
        summaries.forEach((summary) => summary?.addEventListener("click", onClick));

        return () => {
          settle?.kill();
          summaries.forEach((summary) => summary?.removeEventListener("click", onClick));
          rows.forEach((row, i) => {
            const found = parts(row);
            if (found) {
              gsap.killTweensOf([...found]);
              gsap.set([...found], { clearProps: "all" });
            }
            if (row.hasAttribute("data-closing")) {
              row.open = false;
              row.removeAttribute("data-closing");
            }
            const name = names[i];
            if (name) row.setAttribute("name", name);
          });
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="d2-faq">
      {items.map((item, i) => (
        // Mục đầu mở sẵn: câu về quyền sở hữu ("làm xong thì thuộc về ai") có ngay câu trả lời, và người xem thấy danh sách này mở được
        <Rise as="details" key={item.q} index={i} name="d2-faq" open={i === 0}>
          <summary>
            <span>{item.q}</span>
            <span className="d3-plans-faq-icon" aria-hidden>
              <Plus />
            </span>
          </summary>
          <div className="d3-plans-faq-body">
            <p>{item.a}</p>
          </div>
        </Rise>
      ))}
    </div>
  );
}
