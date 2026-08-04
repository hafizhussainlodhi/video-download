// 'use client';

// import { useState } from 'react';
// import { Download, Clock, User, CheckCircle2, Music, Check, AlertTriangle } from 'lucide-react';
// import type { ResolveResponse, VideoFormat } from '@/lib/types';
// import { buildStreamUrl } from '@/lib/api';

// function formatDuration(seconds?: number | null): string {
//   if (!seconds || seconds <= 0) return '—';
//   const m = Math.floor(seconds / 60);
//   const s = Math.floor(seconds % 60);
//   return `${m}:${s.toString().padStart(2, '0')}`;
// }

// function formatSize(bytes?: number | null): string {
//   if (!bytes) return 'unknown size';
//   const mb = bytes / (1024 * 1024);
//   return mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
// }

// type DownloadStatus = 'starting' | 'downloading' | 'done' | 'error';

// interface DownloadState {
//   status: DownloadStatus;
//   /** 0-100 when the server tells us the file size, otherwise undefined (unknown length). */
//   progress?: number;
// }

// export default function SuccessCard({ data }: { data: ResolveResponse }) {
//   // Har format apni alag download state rakhta hai (formatId => state), taake
//   // ek se zyada quality ek sath download ho to bhi confuse na ho.
//   const [downloads, setDownloads] = useState<Record<string, DownloadState>>({});
//   const formats = data.formats || [];

//   function clearAfterDelay(id: string, delay: number) {
//     setTimeout(() => {
//       setDownloads((prev) => {
//         const next = { ...prev };
//         delete next[id];
//         return next;
//       });
//     }, delay);
//   }

//   async function handleDownload(format: VideoFormat) {
//     if (!data.sourceUrl) return;
//     const id = format.formatId;

//     setDownloads((prev) => ({ ...prev, [id]: { status: 'starting' } }));

//     const streamUrl = buildStreamUrl({
//       url: data.sourceUrl,
//       formatId: format.formatId,
//       title: data.title || 'video',
//       ext: format.ext,
//     });

//     try {
//       const res = await fetch(streamUrl);
//       if (!res.ok || !res.body) {
//         throw new Error(`Server responded with ${res.status}`);
//       }

//       // Server ne file ka size bataya hai to hum sahi % dikha sakte hain,
//       // warna bas "Downloading…" (indeterminate) dikhayenge.
//       const totalHeader = res.headers.get('Content-Length');
//       const total = totalHeader ? parseInt(totalHeader, 10) : 0;
//       let received = 0;

//       const reader = res.body.getReader();
//       const chunks: Uint8Array[] = [];

//       setDownloads((prev) => ({
//         ...prev,
//         [id]: { status: 'downloading', progress: total ? 0 : undefined },
//       }));

