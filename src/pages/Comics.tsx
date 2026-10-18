import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, BookOpenText, ExternalLink, Search, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { EmptyState, fadeUp, SmartImage, StaggerGrid } from '../components/ui';
import { comicCategories, comics } from '../data/comics';
import { sectionById } from '../data/sections';
import { normalize } from '../lib/search';
import { coverOf, useMaterials } from '../services/materials';
import { RemoteStatus } from './ResourcePages';

/** Built-in Heyzine comics and admin-published comics share one card. */
interface ComicItem {
  key: string;
  title: string;
  category: string;
  cover?: string;
  /** In-site reader route */
  readTo: string;
  /** Original page opened in a new tab */
  externalUrl?: string;
  createdAt: string;
}

const coverGradients: Record<string, string> = {
  Ертегілер: 'from-pink-300 to-rose-400',
  'Абай шығармалары': 'from-sky-300 to-brand-500',
  'Тарихи мұралар': 'from-amber-200 to-orange-400',
  'Әдеби шығармалар': 'from-violet-300 to-purple-500',
  'Математикалық комикстер': 'from-emerald-200 to-teal-500',
};

function ComicCard({ comic }: { comic: ComicItem }) {
  const fallback = (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br p-4 text-center text-white ${coverGradients[comic.category] ?? 'from-sky-300 to-brand-500'}`}>
      <BookOpenText className="h-12 w-12 opacity-90" aria-hidden />
      <span className="font-display text-lg font-extrabold leading-tight drop-shadow-sm">{comic.title}</span>
    </div>
  );
  return (
    <motion.article variants={fadeUp} className="group flex flex-col">
      <Link
        to={comic.readTo}
        className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 shadow-soft ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift"
        aria-label={`«${comic.title}» комиксін оқу`}
      >
        <SmartImage src={comic.cover} alt="" className="h-full w-full object-cover" fallback={fallback} />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-pink-600">{comic.category}</span>
        <h3 className="mt-0.5 font-sans text-base font-bold leading-snug text-brand-950">{comic.title}</h3>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <Link to={comic.readTo} className="btn-primary flex-1 py-2">
            <BookOpen className="h-4 w-4" aria-hidden /> Оқу
          </Link>
          {comic.externalUrl && (
            <a
              href={comic.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-3 py-2"
              aria-label={`«${comic.title}» кітабын түпнұсқа сайтта ашу`}
              title="Кітапты жаңа қойындыда ашу"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function ComicsPage() {
  const section = sectionById('comics');
  const remote = useMaterials('comics');
  const [params, setParams] = useSearchParams();
  const category = params.get('cat') ?? 'Барлығы';
  const query = params.get('q') ?? '';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'Барлығы') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const all = useMemo<ComicItem[]>(() => {
    const published = remote.status === 'ready' ? remote.items : [];
    return [
      ...published.map((m) => ({
        key: m.id,
        title: m.title,
        category: m.category ?? 'Басқа',
        cover: coverOf(m),
        readTo: `/view/${m.id}`,
        externalUrl: m.kind === 'link' ? (m.link_url ?? undefined) : undefined,
        createdAt: m.created_at,
      })),
      ...comics.map((c) => ({ key: c.id, title: c.title, category: c.category, cover: c.cover, readTo: `/comics/${c.id}`, externalUrl: c.url, createdAt: '' })),
    ];
  }, [remote]);

  const categories = useMemo(() => {
    const extra = all.map((c) => c.category).filter((c) => !(comicCategories as string[]).includes(c));
    return ['Барлығы', ...comicCategories, ...new Set(extra)];
  }, [all]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return all.filter((c) => (category === 'Барлығы' || c.category === category) && (!q || normalize(`${c.title} ${c.category}`).includes(q)));
  }, [all, category, query]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { Барлығы: all.length };
    all.forEach((c) => (m[c.category] = (m[c.category] ?? 0) + 1));
    return m;
  }, [all]);

  return (
    <>
      <PageHeader
        section={section}
        title="Комикстер әлемі"
        tagline="Оқы, таны, үйрен!"
        description="Ертегілер, Абай мұрасы, тарихи ескерткіштер және математикалық есептер — сабаққа арналған цифрлық комикстер кітапханасы."
      />

      <section className="container-page mt-8">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-soft sm:p-5">
          <label className="relative block">
            <span className="sr-only">Комикс іздеу</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Комикс атауы бойынша іздеу…"
              className="field pl-11"
            />
          </label>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Категориялар">
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => update('cat', cat)} className={category === cat ? 'chip-on' : 'chip-off'} aria-pressed={category === cat}>
                {cat}
                <span className={`rounded-full px-1.5 text-xs ${category === cat ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>{counts[cat] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-500" aria-live="polite">
          Табылды: <strong className="text-slate-700">{filtered.length}</strong> комикс
        </p>

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Комикс табылмады"
              action={
                <button type="button" className="btn-ghost" onClick={() => setParams({}, { replace: true })}>
                  <X className="h-4 w-4" aria-hidden /> Сүзгіні тазалау
                </button>
              }
            >
              Іздеу сөзін өзгертіп немесе басқа категорияны таңдап көріңіз.
            </EmptyState>
          </div>
        ) : (
          <StaggerGrid key={`${category}|${query}|${all.length}`} className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((c) => (
              <ComicCard key={c.key} comic={c} />
            ))}
          </StaggerGrid>
        )}
        <RemoteStatus state={remote} />
      </section>
    </>
  );
}
