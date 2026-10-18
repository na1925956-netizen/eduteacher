import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ExternalLink, Gamepad2 } from 'lucide-react';
import type { SectionTheme } from '../data/types';
import { extInfo, isImage } from '../lib/files';
import { hostOf } from '../lib/paths';
import { coverOf, type Material } from '../services/materials';
import { fadeUp, SmartImage } from './ui';
import { DownloadMenu } from './viewers';

export function materialMeta(m: Material): string[] {
  return [
    m.category,
    m.subject,
    m.grade ? `${m.grade}-сынып` : null,
    m.term ? `${m.term}-тоқсан` : null,
  ].filter((x): x is string => Boolean(x));
}

/** Unique format labels for the badges row */
function formatBadges(m: Material): { label: string; badge: string }[] {
  if (m.kind === 'link') return [{ label: 'Сілтеме', badge: 'bg-sky-100 text-sky-700' }];
  if (m.kind === 'html') return [{ label: 'HTML ойын', badge: extInfo('html').badge }];
  const seen = new Map<string, string>();
  m.files.forEach((f) => {
    const i = extInfo(f.ext);
    if (!seen.has(i.label)) seen.set(i.label, i.badge);
  });
  return [...seen].map(([label, badge]) => ({ label, badge }));
}

interface MaterialCardProps {
  material: Material;
  theme: SectionTheme;
  placeholderIcon: ReactNode;
  /** Label of the main action for links / games, e.g. «Ойынды бастау» */
  openLabel?: string;
}

export default function MaterialCard({ material: m, theme, placeholderIcon, openLabel = 'Ашу' }: MaterialCardProps) {
  const viewTo = `/view/${m.id}`;
  const onlyImages = m.files.length > 0 && m.files.every((f) => isImage(f.ext));
  const downloadable = m.files.filter((f) => f.ext !== 'html');
  const meta = materialMeta(m);

  const placeholder = (
    <div className={`flex h-full w-full items-center justify-center ${theme.bg}`}>
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/70 shadow-sm backdrop-blur">{placeholderIcon}</span>
    </div>
  );

  return (
    <motion.article
      variants={fadeUp}
      // No overflow-hidden here so the download menu can extend past the card; focus-within lifts it above neighbours
      className="group relative flex h-full flex-col rounded-3xl border border-slate-100 bg-white shadow-soft transition-all duration-300 focus-within:z-20 hover:-translate-y-1 hover:shadow-lift"
    >
      <Link to={viewTo} className="relative block aspect-[16/9] overflow-hidden rounded-t-3xl bg-slate-50" tabIndex={-1} aria-hidden>
        <SmartImage
          src={coverOf(m)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          fallback={placeholder}
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {meta.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {meta.map((t) => (
              <span key={t} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${theme.accent}`}>
                {t}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-sans text-lg font-bold leading-snug text-brand-950">{m.title}</h3>
        {m.description && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-600">{m.description}</p>}
        <div className="mt-3 flex flex-1 flex-wrap content-end gap-1.5">
          {formatBadges(m).map((b) => (
            <span key={b.label} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${b.badge}`}>
              {b.label}
            </span>
          ))}
          {m.kind === 'link' && m.link_url && <span className="truncate px-1 text-xs text-slate-400">{hostOf(m.link_url)}</span>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {m.kind === 'link' && m.link_url && (
            <>
              {m.embeddable ? (
                <Link to={viewTo} className="btn-soft">
                  <Eye className="h-4 w-4" aria-hidden /> Қарау
                </Link>
              ) : (
                <span />
              )}
              <a href={m.link_url} target="_blank" rel="noopener noreferrer" className="btn-primary" aria-label={`${openLabel}: ${m.title} (жаңа қойындыда)`}>
                {openLabel} <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </>
          )}
          {m.kind === 'html' && (
            <Link to={viewTo} className="btn-primary col-span-2">
              <Gamepad2 className="h-4 w-4" aria-hidden /> {openLabel}
            </Link>
          )}
          {m.kind === 'files' && (
            <>
              <Link to={viewTo} className={`btn-soft ${downloadable.length === 0 ? 'col-span-2' : ''}`}>
                <Eye className="h-4 w-4" aria-hidden /> {onlyImages && m.files.length > 1 ? 'Парақтау' : 'Қарау'}
              </Link>
              <DownloadMenu files={downloadable} compact />
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