//       // eslint-disable-next-line no-constant-condition
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         if (value) {
//           chunks.push(value);
//           received += value.length;
//           setDownloads((prev) => ({
//             ...prev,
//             [id]: {
//               status: 'downloading',
//               progress: total ? Math.min(99, Math.round((received / total) * 100)) : undefined,
//             },
//           }));
//         }
//       }

//       // Poori file mil chuki hai — ab hi actual "save" trigger karte hain.
//       const blob = new Blob(chunks as BlobPart[]);
//       const objectUrl = URL.createObjectURL(blob);
//       const safeName = `${String(data.title || 'video')
//         .replace(/[\\/:*?"<>|]/g, '')
//         .trim()
//         .slice(0, 80) || 'video'}.${format.ext}`;

//       const link = document.createElement('a');
//       link.href = objectUrl;
//       link.download = safeName;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(objectUrl);

//       setDownloads((prev) => ({ ...prev, [id]: { status: 'done', progress: 100 } }));
//       clearAfterDelay(id, 2200);
//     } catch {
//       setDownloads((prev) => ({ ...prev, [id]: { status: 'error' } }));
//       clearAfterDelay(id, 3000);
//     }
//   }

//   return (
//     <div className="w-full max-w-2xl animate-fadeUp overflow-hidden rounded-2xl border border-hairline bg-surface/70 backdrop-blur-sm">
//       <div className="flex items-center gap-1.5 border-b border-hairline bg-success/5 px-4 py-2.5 text-xs font-medium text-success sm:px-5">
//         <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
//         <span className="truncate">Video found — pick a quality to download</span>
//       </div>

//       <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={data.thumbnail || 'https://placehold.co/320x180/131B2E/29D3C0?text=No+preview'}
//           alt={data.title || 'Video thumbnail'}
//           className="h-40 w-full shrink-0 rounded-xl border border-hairline object-cover sm:w-52"
//         />

//         <div className="flex min-w-0 flex-1 flex-col gap-2">
//           <h2 className="line-clamp-2 font-display text-sm font-semibold text-text-primary sm:text-base">
//             {data.title}
//           </h2>
//           <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
//             {data.author && (
//               <span className="flex items-center gap-1">
//                 <User className="h-3 w-3" /> {data.author}
//               </span>
//             )}
//             <span className="flex items-center gap-1">
//               <Clock className="h-3 w-3" /> {formatDuration(data.durationSeconds)}
//             </span>
//           </div>

//           <div className="mt-2 flex flex-col gap-2">
//             {formats.map((format) => {
//               const state = downloads[format.formatId];
//               const isBusy = state?.status === 'starting' || state?.status === 'downloading';

//               let label = 'Download';
//               let Icon = Download;
//               if (state?.status === 'starting') {
//                 label = 'Starting…';
//               } else if (state?.status === 'downloading') {
//                 label = state.progress != null ? `Downloading ${state.progress}%` : 'Downloading…';
//               } else if (state?.status === 'done') {
//                 label = 'Downloaded';
//                 Icon = Check;
//               } else if (state?.status === 'error') {
//                 label = 'Failed — retry';
//                 Icon = AlertTriangle;
//               }

//               return (
//                 <div
//                   key={format.formatId}
//                   className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-raised/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-3 sm:py-2"
//                 >
//                   <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
//                     {format.hasVideo ? (
//                       <span className="font-mono font-medium text-text-primary">{format.quality}</span>
//                     ) : (
//                       <span className="flex items-center gap-1 font-mono font-medium text-text-primary">
//                         <Music className="h-3.5 w-3.5" /> Audio only
//                       </span>
//                     )}
//                     <span className="uppercase text-text-faint">{format.ext}</span>
//                     <span className="text-text-faint">· {formatSize(format.filesizeApproxBytes)}</span>
//                   </div>
//                   <button
//                     onClick={() => handleDownload(format)}
//                     disabled={isBusy}
//                     className={[
//                       'flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed sm:w-auto sm:min-w-[7.5rem] sm:py-1.5',
//                       state?.status === 'error'
//                         ? 'bg-danger/15 text-danger hover:bg-danger/25'
//                         : state?.status === 'done'
//                         ? 'bg-success/20 text-success'
//                         : 'bg-signal text-ink hover:bg-signal-dim disabled:opacity-70',
//                     ].join(' ')}
//                   >
//                     <Icon className="h-3.5 w-3.5" />
//                     {label}
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import { Download, Clock, User, CheckCircle2, Music, Check, AlertTriangle } from 'lucide-react';
import type { ResolveResponse, VideoFormat } from '@/lib/types';
import { buildStreamUrl } from '@/lib/api';

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes?: number | null): string {
  if (!bytes) return 'unknown size';
  const mb = bytes / (1024 * 1024);
  return mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
}

type DownloadStatus = 'starting' | 'downloading' | 'done' | 'error';

interface DownloadState {
  status: DownloadStatus;
  /** 0-100 when the server tells us the file size, otherwise undefined (unknown length). */
  progress?: number;
}

