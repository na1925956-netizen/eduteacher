import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Eye, EyeOff, LogIn, LogOut, Pencil, Plus, Search, ShieldAlert, ShieldCheck, Trash2, Wrench, ExternalLink } from 'lucide-react';
import { sections, sectionById } from '../data/sections';
import type { SectionId } from '../data/types';
import { isSupabaseConfigured } from '../lib/supabase';
import { normalize } from '../lib/search';
import { useAuth } from '../services/auth';
import { coverOf, loadAllMaterialsForAdmin, type Material } from '../services/materials';
import { deleteMaterial, setPublished } from '../services/admin';
import { materialMeta } from '../components/MaterialCard';
import MaterialForm from '../components/admin/MaterialForm';
import { EmptyState, ErrorState, LoadingState, SmartImage } from '../components/ui';
import { usePageTitle } from '../components/PageHeader';

function Card({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-soft sm:p-8">{children}</div>;
}

function SetupNotice() {
  return (
    <Card>
      <Wrench className="h-10 w-10 text-brand-500" aria-hidden />
      <h1 className="mt-3 text-2xl font-extrabold">Әкімші панелі әлі бапталмаған</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Материалдарды жариялау үшін сайтқа Supabase жобасын қосу керек. Толық нұсқаулық жобаның <strong>README.md</strong> файлындағы
        «Әкімші панелін баптау» бөлімінде.
      </p>
    </Card>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(await signIn(email, password));
    setBusy(false);
  };

  return (
    <Card>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <ShieldCheck className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold">Әкімші кіруі</h1>
      <p className="mt-1 text-sm text-slate-500">Материалдарды жариялау тек сайт әкімшісіне қолжетімді. Мұғалімдерге тіркелу қажет емес.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Құпиясөз</span>
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
        </label>
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3">
          <LogIn className="h-4 w-4" aria-hidden /> {busy ? 'Кіруде…' : 'Кіру'}
        </button>
      </form>
    </Card>
  );
}

function NotAdmin() {
  const { session, signOut } = useAuth();
  return (
    <Card>
      <ShieldAlert className="h-10 w-10 text-amber-500" aria-hidden />
      <h1 className="mt-3 text-2xl font-extrabold">Әкімші құқығы жоқ</h1>
      <p className="mt-2 text-sm text-slate-600">
        <strong>{session?.user.email}</strong> аккаунты әкімшілер тізімінде жоқ. Supabase-та осы пайдаланушыны <code>admins</code> кестесіне қосыңыз.
      </p>
      <button type="button" onClick={signOut} className="btn-ghost mt-5">
        <LogOut className="h-4 w-4" aria-hidden /> Шығу
      </button>
    </Card>
  );
}

const KIND_LABEL = { files: 'Файл', link: 'Сілтеме', html: 'HTML ойын' } as const;

function Dashboard() {
  const { session, signOut } = useAuth();
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'ready'; items: Material[] }>({ status: 'loading' });
  const [filter, setFilter] = useState<SectionId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Material | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);

  const reload = useCallback(() => {
    setState((s) => (s.status === 'ready' ? s : { status: 'loading' }));
    loadAllMaterialsForAdmin()
      .then((items) => setState({ status: 'ready', items }))
      .catch(() => setState({ status: 'error' }));
  }, []);

  useEffect(reload, [reload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const items = state.status === 'ready' ? state.items : [];
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((m) => (c[m.section] = (c[m.section] ?? 0) + 1));
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = normalize(query);
    return items.filter((m) => (filter === 'all' || m.section === filter) && (!q || normalize(`${m.title} ${m.description} ${m.category ?? ''}`).includes(q)));
  }, [items, filter, query]);

  const togglePublished = async (m: Material) => {
    setBusyId(m.id);
    try {
      await setPublished(m.id, !m.published);
      setToast({ text: m.published ? 'Материал жасырылды' : 'Материал жарияланды', tone: 'ok' });
      reload();
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : 'Қате', tone: 'err' });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (m: Material) => {
    setBusyId(m.id);
    try {
      const leftover = await deleteMaterial(m);
      setToast(
        leftover
          ? { text: `«${m.title}» жойылды, бірақ ${leftover} файл Storage-та қалды — schema.sql-дегі Storage саясаттарын тексеріңіз`, tone: 'err' }
          : { text: `«${m.title}» жойылды`, tone: 'ok' },
      );
      setConfirmDelete(null);
      reload();
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : 'Қате', tone: 'err' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container-page pt-6 sm:pt-8">
      <div className="flex flex-col gap-4 rounded-4xl bg-gradient-to-br from-brand-50 to-sky-100 p-5 shadow-soft sm:flex-row sm:items-center sm:p-8">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Әкімші панелі</h1>
          <p className="mt-1 text-sm text-slate-600">
            {session?.user.email} ·{' '}
            <button type="button" onClick={signOut} className="font-medium text-brand-700 underline">
              Шығу
            </button>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="btn-primary px-6 py-4 text-base shadow-lg shadow-brand-600/25"
        >
          <Plus className="h-5 w-5" aria-hidden strokeWidth={2.6} /> Материал қосу
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-soft sm:p-5">
        <label className="relative block">
          <span className="sr-only">Материал іздеу</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Атауы бойынша іздеу…" className="field pl-10" />
        </label>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Бөлімдер">
          {[{ id: 'all' as const, title: 'Барлығы' }, ...sections].map((s) => (
            <button key={s.id} type="button" onClick={() => setFilter(s.id)} className={filter === s.id ? 'chip-on' : 'chip-off'} aria-pressed={filter === s.id}>
              {s.title}
              <span className={`rounded-full px-1.5 text-xs ${filter === s.id ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>{counts[s.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {state.status === 'loading' && <LoadingState />}
        {state.status === 'error' && <ErrorState onRetry={reload} />}
        {state.status === 'ready' && visible.length === 0 && (
          <EmptyState
            title={items.length === 0 ? 'Әзірге материал жоқ' : 'Ештеңе табылмады'}
            action={
              <button type="button" onClick={() => setEditing('new')} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden /> Материал қосу
              </button>
            }
          >
            {items.length === 0 && 'Алғашқы материалыңызды қосыңыз — ол бірден таңдалған бөлімде көрсетіледі.'}
          </EmptyState>
        )}
        <ul className="space-y-3">
          {visible.map((m) => {
            const section = sectionById(m.section);
            return (
              <li key={m.id} className={`flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-soft sm:flex-row sm:items-center ${m.published ? 'border-slate-100' : 'border-dashed border-slate-300 opacity-80'}`}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <SmartImage
                    src={coverOf(m)}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-xl object-cover"
                    fallback={
                      <span className={`flex h-16 w-24 shrink-0 items-center justify-center rounded-xl ${section.theme.bg}`}>
                        <section.icon className={`h-7 w-7 ${section.theme.icon}`} aria-hidden />
                      </span>
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-brand-950">{m.title}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {section.title} · {KIND_LABEL[m.kind]}
                      {m.kind !== 'link' && ` (${m.files.length})`}
                      {materialMeta(m).length > 0 && ` · ${materialMeta(m).join(' · ')}`}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(m.created_at).toLocaleDateString('kk-KZ')} ·{' '}
                      <span className={m.published ? 'text-emerald-600' : 'text-amber-600'}>{m.published ? 'Жарияланған' : 'Жасырын'}</span>
                    </p>
                  </div>
                </div>
                {confirmDelete === m.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-700">Жою керек пе?</span>
                    <button type="button" disabled={busyId === m.id} onClick={() => remove(m)} className="btn bg-red-600 text-white hover:bg-red-700">
                      Иә, жою
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className="btn-ghost">
                      Жоқ
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    <Link to={`/view/${m.id}`} className="btn-ghost px-3" title="Сайтта қарау">
                      <ExternalLink className="h-4 w-4" aria-hidden /> <span className="sr-only">Сайтта қарау</span>
                    </Link>
                    <button type="button" onClick={() => setEditing(m)} className="btn-ghost px-3">
                      <Pencil className="h-4 w-4" aria-hidden /> Өңдеу
                    </button>
                    <button type="button" disabled={busyId === m.id} onClick={() => togglePublished(m)} className="btn-ghost px-3" title={m.published ? 'Жасыру' : 'Жариялау'}>
                      {m.published ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                      <span className="hidden sm:inline">{m.published ? 'Жасыру' : 'Жариялау'}</span>
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(m.id)} className="btn-ghost px-3 text-red-600 hover:bg-red-50" aria-label={`Жою: ${m.title}`}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {editing && (
        <MaterialForm
          material={editing === 'new' ? undefined : editing}
          defaultSection={filter === 'all' ? undefined : filter}
          onClose={() => setEditing(null)}
          onSaved={(m, isNew) => {
            setEditing(null);
            setToast({ text: isNew ? `«${m.title}» жарияланды — ол «${sectionById(m.section).title}» бөлімінде көрсетіледі` : 'Өзгерістер сақталды', tone: 'ok' });
            reload();
          }}
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4" role="status" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lift ${toast.tone === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden /> {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AdminPage() {
  usePageTitle('Әкімші панелі');
  const { loading, session, isAdmin } = useAuth();

  // Keep the admin page out of search engines
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  let content;
  if (!isSupabaseConfigured) content = <SetupNotice />;
  else if (loading) content = <LoadingState />;
  else if (!session) content = <LoginForm />;
  else if (!isAdmin) content = <NotAdmin />;
  else return <Dashboard />;

  return <section className="container-page py-12 sm:py-16">{content}</section>;
}
