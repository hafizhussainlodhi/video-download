export default function LoadingState({ platformLabel }: { platformLabel?: string }) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5 py-10 animate-fadeUp">
      <svg viewBox="0 0 320 120" className="h-24 w-full max-w-md" aria-hidden="true">
        {/* the source line, representing the pasted URL */}
        <line x1="10" y1="60" x2="150" y2="60" stroke="#26314A" strokeWidth="2" strokeDasharray="4 6" />

        {/* three chevrons pulsing toward the funnel — the "pull" */}
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${150 + i * 16},50 L${162 + i * 16},60 L${150 + i * 16},70`}
            stroke="#29D3C0"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulseFlow"
            style={{ animationDelay: `${i * 0.18}s`, opacity: 0.4 }}
          />
        ))}

        {/* funnel converging into the output file */}
        <path d="M198,40 L232,52 L232,68 L198,80 Z" fill="none" stroke="#1D9C90" strokeWidth="1.5" />

        {/* the resulting file, ready to receive the stream */}
        <g transform="translate(240, 35)">
          <rect x="0" y="0" width="42" height="50" rx="6" fill="#131B2E" stroke="#29D3C0" strokeWidth="1.5" />
          <path d="M10 30 L21 40 L32 24" stroke="#29D3C0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        </g>
      </svg>

      <div className="text-center">
        <p className="font-display text-sm font-medium text-text-primary">
          Pulling{platformLabel ? ` from ${platformLabel}` : ''}…
        </p>
        <p className="mt-1 text-xs text-text-faint">Reading available qualities — this usually takes a few seconds.</p>
      </div>
    </div>
  );
}
