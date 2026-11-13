/** Icon nét 1.5px của /demo2 (cùng hệ nét với icons.tsx của /demo1) */
export function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden className={className}>
      <path d="M3 8.5l3.2 3.2L13 4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
