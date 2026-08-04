'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import UrlInputForm from '@/components/UrlInputForm';
import PlatformIcons from '@/components/PlatformIcons';
import LoadingState from '@/components/LoadingState';
import SuccessCard from '@/components/SuccessCard';
// import HistoryTable from '@/components/HistoryTable';
import { resolveVideo } from '@/lib/api';
import type { ResolveResponse } from '@/lib/types';

type ViewState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [result, setResult] = useState<ResolveResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  // Purely optional: user click kare to bas visual hint hai, kuch bhi
  // required/blocked nahi hai — na click kare to sab kuch normal chalta hai.
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    setViewState('loading');
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await resolveVideo(url);
      setResult(data);
      setViewState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setViewState('error');
    } finally {
      // Refresh the history table regardless of outcome
      setHistoryRefreshKey((k) => k + 1);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-16 sm:py-24">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-hairline bg-surface/60 px-3 py-1 text-[11px] font-medium tracking-wide text-text-muted">
          NO SIGN-UP · NO WATERMARK · HD
        </span>

        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-text-primary sm:text-5xl">
          Paste a link.
          <br />
          <span className="text-signal">Pull</span> the video.
        </h1>

        <p className="max-w-md text-sm text-text-muted">
          Works with TikTok, YouTube, Instagram, and Facebook links. We fetch the original
          file straight from the source — no watermark added, no quality lost.
        </p>

        <PlatformIcons
          activePlatform={viewState === 'success' || viewState === 'loading' ? result?.platform : undefined}
          selectedPlatform={selectedPlatform}
          onSelect={(key) => setSelectedPlatform((prev) => (prev === key ? null : key))}
        />

        <UrlInputForm onSubmit={handleSubmit} isLoading={viewState === 'loading'} />
      </div>

      <div className="mt-10 flex w-full flex-col items-center gap-4">
        {viewState === 'loading' && <LoadingState />}

        {viewState === 'error' && errorMsg && (
          <div className="flex w-full max-w-2xl items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger animate-fadeUp">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {viewState === 'success' && result && <SuccessCard data={result} />}
      </div>

      {/* <div className="mt-16 w-full flex justify-center">
        <HistoryTable refreshKey={historyRefreshKey} />
      </div> */}

      <footer className="mt-10 text-center text-[11px] text-text-faint">
        Only download content you have the right to use. Respect creators and platform terms.
      </footer>
    </main>
  );
}
