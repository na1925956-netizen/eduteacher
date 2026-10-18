import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, CheckCircle2, FileCode2, ImagePlus, Link2, Loader2, Trash2, Upload, X, AlertCircle, Files } from 'lucide-react';
import { comicCategories } from '../../data/comics';
import {
  assessmentCategories,
  feedbackCategories,
  gameCategories,
  grades,
  materialCategories,
  nationalCategories,
  subjects,
} from '../../data/library';
import { sections } from '../../data/sections';
import type { SectionId } from '../../data/types';
import { acceptFor, DOCUMENT_EXTS, extInfo, extOf, formatSize, IMAGE_EXTS, MAX_FILE_SIZE, validateUrl, type FileExt } from '../../lib/files';
import { checkEmbeddable, saveMaterial, type CoverEntry, type FileEntry, type MaterialInput } from '../../services/admin';
import { fileUrl, type Material, type MaterialKind } from '../../services/materials';

interface SectionConfig {
  kinds: MaterialKind[];
  categories: string[];
  /** Category must come from the list (used for the comics filter) */
  strictCategory?: boolean;
  categoryRequired?: boolean;
  showSubject?: boolean;
  showTerm?: boolean;
  exts: FileExt[];
  fileHint: string;
}

const CONFIG: Record<SectionId, SectionConfig> = {
  national: { kinds: ['link', 'files'], categories: nationalCategories, exts: DOCUMENT_EXTS, fileHint: 'Word, PowerPoint, PDF, Excel, суреттер' },
  comics: {
    kinds: ['link', 'files'],
    categories: comicCategories,
    strictCategory: true,
    categoryRequired: true,
    exts: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
    fileHint: 'PDF кітап немесе беттердің суреттері (ретімен парақталады)',
  },
  feedback: { kinds: ['link', 'files'], categories: feedbackCategories, exts: DOCUMENT_EXTS, fileHint: 'Word, PowerPoint, PDF, суреттер' },
  games: { kinds: ['link', 'html', 'files'], categories: gameCategories, exts: DOCUMENT_EXTS, fileHint: 'Word, PowerPoint, PDF, суреттер' },
  materials: { kinds: ['files', 'link'], categories: materialCategories, categoryRequired: true, showSubject: true, exts: DOCUMENT_EXTS, fileHint: 'ҚМЖ, слайд, жұмыс парағы — Word, PowerPoint, PDF, Excel, суреттер' },
  assessment: {
    kinds: ['files', 'link'],
    categories: assessmentCategories,
    categoryRequired: true,
    showSubject: true,
    showTerm: true,
    exts: DOCUMENT_EXTS,
    fileHint: 'БЖБ, ТЖБ, тест, критерийлер — Word, PowerPoint, PDF, Excel, суреттер',
  },
};

const KIND_LABEL: Record<MaterialKind, { label: string; icon: typeof Files }> = {
  files: { label: 'Файл жүктеу', icon: Files },
  link: { label: 'Сілтеме', icon: Link2 },
  html: { label: 'HTML ойын', icon: FileCode2 },
};

type EmbedCheck = { state: 'idle' } | { state: 'checking' } | { state: 'done'; embeddable: boolean; verified: boolean };

function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

interface Props {
  material?: Material;
  defaultSection?: SectionId;
  onClose: () => void;
  onSaved: (m: Material, isNew: boolean) => void;
}

