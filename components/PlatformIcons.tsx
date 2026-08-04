import { Youtube, Instagram, Facebook } from 'lucide-react';

/**
 * Lucide has no official TikTok glyph, so it's hand-drawn here to match
 * the stroke weight (1.5px round-join) of the surrounding lucide icons.
 */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15.5 3v9.6a3.3 3.3 0 1 1-2.6-3.23" />
      <path d="M15.5 3c.4 2.2 2 3.9 4.3 4.2" />
      <path d="M19.8 7.2v3.1c-1.5.1-2.9-.3-4.3-1.2" />
    </svg>
  );
}

const PLATFORMS = [
  { key: 'youtube', label: 'YouTube', Icon: Youtube, tint: 'text-[#FF3B30]' },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon, tint: 'text-text-primary' },
  { key: 'instagram', label: 'Instagram', Icon: Instagram, tint: 'text-[#E1306C]' },
  { key: 'facebook', label: 'Facebook', Icon: Facebook, tint: 'text-[#1877F2]' },
] as const;

export default function PlatformIcons({
  activePlatform,
  selectedPlatform,
  onSelect,
}: {
  activePlatform?: string | null;
  /** User's own optional pick — purely a UI hint, never required. */
  selectedPlatform?: string | null;
  onSelect?: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 justify-items-center gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
      {PLATFORMS.map(({ key, label, Icon, tint }) => {
        // Auto-detected (from the pasted/resolved link) takes priority visually;
        // a manual click is just a soft hint and never blocks anything.
        const isActive = activePlatform ? activePlatform === key : selectedPlatform === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect?.(key)}
            aria-pressed={isActive}
            className={[
              'flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 sm:w-auto sm:justify-start',
              'cursor-pointer hover:border-signal/40 hover:text-text-primary',
              isActive
                ? 'border-signal/60 bg-signal/10 shadow-signal scale-105'
                : 'border-hairline bg-surface/60 text-text-muted',
            ].join(' ')}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-signal' : tint}`} />
            <span className={isActive ? 'text-text-primary' : ''}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
