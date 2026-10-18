import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, CornerDownLeft, Search, X } from 'lucide-react';
import { loadPublishedMaterials } from '../services/materials';
import { buildStaticIndex, materialsToEntries, searchEntries, type SearchEntry } from '../lib/search';
import { publicPath } from '../lib/paths';

const staticIndex = buildStaticIndex();
const suggestions = ['Абай', 'Ертегі', 'Ұлттық', 'Викторина', 'Математика', 'Кері байланыс'];

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [libraryEntries, setLibraryEntries] = useState<SearchEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    loadPublishedMaterials()
      .then((items) => setLibraryEntries(materialsToEntries(items)))
      .catch(() => setLibraryEntries([]));
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const results = useMemo(() => searchEntries([...staticIndex, ...libraryEntries], query), [query, libraryEntries]);

  useEffect(() => setActive(0), [query]);

  const choose = (e: SearchEntry) => {
    onClose();
    if (e.to) navigate(e.to);
    else if (e.href) window.open(publicPath(e.href), '_blank', 'noopener,noreferrer');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      choose(results[active]);
    }
  };

  useEffect(() => {
    document.getElementById(`search-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-brand-950/40 px-3 pt-[8vh] backdrop-blur-sm sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Сайт бойынша іздеу"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 sm:px-5">
              <Search className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Комикс, ойын, материал, құрал іздеу…"
                className="h-16 w-full bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-activedescendant={results.length ? `search-opt-${active}` : undefined}
                aria-autocomplete="list"
              />
              <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Іздеуді жабу">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="overflow-y-auto p-2 sm:p-3">
              {!query.trim() && (
                <div className="p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Жиі ізделетіндер</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button key={s} type="button" className="chip-off" onClick={() => setQuery(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() && results.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-slate-500">
                  «{query}» бойынша ештеңе табылмады. Басқа сөзбен іздеп көріңіз.
                </p>
              )}

              <ul id="search-results" role="listbox" aria-label="Іздеу нәтижелері">
                {results.map((r, i) => {
                  const showGroup = r.group !== lastGroup;
                  lastGroup = r.group;
                  return (
                    <li key={r.id} role="presentation">
                      {showGroup && <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{r.group}</p>}
                      <button
                        id={`search-opt-${i}`}
                        role="option"
                        aria-selected={i === active}
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => choose(r)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === active ? 'bg-brand-50' : ''}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-brand-950">{r.title}</span>
                          <span className="block truncate text-sm text-slate-500">{r.subtitle}</span>
                        </span>
                        {r.href ? (
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" aria-label="Жаңа қойындыда ашылады" />
                        ) : (
                          i === active && <CornerDownLeft className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="hidden items-center gap-4 border-t border-slate-100 px-5 py-2.5 text-xs text-slate-400 sm:flex">
              <span>↑ ↓ — таңдау</span>
              <span>Enter — ашу</span>
              <span>Esc — жабу</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