export default function MaterialForm({ material, defaultSection, onClose, onSaved }: Props) {
  const uid = useId();
  const [section, setSection] = useState<SectionId>(material?.section ?? defaultSection ?? 'materials');
  const cfg = CONFIG[section];
  const [kind, setKind] = useState<MaterialKind>(material?.kind ?? cfg.kinds[0]);
  const [title, setTitle] = useState(material?.title ?? '');
  const [description, setDescription] = useState(material?.description ?? '');
  const [grade, setGrade] = useState(material?.grade ? String(material.grade) : '');
  const [subject, setSubject] = useState(material?.subject ?? '');
  const [category, setCategory] = useState(material?.category ?? '');
  const [term, setTerm] = useState(material?.term ? String(material.term) : '');
  const [linkUrl, setLinkUrl] = useState(material?.link_url ?? '');
  const [embeddable, setEmbeddable] = useState(material?.embeddable ?? false);
  const [embedCheck, setEmbedCheck] = useState<EmbedCheck>({ state: 'idle' });
  const [published, setPublished] = useState(material?.published ?? true);
  const [entries, setEntries] = useState<FileEntry[]>(() => (material?.files ?? []).map((f) => ({ key: f.path, existing: f })));
  const [cover, setCover] = useState<CoverEntry>(material?.cover_path ? { existing: material.cover_path } : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const dirty = useRef(false);

  // Keep the chosen kind valid for the section
  useEffect(() => {
    if (!cfg.kinds.includes(kind)) setKind(cfg.kinds[0]);
    if (cfg.strictCategory && category && !cfg.categories.includes(category)) setCategory('');
  }, [section]);

  // Close on Escape, lock page scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && requestClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  });

  const coverPreview = useMemo(() => {
    if (!cover) return null;
    return 'file' in cover ? URL.createObjectURL(cover.file) : fileUrl(cover.existing);
  }, [cover]);
  useEffect(() => () => void (coverPreview?.startsWith('blob:') && URL.revokeObjectURL(coverPreview)), [coverPreview]);

  const touch = () => (dirty.current = true);

  function requestClose() {
    if (saving) return;
    if (dirty.current && !window.confirm('Сақталмаған өзгерістер жойылады. Терезені жабу керек пе?')) return;
    onClose();
  }

  /* ---------- Files ---------- */

  const allowedExts: FileExt[] = kind === 'html' ? ['html'] : cfg.exts;

  function addFiles(list: FileList | File[]) {
    touch();
    const rejected: string[] = [];
    const accepted: FileEntry[] = [];
    Array.from(list).forEach((file) => {
      const ext = extOf(file.name);
      if (!ext || !allowedExts.includes(ext)) rejected.push(`«${file.name}» — бұл түрге рұқсат жоқ`);
      else if (file.size > MAX_FILE_SIZE) rejected.push(`«${file.name}» — 50 МБ-тан үлкен`);
      else accepted.push({ key: crypto.randomUUID(), file });
    });
    setEntries((prev) => (kind === 'html' ? accepted.slice(0, 1) : [...prev, ...accepted]));
    setErrors((e) => ({ ...e, files: rejected.join('; ') }));
  }

  const move = (i: number, d: number) =>
    setEntries((prev) => {
      const next = [...prev];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      touch();
      return next;
    });

  const remove = (key: string) => {
    touch();
    setEntries((prev) => prev.filter((e) => e.key !== key));
  };

  function pickCover(file?: File) {
    if (!file) return;
    const ext = extOf(file.name);
    if (!ext || !(IMAGE_EXTS as string[]).includes(ext)) return setErrors((e) => ({ ...e, cover: 'Мұқаба JPG, PNG немесе WEBP болуы керек' }));
    if (file.size > 10 * 1024 * 1024) return setErrors((e) => ({ ...e, cover: 'Мұқаба 10 МБ-тан аспауы керек' }));
    touch();
    setErrors((e) => ({ ...e, cover: '' }));
    setCover({ file });
  }

  /* ---------- Link check ---------- */

  async function verifyLink() {
    const err = validateUrl(linkUrl);
    setErrors((e) => ({ ...e, link: err ?? '' }));
    if (err) return;
    setEmbedCheck({ state: 'checking' });
    const res = await checkEmbeddable(linkUrl.trim());
    setEmbeddable(res.embeddable);
    setEmbedCheck({ state: 'done', ...res });
  }

  /* ---------- Submit ---------- */

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Материал атауын жазыңыз';
    if (cfg.categoryRequired && !category.trim()) e.category = 'Категорияны таңдаңыз';
    if (kind === 'link') {
      const err = validateUrl(linkUrl);
      if (err) e.link = err;
    }
    // Entries of another kind stay in state while switching tabs but are ignored for links
    const files = entries.filter((en) => {
      const ext = 'existing' in en ? en.existing.ext : extOf(en.file.name);
      return kind === 'html' ? ext === 'html' : ext !== 'html';
    });
    if (kind === 'files' && files.length === 0) e.files = 'Кемінде бір файл қосыңыз';
    if (kind === 'html' && files.length !== 1) e.files = 'Бір HTML файлын таңдаңыз';
    setErrors(e);
    return Object.values(e).every((v) => !v);
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaveError(null);
    if (!validate()) return;

    const keepEntries =
      kind === 'link'
        ? []
        : entries.filter((en) => {
            const ext = 'existing' in en ? en.existing.ext : extOf(en.file.name);
            return kind === 'html' ? ext === 'html' : ext !== 'html';
          });

    const input: MaterialInput = {
      section,
      title: title.trim(),
      description: description.trim(),
      grade: grade ? Number(grade) : null,
      subject: cfg.showSubject && subject.trim() ? subject.trim() : null,
      category: category.trim() || null,
      term: cfg.showTerm && term ? Number(term) : null,
      kind,
      link_url: kind === 'link' ? linkUrl.trim() : null,
      embeddable: kind === 'link' ? embeddable : false,
      published,
    };

    try {
      setSaving('Сақталуда…');
      const saved = await saveMaterial({ previous: material, input, entries: keepEntries, cover, onProgress: setSaving });
      onSaved(saved, !material);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Белгісіз қате');
    } finally {
      setSaving(null);
    }
  }

  const visibleEntries = entries.filter((en) => {
    const ext = 'existing' in en ? en.existing.ext : extOf(en.file.name);
    return kind === 'html' ? ext === 'html' : ext !== 'html';
  });

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] flex items-stretch justify-center bg-brand-950/40 backdrop-blur-sm sm:items-start sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(e) => e.target === e.currentTarget && requestClose()}
    >
      <motion.form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 id={`${uid}-title`} className="text-xl font-extrabold">
            {material ? 'Материалды өңдеу' : 'Жаңа материал қосу'}
          </h2>
          <button type="button" onClick={requestClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Жабу">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {/* 1. Section */}
          <Field label="1. Бөлімді таңдаңыз">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    touch();
                    setSection(s.id);
                  }}
                  aria-pressed={section === s.id}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                    section === s.id ? 'border-brand-600 bg-brand-50 text-brand-800 ring-1 ring-brand-600' : 'border-slate-200 text-slate-600 hover:border-brand-200'
                  }`}
                >
                  <s.icon className={`h-5 w-5 shrink-0 ${s.theme.icon}`} aria-hidden />
                  <span className="leading-tight">{s.title}</span>
                </button>
              ))}
            </div>
          </Field>

          {/* 2. Basic info */}
          <Field label="2. Материал атауы" htmlFor={`${uid}-t`} error={errors.title}>
            <input
              id={`${uid}-t`}
              value={title}
              maxLength={200}
              onChange={(e) => {
                touch();
                setTitle(e.target.value);
              }}
              className="field"
              placeholder="Мысалы: Жай бөлшектер — ҚМЖ"
            />
          </Field>

          <Field label="Қысқаша сипаттамасы" htmlFor={`${uid}-d`} hint="Міндетті емес, 2000 таңбаға дейін">
            <textarea
              id={`${uid}-d`}
              value={description}
              maxLength={2000}
              rows={3}
              onChange={(e) => {
                touch();
                setDescription(e.target.value);
              }}
              className="field resize-y"
              placeholder="Материал не туралы, қай сабаққа арналған?"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Категориясы" htmlFor={`${uid}-c`} error={errors.category} hint={cfg.strictCategory ? undefined : 'Тізімнен таңдаңыз немесе өзіңіз жазыңыз'}>
              {cfg.strictCategory ? (
                <select id={`${uid}-c`} value={category} onChange={(e) => (touch(), setCategory(e.target.value))} className="field">
                  <option value="">— таңдаңыз —</option>
                  {cfg.categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input id={`${uid}-c`} list={`${uid}-cl`} value={category} maxLength={100} onChange={(e) => (touch(), setCategory(e.target.value))} className="field" />
                  <datalist id={`${uid}-cl`}>
                    {cfg.categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>
            <Field label="Сыныбы" htmlFor={`${uid}-g`} hint="Қажет болса">
              <select id={`${uid}-g`} value={grade} onChange={(e) => (touch(), setGrade(e.target.value))} className="field">
                <option value="">Көрсетілмеген</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}-сынып
                  </option>
                ))}
              </select>
            </Field>
            {cfg.showSubject && (
              <Field label="Пәні" htmlFor={`${uid}-s`} hint="Тізімде жоқ пәнді өзіңіз жаза аласыз">
                <input id={`${uid}-s`} list={`${uid}-sl`} value={subject} maxLength={100} onChange={(e) => (touch(), setSubject(e.target.value))} className="field" />
                <datalist id={`${uid}-sl`}>
                  {subjects.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
            )}
            {cfg.showTerm && (
              <Field label="Тоқсан" htmlFor={`${uid}-q`}>
                <select id={`${uid}-q`} value={term} onChange={(e) => (touch(), setTerm(e.target.value))} className="field">
                  <option value="">Көрсетілмеген</option>
                  {[1, 2, 3, 4].map((t) => (
                    <option key={t} value={t}>
                      {t}-тоқсан
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          {/* 3. Material type */}
          <Field label="3. Материал түрі">
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {cfg.kinds.map((k) => {
                const K = KIND_LABEL[k];
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={kind === k}
                    onClick={() => {
                      touch();
                      setKind(k);
                      setErrors({});
                    }}
                    className={kind === k ? 'chip-on' : 'chip-off'}
                  >
                    <K.icon className="h-4 w-4" aria-hidden /> {K.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {kind === 'link' && (
            <Field label="Сілтеме (URL)" htmlFor={`${uid}-u`} error={errors.link}>
              <div className="flex gap-2">
                <input
                  id={`${uid}-u`}
                  type="url"
                  inputMode="url"
                  value={linkUrl}
                  onChange={(e) => {
                    touch();
                    setLinkUrl(e.target.value);
                    setEmbedCheck({ state: 'idle' });
                  }}
                  onBlur={() => linkUrl.trim() && verifyLink()}
                  className="field"
                  placeholder="https://heyzine.com/flip-book/…"
                />
                <button type="button" onClick={verifyLink} className="btn-ghost shrink-0">
                  Тексеру
                </button>
              </div>
              {embedCheck.state === 'checking' && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Сайт тексерілуде…
                </p>
              )}
              {embedCheck.state === 'done' && (
                <p className={`mt-2 flex items-start gap-1.5 text-xs ${embedCheck.embeddable ? 'text-emerald-700' : 'text-amber-700'}`}>
                  <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                  {embedCheck.embeddable
                    ? 'Сілтеме дұрыс. Бұл сайтты EduTeacher ішінде көрсетуге болады.'
                    : 'Сілтеме дұрыс. Бұл сайт басқа сайттың ішінде ашылуға рұқсат бермейді — «Ашу» батырмасы жаңа қойындыда ашады.'}
                  {!embedCheck.verified && ' (белгілі сайттар тізімі бойынша анықталды)'}
                </p>
              )}
              <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={embeddable} onChange={(e) => (touch(), setEmbeddable(e.target.checked))} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
                Сайт ішінде қарауға рұқсат (iframe)
              </label>
            </Field>
          )}

          {kind !== 'link' && (
            <Field
              label={kind === 'html' ? 'HTML ойын файлы' : 'Файлдар'}
              error={errors.files}
              hint={
                kind === 'html'
                  ? 'Бір .html файлы (барлық код бір файлдың ішінде). Ойын сайттан оқшауланған қауіпсіз терезеде іске қосылады.'
                  : `${cfg.fileHint}. Бір материалға бірнеше файл қосуға болады, әр файл 50 МБ-қа дейін.`
              }
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-7 text-center transition ${
                  dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <Upload className="h-8 w-8 text-brand-500" aria-hidden />
                <p className="mt-2 text-sm text-slate-600">
                  Файлдарды осында сүйреңіз немесе{' '}
                  <button type="button" onClick={() => fileInput.current?.click()} className="font-semibold text-brand-700 underline">
                    құрылғыдан таңдаңыз
                  </button>
                </p>
                <p className="mt-1 text-xs text-slate-400">{allowedExts.map((e) => `.${e}`).join(' ')}</p>
                <input
                  ref={fileInput}
                  type="file"
                  className="sr-only"
                  tabIndex={-1}
                  multiple={kind !== 'html'}
                  accept={acceptFor(allowedExts)}
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              {visibleEntries.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {visibleEntries.map((en, i) => {
                    const name = 'existing' in en ? en.existing.name : en.file.name;
                    const size = 'existing' in en ? en.existing.size : en.file.size;
                    const info = extInfo(('existing' in en ? en.existing.ext : extOf(name)) ?? '');
                    return (
                      <li key={en.key} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${info.badge}`}>
                          <info.icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800">{name}</span>
                          <span className="text-xs text-slate-400">
                            {info.label} · {formatSize(size)} {'existing' in en ? '· сақталған' : '· жаңа'}
                          </span>
                        </span>
                        {visibleEntries.length > 1 && (
                          <span className="flex">
                            <button type="button" onClick={() => move(entries.indexOf(en), -1)} disabled={i === 0} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30" aria-label="Жоғары жылжыту">
                              <ArrowUp className="h-4 w-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(entries.indexOf(en), 1)}
                              disabled={i === visibleEntries.length - 1}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                              aria-label="Төмен жылжыту"
                            >
                              <ArrowDown className="h-4 w-4" aria-hidden />
                            </button>
                          </span>
                        )}
                        <button type="button" onClick={() => remove(en.key)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Өшіру: ${name}`}>
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Field>
          )}

          {/* 4. Cover */}
          <Field label="4. Мұқаба суреті" error={errors.cover} hint="Міндетті емес. Болмаса, материалдағы алғашқы сурет немесе бөлім белгішесі көрсетіледі.">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {coverPreview ? <img src={coverPreview} alt="Мұқаба" className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-slate-300" aria-hidden />}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => coverInput.current?.click()} className="btn-ghost">
                  <ImagePlus className="h-4 w-4" aria-hidden /> {cover ? 'Ауыстыру' : 'Сурет таңдау'}
                </button>
                {cover && (
                  <button type="button" onClick={() => (touch(), setCover(null))} className="btn-ghost text-red-600">
                    <Trash2 className="h-4 w-4" aria-hidden /> Өшіру
                  </button>
                )}
              </div>
              <input
                ref={coverInput}
                type="file"
                className="sr-only"
                tabIndex={-1}
                accept={acceptFor(IMAGE_EXTS)}
                onChange={(e) => {
                  pickCover(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
          </Field>

          <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={published} onChange={(e) => (touch(), setPublished(e.target.checked))} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
            Сайтта бірден көрсету (белгіні алып тастасаңыз, материал жасырын сақталады)
          </label>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          {saveError && (
            <p className="mb-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {saveError}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            {saving && (
              <span className="mr-auto flex items-center gap-2 text-sm text-slate-500" role="status">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {saving}
              </span>
            )}
            <button type="button" onClick={requestClose} disabled={Boolean(saving)} className="btn-ghost">
              Бас тарту
            </button>
            <button type="submit" disabled={Boolean(saving)} className="btn-primary min-w-[8rem]">
              {material ? 'Сақтау' : published ? 'Жариялау' : 'Сақтау'}
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>,
    document.body,
  );
}
