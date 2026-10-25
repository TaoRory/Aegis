import { Fragment } from "react";

/** Hiển thị chuỗi có cú pháp *nhấn mạnh* thành <em> (serif nghiêng). */
export function Rich({ text }: { text: string }) {
  return text.split("*").map((part, index) =>
    index % 2 === 1 ? <em key={index}>{part}</em> : <Fragment key={index}>{part}</Fragment>,
  );
}

/** Hiển thị mảng dòng (mỗi dòng một khối) — ngắt dòng chủ đích cho tiêu đề lớn. */
export function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, index) => (
    <span key={index} className="block">
      <Rich text={line} />
    </span>
  ));
}

/** Bỏ dấu * để lấy văn bản thuần (aria-label, metadata) */
export function plain(text: string) {
  return text.replaceAll("*", "");
}
