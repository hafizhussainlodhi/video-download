'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, History as HistoryIcon, RefreshCw, X } from 'lucide-react';
import { fetchHistory } from '@/lib/api';
import type { HistoryItem } from '@/lib/types';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'text-[#FF3B30]',
  tiktok: 'text-text-primary',
  instagram: 'text-[#E1306C]',
  facebook: 'text-[#1877F2]',
  unknown: 'text-text-faint',
};

export default function HistoryTable({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load hidden elements from localstorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vda_hidden_history');
      if (stored) {
        setHiddenIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error parsing hidden history keys', e);
    }
  }, []);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchHistory(targetPage, 8);
      setItems(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, refreshKey, load]);

  // Hide action: DB se nahi but UI se forever remove
  const handleHideItem = (id: string) => {
    const updatedHidden = [...hiddenIds, id];
    setHiddenIds(updatedHidden);
    localStorage.setItem('vda_hidden_history', JSON.stringify(updatedHidden));
  };

  // Filter items that aren't locally hidden
  const visibleItems = items.filter(item => !hiddenIds.includes(item._id));

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-hairline bg-surface/60">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
          <HistoryIcon className="h-3.5 w-3.5" />
          Recent pulls
        </div>
        <button
          onClick={() => load(page)}
          className="flex items-center gap-1 text-xs text-text-faint transition-colors hover:text-signal"
          aria-label="Refresh history"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMsg && (
        <div className="px-5 py-6 text-center text-xs text-danger">{errorMsg}</div>
      )}

      {!errorMsg && !loading && visibleItems.length === 0 && (
        <div className="px-5 py-10 text-center text-xs text-text-faint">
          Nothing pulled yet — paste a link above to get started.
        </div>
      )}

      {!errorMsg && visibleItems.length > 0 && (
        <div className="divide-y divide-hairline font-mono text-xs">
          {visibleItems.map((item) => (
            <div key={item._id} className="group/row flex items-center gap-2 px-3 py-2.5 hover:bg-surface/30 transition-colors sm:gap-3 sm:px-5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  item.status === 'success' ? 'bg-success' : 'bg-danger'
                }`}
                title={item.status}
              />
              <span className={`w-12 shrink-0 uppercase text-[10px] sm:w-16 sm:text-xs ${PLATFORM_COLORS[item.platform] || 'text-text-faint'}`}>
                {item.platform}
              </span>
              <span className="min-w-0 flex-1 truncate text-text-primary text-[11px] sm:text-xs">
                {item.title || item.originalUrl}
              </span>
              <span className="shrink-0 text-[10px] text-text-faint sm:text-xs mr-1">{timeAgo(item.createdAt)}</span>
              
              {/* Sleek hide action trigger - Visible on mobile, hover triggered on desktop */}
              <button
                onClick={() => handleHideItem(item._id)}
                className="opacity-100 sm:opacity-0 sm:group-hover/row:opacity-100 p-1 rounded-md text-text-faint hover:text-danger hover:bg-surface/50 transition-all"
                title="Hide from recent history list"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-hairline px-4 py-2.5 text-xs text-text-faint sm:px-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 disabled:opacity-30"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}