'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, Clipboard, Link2, Loader2 } from 'lucide-react';

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'unknown';

function detectPlatformClientSide(url: string): Platform {
  if (!url) return 'unknown';
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  return 'unknown';
}

export default function UrlInputForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState('');
  const [pasteError, setPasteError] = useState(false);

  const detected = useMemo(() => detectPlatformClientSide(value), [value]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }

  async function handlePaste() {
    // Clipboard API sirf secure context (https, ya localhost) me kaam karti
    // hai, aur kuch mobile browsers permission bhi maang sakte hain — agar
    // fail ho to chup nahi rehte, chhota sa error hint dikhate hain taake
    // user ko pata chale manually paste karna hoga.
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setValue(text.trim());
        setPasteError(false);
      }
    } catch {
      setPasteError(true);
      setTimeout(() => setPasteError(false), 2500);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div
        className={[
          'group flex items-center gap-1.5 rounded-2xl border bg-surface/80 p-2 pl-4 backdrop-blur-sm transition-all duration-300 sm:gap-2',
          detected !== 'unknown'
            ? 'border-signal/50 shadow-signal'
            : 'border-hairline focus-within:border-signal/40',
        ].join(' ')}
      >
        <Link2 className="h-4 w-4 shrink-0 text-text-faint" />
        <input
          type="url"
          inputMode="url"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste a TikTok, YouTube, Instagram, or Facebook link…"
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-text-primary placeholder:text-text-faint placeholder:font-body focus:outline-none"
          aria-label="Video URL"
        />
        <button
          type="button"
          onClick={handlePaste}
          title="Paste from clipboard"
          aria-label="Paste from clipboard"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-hairline bg-surface-raised/60 px-2.5 py-2.5 text-xs font-medium text-text-muted transition-colors hover:border-signal/40 hover:text-text-primary sm:px-3"
        >
          <Clipboard className="h-4 w-4" />
          <span className="hidden sm:inline">Paste</span>
        </button>
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-ink transition-all hover:bg-signal-dim disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Pulling…</span>
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4" />
              <span className="hidden sm:inline">Pull</span>
            </>
          )}
        </button>
      </div>
      <p className="mt-2.5 pl-1 text-xs text-text-faint">
        {pasteError
          ? "Couldn't access clipboard — paste the link manually instead."
          : 'HD, no watermark. We never store the video file — only the link and its metadata.'}
      </p>
    </form>
  );
}
