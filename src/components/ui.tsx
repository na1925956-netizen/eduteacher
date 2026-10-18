import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ImageOff, Inbox, Loader2, RotateCw } from 'lucide-react';
import { publicPath } from '../lib/paths';

/* ---------- Motion presets (MotionConfig in App respects prefers-reduced-motion) ---------- */

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- Image with lazy loading, skeleton and graceful fallback ---------- */

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  eager?: boolean;
}

export function SmartImage({ src, alt, className = '', fallback, eager }: SmartImageProps) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(src ? 'loading' : 'error');

  if (!src || state === 'error') {
    return (
      <>
        {fallback ?? (
          <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
            <ImageOff className="h-8 w-8" aria-hidden />
          </div>
        )}
      </>
    );
  }

  return (
    <img
      src={publicPath(src)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setState('ok')}
      onError={() => setState('error')}
      className={`${className} transition-opacity duration-500 ${state === 'ok' ? 'opacity-100' : 'animate-pulse bg-slate-100 opacity-60'}`}
    />
  );
}

/* ---------- Loading / empty / error states ---------- */

export function LoadingState({ label = 'Жүктелуде…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Inbox className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      {children && <div className="mt-2 text-sm leading-relaxed text-slate-500">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div role="alert" className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-red-100 bg-red-50/70 px-6 py-12 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-500" aria-hidden />
      <h3 className="text-lg font-bold text-red-900">Деректерді жүктеу мүмкін болмады</h3>
      <p className="mt-1 text-sm text-red-700/80">{message ?? 'Интернет байланысын тексеріп, қайталап көріңіз.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost mt-5">
          <RotateCw className="h-4 w-4" aria-hidden /> Қайталау
        </button>
      )}
    </div>
  );
}

/* ---------- External link (always safe) ---------- */

export function ExternalA(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
}
