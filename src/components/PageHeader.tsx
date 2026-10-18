import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { Section } from '../data/types';
import { publicPath } from '../lib/paths';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | EduTeacher`;
  }, [title]);
}

interface PageHeaderProps {
  section?: Section;
  title: string;
  tagline?: string;
  description: string;
  image?: string;
  bg?: string;
  children?: ReactNode;
}

export default function PageHeader({ section, title, tagline, description, image, bg, children }: PageHeaderProps) {
  usePageTitle(title);
  const img = image ?? section?.image;
  return (
    <section className="container-page pt-5 sm:pt-8">
      <div className={`relative overflow-hidden rounded-4xl px-5 py-8 shadow-soft sm:px-10 sm:py-10 ${bg ?? section?.theme.bg ?? 'bg-gradient-to-br from-brand-50 to-sky-100'}`}>
        <nav aria-label="Навигация жолы" className="mb-4 flex items-center gap-1 text-sm text-slate-500">
          <Link to="/" className="rounded hover:text-brand-700">
            Басты бет
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="font-medium text-slate-700" aria-current="page">
            {title}
          </span>
        </nav>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              {title}
              {tagline && <span className="mt-1 block text-xl font-bold text-brand-600 sm:text-2xl lg:text-[1.75rem]">{tagline}</span>}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
            {children && <div className="mt-5">{children}</div>}
          </motion.div>
          {img && (
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              src={publicPath(img)}
              alt=""
              className="fade-edges hidden h-36 w-auto max-w-[40%] object-contain md:block lg:h-44"
            />
          )}
        </div>
      </div>
    </section>
  );
}