export default function SuccessCard({
  data,
  onDownloaded,
}: {
  data: ResolveResponse;
  onDownloaded?: () => void;
}) {
  // Har format apni alag download state rakhta hai (formatId => state), taake
  // ek se zyada quality ek sath download ho to bhi confuse na ho.
  const [downloads, setDownloads] = useState<Record<string, DownloadState>>({});
  const formats = data.formats || [];

  function clearAfterDelay(id: string, delay: number) {
    setTimeout(() => {
      setDownloads((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, delay);
  }

  async function handleDownload(format: VideoFormat) {
    if (!data.sourceUrl) return;
    const id = format.formatId;

    setDownloads((prev) => ({ ...prev, [id]: { status: 'starting' } }));

    const streamUrl = buildStreamUrl({
      url: data.sourceUrl,
      formatId: format.formatId,
      title: data.title || 'video',
      ext: format.ext,
    });

    try {
      const res = await fetch(streamUrl);
      if (!res.ok || !res.body) {
        throw new Error(`Server responded with ${res.status}`);
      }

      // Server ne file ka size bataya hai to hum sahi % dikha sakte hain,
      // warna bas "Downloading…" (indeterminate) dikhayenge.
      const totalHeader = res.headers.get('Content-Length');
      const total = totalHeader ? parseInt(totalHeader, 10) : 0;
      let received = 0;

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];

      setDownloads((prev) => ({
        ...prev,
        [id]: { status: 'downloading', progress: total ? 0 : undefined },
      }));

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          setDownloads((prev) => ({
            ...prev,
            [id]: {
              status: 'downloading',
              progress: total ? Math.min(99, Math.round((received / total) * 100)) : undefined,
            },
          }));
        }
      }

      // Poori file mil chuki hai — ab hi actual "save" trigger karte hain.
      const contentType = res.headers.get('Content-Type') || (format.hasVideo ? 'video/mp4' : 'audio/mpeg');
      const blob = new Blob(chunks as BlobPart[], { type: contentType });

      // Filename backend ke Content-Disposition header se lete hain — wahi
      // decide karta hai container mkv hai ya original ext (jaise mp4),
      // is liye hum yahan dobara guess nahi karte. Pehle yahan hum apne
      // taraf se hamesha `format.ext` (jaise "mp4") laga dete the, jabke
      // high-res formats jinhe merge chahiye hota hai unka asal container
      // mkv hota hai — is mismatch ki wajah se Windows Media Player
      // "Can't play" bol raha tha.
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const safeName =
        match?.[1] ||
        `${String(data.title || 'video')
          .replace(/[\\/:*?"<>|]/g, '')
          .trim()
          .slice(0, 80) || 'video'}.${format.formatId.includes('+') ? 'mkv' : format.ext}`;

      // iOS Safari me `<a download>` blob trick video ko sirf "Files" app me
      // (ya kabhi naya tab me) daalta hai — Photos/gallery me kabhi nahi
      // jaata, kyunki iOS webpage ko seedha Camera Roll me likhne ki ijazat
      // nahi deta. Iska asli tareeqa native share sheet hai, jisme "Save
      // Video" option Photos me save karta hai. Isliye video formats ke liye
      // pehle Web Share API try karte hain (sirf iOS jahan file-share support
      // hoti hai); Android/desktop pe purana anchor-download tareeqa hi
      // theek se gallery/downloads me ja raha tha, wahi wahan rakha hai.
      const isIOS =
        /iP(hone|od|ad)/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const file = new File([blob], safeName, { type: contentType });
      const canUseShareSheet =
        format.hasVideo &&
        isIOS &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      if (canUseShareSheet) {
        try {
          await navigator.share({ files: [file], title: safeName });
        } catch (shareErr) {
          // User ne share sheet cancel kiya to ye error nahi hai, chup rahenge.
          if ((shareErr as DOMException)?.name !== 'AbortError') {
            throw shareErr;
          }
        }
      } else {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = safeName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }

      setDownloads((prev) => ({ ...prev, [id]: { status: 'done', progress: 100 } }));
      setTimeout(() => onDownloaded?.(), 400);
      clearAfterDelay(id, 2200);
    } catch {
      setDownloads((prev) => ({ ...prev, [id]: { status: 'error' } }));
      clearAfterDelay(id, 3000);
    }
  }

  return (
    <div className="w-full max-w-2xl animate-fadeUp overflow-hidden rounded-2xl border border-hairline bg-surface/70 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 border-b border-hairline bg-success/5 px-5 py-2.5 text-xs font-medium text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Video found — pick a quality to download
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.thumbnail || 'https://placehold.co/320x180/131B2E/29D3C0?text=No+preview'}
          alt={data.title || 'Video thumbnail'}
          className="h-40 w-full shrink-0 rounded-xl border border-hairline object-cover sm:w-52"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="line-clamp-2 font-display text-base font-semibold text-text-primary">
            {data.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            {data.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {data.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDuration(data.durationSeconds)}
            </span>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            {formats.map((format) => {
              const state = downloads[format.formatId];
              const isBusy = state?.status === 'starting' || state?.status === 'downloading';

              let label = 'Download';
              let Icon = Download;
              if (state?.status === 'starting') {
                label = 'Starting…';
              } else if (state?.status === 'downloading') {
                label = state.progress != null ? `Downloading ${state.progress}%` : 'Downloading…';
              } else if (state?.status === 'done') {
                label = 'Downloaded';
                Icon = Check;
              } else if (state?.status === 'error') {
                label = 'Failed — retry';
                Icon = AlertTriangle;
              }

              return (
                <div
                  key={format.formatId}
                  className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-raised/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-3 sm:py-2"
                >
                  <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                    {format.hasVideo ? (
                      <span className="font-mono font-medium text-text-primary">{format.quality}</span>
                    ) : (
                      <span className="flex items-center gap-1 font-mono font-medium text-text-primary">
                        <Music className="h-3.5 w-3.5" /> Audio only
                      </span>
                    )}
                    <span className="uppercase text-text-faint">{format.ext}</span>
                    <span className="text-text-faint">· {formatSize(format.filesizeApproxBytes)}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(format)}
                    disabled={isBusy}
                    className={[
                      'flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed sm:w-auto sm:min-w-[7.5rem] sm:py-1.5',
                      state?.status === 'error'
                        ? 'bg-danger/15 text-danger hover:bg-danger/25'
                        : state?.status === 'done'
                        ? 'bg-success/20 text-success'
                        : 'bg-signal text-ink hover:bg-signal-dim disabled:opacity-70',
                    ].join(' ')}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
