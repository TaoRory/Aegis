/** Icon nét mảnh (1.5px) dùng chung cho /demo1: một hệ nét, không dùng ký tự Unicode thay icon */

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" strokeLinecap="square" />
    </svg>
  );
}

export function ArrowDownRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <path d="M4.5 4.5l7 7M11.5 5.5v6h-6" strokeLinecap="square" />
    </svg>
  );
}

export function Plus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <path d="M8 2.5v11M2.5 8h11" strokeLinecap="square" />
    </svg>
  );
}
