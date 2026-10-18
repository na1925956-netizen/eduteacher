import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, Maximize2 } from 'lucide-react';
import { extInfo, formatSize } from '../lib/files';
import { fileUrl, type StoredFile } from '../services/materials';
import { ErrorState } from './ui';

/* ---------- Iframe with loading state and "open original" fallback ---------- */

interface EmbedFrameProps {
  src?: string;
  srcDoc?: string;
  title: string;
  /** Link offered when loading takes too long */
  fallbackUrl?: string;
  sandbox?: string;
  className?: string;
}

export function EmbedFrame({ src, srcDoc, title, fallbackUrl, sandbox, className = '' }: EmbedFrameProps) {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(false);
    setSlow(false);
    const t = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(t);
  }, [src, srcDoc]);

  return (
    <div ref={wrap} className={`relative overflow-hidden rounded-3xl bg-slate-900 shadow-lift ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500" role="status">
          <Loader2 className="h-9 w-9 animate-spin text-brand-500" aria-hidden />
          <span>Жүктелуде…</span>
          {slow && fallbackUrl && (
            <p className="max-w-sm px-4 text-center text-sm">
              Жүктелу ұзаққа созылып тұр.{' '}
              <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline">
                Түпнұсқаны жаңа қойындыда ашыңыз
              </a>
              .
            </p>
          )}
        </div>
      )}
      <iframe
        key={src ?? 'doc'}
        src={src}
        srcDoc={srcDoc}
        title={title}
        sandbox={sandbox}
        className="h-full w-full border-0 bg-white"
        allow="fullscreen; autoplay"
        allowFullScreen
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export function useFullscreen() {
  const ref = useRef<HTMLDivElement>(null);
  const enter = useCallback(() => {
    ref.current?.requestFullscreen?.().catch(() => undefined);
  }, []);
  return { ref, enter, supported: typeof document !== 'undefined' && document.fullscreenEnabled };
}

export function FullscreenButton({ onClick }: { onClick: () => void }) {
  if (!document.fullscreenEnabled) return null;
  return (
    <button type="button" onClick={onClick} className="btn-ghost" aria-label="Толық экран">
      <Maximize2 className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Толық экран</span>
    </button>
  );
}

/* ---------- Sandboxed HTML game ---------- */

/**
 * Uploaded HTML runs in an iframe with a sandbox WITHOUT allow-same-origin, so it gets an opaque
 * origin: it cannot read this site's storage (incl. the admin session), cookies or DOM.
 * The file itself is hosted on the Supabase Storage domain, never on the site's own domain.
 */
export function HtmlSandbox({ file, title }: { file: StoredFile; title: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    setFailed(false);
    fetch(fileUrl(file.path))
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((t) => alive && setHtml(t))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [file.path, attempt]);

  if (failed) return <ErrorState message="Ойын файлын жүктеу мүмкін болмады." onRetry={() => setAttempt((a) => a + 1)} />;
  if (html === null)
    return (
      <div className="flex h-full items-center justify-center rounded-3xl bg-slate-50" role="status">
        <Loader2 className="h-9 w-9 animate-spin text-brand-500" aria-hidden />
      </div>
    );
  return (
    <EmbedFrame
      srcDoc={html}
      title={title}
      sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock allow-popups"
      className="h-full"
    />
  );
}

/* ---------- Image gallery / page-by-page comic viewer ---------- */

export function ImageGallery({ images, title }: { images: StoredFile[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      setDir(delta);
      setIndex((i) => Math.min(Math.max(i + delta, 0), count - 1));
    },
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // Preload neighbours for instant page turns
  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      if (images[i]) new Image().src = fileUrl(images[i].path);
    });
  }, [index, images]);

  const current = images[index];
  if (!current) return null;

  return (
    <div className="flex h-full flex-col gap-3">
      <div
        className="relative flex-1 overflow-hidden rounded-3xl bg-slate-100 shadow-lift"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={current.path}
            src={fileUrl(current.path)}
            alt={`${title} — ${index + 1}-бет`}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
        </AnimatePresence>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow-md transition hover:bg-white disabled:opacity-0"
              aria-label="Алдыңғы бет"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index === count - 1}
              className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow-md transition hover:bg-white disabled:opacity-0"
              aria-label="Келесі бет"
            >
              <ChevronRight className="h-6 w-6" aria-hidden />
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-950/70 px-3 py-1 text-sm font-medium text-white" aria-live="polite">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Беттер">
          {images.map((img, i) => (
            <button
              key={img.path}
              type="button"
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === index ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'}`}
              aria-label={`${i + 1}-бет`}
              aria-current={i === index}
            >
              <img src={fileUrl(img.path)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Download button / menu for one or many files ---------- */

export function DownloadMenu({ files, compact = false }: { files: StoredFile[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (files.length === 0) return null;
  const label = compact ? 'Жүктеу' : files.length > 1 ? `Жүктеу (${files.length})` : 'Жүктеу';

  if (files.length === 1) {
    const f = files[0];
    return (
      <a href={fileUrl(f.path, f.name)} download={f.name} className="btn-primary" aria-label={`Жүктеу: ${f.name}`}>
        <Download className="h-4 w-4" aria-hidden /> {label}
      </a>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="btn-primary w-full" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu">
        <Download className="h-4 w-4" aria-hidden /> {label} <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
      {open && (
        <ul role="menu" className="absolute bottom-[calc(100%+6px)] right-0 z-30 max-h-72 w-72 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lift sm:bottom-auto sm:top-[calc(100%+6px)]">
          {files.map((f) => {
            const info = extInfo(f.ext);
            return (
              <li key={f.path} role="none">
                <a
                  role="menuitem"
                  href={fileUrl(f.path, f.name)}
                  download={f.name}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-brand-50"
                  onClick={() => setOpen(false)}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${info.badge}`}>
                    <info.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-800">{f.name}</span>
                    <span className="text-xs text-slate-400">
                      {info.label} · {formatSize(f.size)}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function OpenOriginal({ url, label = 'Түпнұсқаны ашу' }: { url: string; label?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary">
      {label} <ExternalLink className="h-4 w-4" aria-hidden />
    </a>
  );
}
