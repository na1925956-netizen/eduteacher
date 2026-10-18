import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, LayoutDashboard, LogOut, Mail, Menu, Search, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react';
import { useAuth } from '../services/auth';
import { sections } from '../data/sections';
import { author } from '../data/site';
import { publicPath } from '../lib/paths';
import SearchDialog from './SearchDialog';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2 rounded-xl" aria-label="EduTeacher — басты бет">
      <img src={publicPath('images/logo.webp')} alt="" className="h-9 w-auto sm:h-12" width={70} height={60} />
      <span className="leading-none">
        <span className="block font-display text-[1.4rem] font-extrabold tracking-tight text-brand-600 sm:text-[1.85rem]">
          Edu<span className="text-brand-900">Teacher</span>
        </span>
        {!compact && (
          <span className="mt-0.5 block text-[0.7rem] font-medium text-brand-600/90 sm:text-[0.82rem]">
            Білім мен болашақ алаңы
          </span>
        )}
      </span>
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);
  const { isAdmin, signOut } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Ctrl/Cmd+K or "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = /input|textarea|select/i.test(target.tagName) || target.isContentEditable;
      if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !profileRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [profileOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-[76px] items-center gap-4">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="Негізгі мәзір" className="ml-auto hidden items-center gap-1 xl:flex 2xl:gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors 2xl:px-4 ${
                isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
              }`
            }
          >
            <Home className="h-[18px] w-[18px]" aria-hidden />
            Басты бет
          </NavLink>
          {sections.map((s) => (
            <NavLink
              key={s.id}
              to={s.path}
              className={({ isActive }) =>
                `group flex h-11 items-center gap-2 rounded-xl px-2 text-[0.8rem] font-medium leading-tight transition-colors 2xl:px-3 ${
                  isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <s.icon className={`h-6 w-6 shrink-0 ${isActive ? 'text-white' : s.theme.icon}`} aria-hidden strokeWidth={1.8} />
                  <span className="max-w-[6.5rem]">{s.navLabel}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 xl:ml-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-brand-950 transition-colors hover:bg-brand-50 hover:text-brand-700"
            aria-label="Іздеу (Ctrl+K)"
            title="Іздеу (Ctrl+K)"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>

          {/* Profile: author's contact card + entry to the admin panel (Supabase Auth) */}
          <div className="relative hidden sm:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand-600 text-white shadow-md shadow-brand-600/30 transition-transform hover:scale-105"
              aria-label="Профиль: сайт авторы және әкімші кіруі"
              aria-expanded={profileOpen}
              aria-haspopup="dialog"
            >
              <UserRound className="h-6 w-6" aria-hidden />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  role="dialog"
                  aria-label="Сайт авторы"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-2xl border border-slate-100 bg-white p-4 shadow-lift"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Сайт авторы</p>
                  <p className="mt-1 font-semibold text-brand-950">{author.name}</p>
                  <p className="text-sm text-slate-500">{author.role}</p>
                  <a href={`mailto:${author.email}`} className="btn-soft mt-3 w-full">
                    <Mail className="h-4 w-4" aria-hidden /> Хат жазу
                  </a>
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    {isAdmin ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Link to="/admin" className="btn-primary px-3">
                          <LayoutDashboard className="h-4 w-4" aria-hidden /> Панель
                        </Link>
                        <button type="button" onClick={() => void signOut()} className="btn-ghost px-3">
                          <LogOut className="h-4 w-4" aria-hidden /> Шығу
                        </button>
                      </div>
                    ) : (
                      <Link to="/admin" className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-brand-700">
                        <ShieldCheck className="h-4 w-4" aria-hidden /> Әкімші кіруі
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-brand-950 hover:bg-brand-50 xl:hidden"
            aria-label="Мәзірді ашу"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile drawer — portalled: the header's backdrop-filter would otherwise trap position:fixed */}
      {createPortal(
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-brand-950/30 backdrop-blur-sm xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              id="mobile-menu"
              aria-label="Мобильді мәзір"
              className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl xl:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-4">
                <Logo compact />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100"
                  aria-label="Мәзірді жабу"
                  autoFocus
                >
                  <X className="h-6 w-6" aria-hidden />
                </button>
              </div>
              <ul className="flex-1 space-y-1 overflow-y-auto p-3">
                <li>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 font-semibold ${isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-brand-50'}`
                    }
                  >
                    <Home className="h-5 w-5" aria-hidden /> Басты бет
                  </NavLink>
                </li>
                {sections.map((s) => (
                  <li key={s.id}>
                    <NavLink
                      to={s.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-3 font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-brand-50'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <s.icon className={`h-5 w-5 ${isActive ? 'text-white' : s.theme.icon}`} aria-hidden />
                          {s.title}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <NavLink
                    to="/tools"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-brand-50'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Sparkles className={`h-5 w-5 ${isActive ? 'text-white' : 'text-brand-500'}`} aria-hidden /> Цифрлық құралдар
                      </>
                    )}
                  </NavLink>
                </li>
              </ul>
              <div className="border-t border-slate-100 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Сайт авторы</p>
                <p className="mt-1 font-semibold text-brand-950">{author.name}</p>
                <a href={`mailto:${author.email}`} className="mt-1 inline-flex items-center gap-2 text-sm text-brand-700">
                  <Mail className="h-4 w-4" aria-hidden /> {author.email}
                </a>
                <Link to="/admin" className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700">
                  {isAdmin ? <LayoutDashboard className="h-4 w-4" aria-hidden /> : <ShieldCheck className="h-4 w-4" aria-hidden />}
                  {isAdmin ? 'Әкімші панелі' : 'Әкімші кіруі'}
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>,
      document.body,
      )}

      {createPortal(<SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />, document.body)}
    </header>
  );
}
