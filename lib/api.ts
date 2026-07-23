import type { ResolveResponse, HistoryResponse } from './types';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://184.73.52.160:8000';

export async function resolveVideo(url: string): Promise<ResolveResponse> {
  const res = await fetch(`${API_URL}/api/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const data = (await res.json()) as ResolveResponse;

  if (!res.ok) {
    throw new Error(data.error || 'Failed to resolve video.');
  }

  return data;
}

export function buildStreamUrl(params: {
  url: string;
  formatId: string;
  title: string;
  ext: string;
}): string {
  const search = new URLSearchParams({
    url: params.url,
    formatId: params.formatId,
    title: params.title,
    ext: params.ext,
  });
  return `${API_URL}/api/stream?${search.toString()}`;
}

export async function fetchHistory(page = 1, limit = 8): Promise<HistoryResponse> {
  const res = await fetch(`${API_URL}/api/history?page=${page}&limit=${limit}`, {
    cache: 'no-store',
  });

  const data = (await res.json()) as HistoryResponse;

  if (!res.ok) {
    throw new Error(data.error || 'Failed to load history.');
  }

  return data;
}
