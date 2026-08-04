export function NexoMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div
      className={`${className} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 shadow-lg ring-1 ring-white/10`}
    >
      <svg className="h-[60%] w-[60%]" viewBox="0 0 48 48" fill="none">
        <path d="M10 12 L22 36 H16.5 L10 19.5 Z" fill="#7E8BEC" />
        <path d="M38 12 L38 36" stroke="#7E8BEC" strokeWidth="4" strokeLinecap="round" />
        <circle cx="33.5" cy="30" r="4.5" fill="#D9A83D" />
      </svg>
    </div>
  )
}
