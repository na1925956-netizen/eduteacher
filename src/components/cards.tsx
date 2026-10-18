import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import type { DigitalTool, Section, SectionTheme, WebResource } from '../data/types';
import { hostOf, publicPath } from '../lib/paths';
import { fadeUp, SmartImage } from './ui';

/* ---------- Home page section card ---------- */

export function SectionCard({ section }: { section: Section }) {
  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link
        to={section.path}
        className={`group relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-3xl px-5 pb-5 pt-4 shadow-soft ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:px-6 ${section.theme.bg}`}
      >
        <div className="flex h-[96px] items-end justify-center">
          <img
            src={publicPath(section.image)}
            alt=""
            loading="lazy"
            decoding="async"
            className="fade-edges h-full w-auto max-w-[78%] object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="mt-2 flex flex-1 flex-col justify-end">
          <h3 className="text-[1.3rem] font-extrabold leading-tight tracking-tight sm:text-[1.35rem] 2xl:text-[1.375rem]">{section.title}</h3>
          <div className="flex items-center gap-4">
            <p className="mt-1 min-w-0 flex-1 text-[0.95rem] leading-snug text-slate-600">{section.description}</p>
            <span
              className={`-mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform duration-300 group-hover:translate-x-1 ${section.theme.button}`}
              aria-hidden
            >
              <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ---------- Digital tool card (logo, name, description, URL) ---------- */

export function ToolLogo({ tool, size = 'md' }: { tool: DigitalTool; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-14 w-14 text-xl';
  const fallback = (
    <span className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 font-display font-extrabold text-white ${box}`} aria-hidden>
      {tool.name.charAt(0)}
    </span>
  );
  return tool.logo ? <SmartImage src={tool.logo} alt="" className={`${box} object-contain`} fallback={fallback} /> : fallback;
}

export function ToolCard({ tool }: { tool: DigitalTool }) {
  return (
    <motion.a
      variants={fadeUp}
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col items-center rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-100 hover:shadow-lift"
    >
      <ToolLogo tool={tool} />
      <h3 className="mt-2 font-sans text-lg font-bold text-brand-950">{tool.name}</h3>
      <p className="mt-1 flex-1 text-[0.8rem] leading-snug text-slate-600">{tool.description}</p>
      <span className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[0.8rem] text-brand-700 transition-colors group-hover:bg-brand-50">
        <span className="truncate">https://{hostOf(tool.url)}</span>
        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
      </span>
      <span className="sr-only">(жаңа қойындыда ашылады)</span>
    </motion.a>
  );
}

/* ---------- Interactive resource card (national values, feedback, games) ---------- */

interface ResourceCardProps {
  resource: WebResource;
  theme: SectionTheme;
  actionLabel: string;
  placeholderIcon: ReactNode;
  index: number;
}

export function ResourceCard({ resource, theme, actionLabel, placeholderIcon, index }: ResourceCardProps) {
  const placeholder = (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 ${theme.bg}`}>
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/70 shadow-sm backdrop-blur">{placeholderIcon}</span>
      <span className="font-display text-sm font-bold text-brand-900/60">№ {index + 1}</span>
    </div>
  );

  return (
    <motion.article
      variants={fadeUp}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-50">
        <SmartImage
          src={resource.image}
          alt={`«${resource.title}» алдын ала көрінісі`}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          fallback={placeholder}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {resource.tags && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {resource.tags.map((t) => (
              <span key={t} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${theme.accent}`}>
                {t}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-sans text-lg font-bold leading-snug text-brand-950">{resource.title}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{resource.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="truncate text-xs text-slate-400">{resource.kind === 'html' ? 'EduTeacher' : hostOf(resource.url)}</span>
          <a
            href={publicPath(resource.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary shrink-0"
            aria-label={`${actionLabel}: ${resource.title} (жаңа қойындыда)`}
          >
            {actionLabel} <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
