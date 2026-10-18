import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardCheck, FolderOpen, Search, X } from 'lucide-react';
import { grades, subjects as baseSubjects } from '../data/library';
import { sectionById } from '../data/sections';
import { normalize } from '../lib/search';
import { useMaterials, type Material } from '../services/materials';
import MaterialCard, { materialMeta } from './MaterialCard';
import { EmptyState, ErrorState, LoadingState, StaggerGrid } from './ui';

const FORMAT_GROUPS: Record<string, string[]> = {
  word: ['doc', 'docx'],
  powerpoint: ['ppt', 'pptx'],
  pdf: ['pdf'],
  excel: ['xls', 'xlsx'],
  image: ['jpg', 'jpeg', 'png', 'webp'],
};

function matchesFormat(m: Material, format: string): boolean {
  if (!format) return true;
  if (format === 'link') return m.kind === 'link';
  const exts = FORMAT_GROUPS[format] ?? [];
  return m.files.some((f) => exts.includes(f.ext));
}

interface LibraryViewProps {
  section: 'materials' | 'assessment';
  categories: string[];
  /** Show the term (тоқсан) filter */
  withTerm?: boolean;
}

export default function LibraryView({ section, categories, withTerm }: LibraryViewProps) {
  const state = useMaterials(section);
  const theme = sectionById(section).theme;
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const grade = params.get('grade') ?? '';
  const subject = params.get('subject') ?? '';
  const category = params.get('type') ?? '';
  const format = params.get('format') ?? '';
  const term = params.get('term') ?? '';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const items = useMemo(() => (state.status === 'ready' ? state.items : []), [state]);

  // Configured subjects/categories + any new ones the admin has used
  const subjects = useMemo(
    () => Array.from(new Set([...baseSubjects, ...items.map((i) => i.subject).filter((s): s is string => Boolean(s))])),
    [items],
  );
  const allCategories = useMemo(
    () => Array.from(new Set([...categories, ...items.map((i) => i.category).filter((s): s is string => Boolean(s))])),
    [categories, items],
  );

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return items.filter(
      (i) =>
        (!grade || i.grade === Number(grade)) &&
        (!subject || i.subject === subject) &&
        (!category || i.category === category) &&
        matchesFormat(i, format) &&
        (!term || i.term === Number(term)) &&
        (!nq || normalize(`${i.title} ${i.description} ${materialMeta(i).join(' ')} ${i.files.map((f) => f.name).join(' ')}`).includes(nq)),
    );
  }, [items, q, grade, subject, category, format, term]);

  const hasFilters = Boolean(q || grade || subject || category || format || term);
  const Icon = section === 'assessment' ? ClipboardCheck : FolderOpen;

  return (
    <section className="container-page mt-8">
      <div className="rounded-3xl bg-white p-4 shadow-soft sm:p-5">
        <div className={`grid gap-3 sm:grid-cols-2 ${withTerm ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          <label className="relative block sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Материал іздеу</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input type="search" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Атауы бойынша іздеу…" className="field pl-10" />
          </label>
          <label>
            <span className="sr-only">Сынып</span>
            <select value={grade} onChange={(e) => set('grade', e.target.value)} className="field">
              <option value="">Барлық сыныптар</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}-сынып
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Пән</span>
            <select value={subject} onChange={(e) => set('subject', e.target.value)} className="field">
              <option value="">Барлық пәндер</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Файл түрі</span>
            <select value={format} onChange={(e) => set('format', e.target.value)} className="field">
              <option value="">Барлық форматтар</option>
              <option value="word">Word (.doc, .docx)</option>
              <option value="powerpoint">PowerPoint (.ppt, .pptx)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="excel">Excel (.xls, .xlsx)</option>
              <option value="image">Сурет (.jpg, .png, .webp)</option>
              <option value="link">Сілтеме</option>
            </select>
          </label>
          {withTerm && (
            <label>
              <span className="sr-only">Тоқсан</span>
              <select value={term} onChange={(e) => set('term', e.target.value)} className="field">
                <option value="">Барлық тоқсандар</option>
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>
                    {t}-тоқсан
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Материал түрі">
          {['', ...allCategories].map((c) => (
            <button key={c || 'all'} type="button" onClick={() => set('type', c)} className={category === c ? 'chip-on' : 'chip-off'} aria-pressed={category === c}>
              {c || 'Барлығы'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {state.status === 'loading' && <LoadingState label="Материалдар жүктелуде…" />}
        {state.status === 'error' && <ErrorState onRetry={state.retry} />}
        {state.status === 'ready' && items.length === 0 && (
          <EmptyState title="Материалдар жақын арада қосылады">
            Бұл бөлімге файлдар әлі жарияланбаған. Жаңа материалдар қосылғанда осы жерде пайда болады.
          </EmptyState>
        )}
        {state.status === 'ready' && items.length > 0 && filtered.length === 0 && (
          <EmptyState
            title="Сүзгіге сәйкес материал табылмады"
            action={
              hasFilters && (
                <button type="button" className="btn-ghost" onClick={() => setParams({}, { replace: true })}>
                  <X className="h-4 w-4" aria-hidden /> Сүзгіні тазалау
                </button>
              )
            }
          >
            Басқа сынып, пән немесе материал түрін таңдап көріңіз.
          </EmptyState>
        )}
        {filtered.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-500" aria-live="polite">
              Табылды: <strong className="text-slate-700">{filtered.length}</strong> материал
            </p>
            <StaggerGrid key={filtered.length} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => (
                <MaterialCard key={m.id} material={m} theme={theme} placeholderIcon={<Icon className="h-10 w-10 text-brand-600" aria-hidden />} />
              ))}
            </StaggerGrid>
          </>
        )}
      </div>
    </section>
  );
}
