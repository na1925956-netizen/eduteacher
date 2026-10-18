import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { sections } from '../data/sections';
import { author } from '../data/site';
import { Logo } from './Header';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            Мұғалімнің цифрлық көмекшісі. Сабаққа қажетті материалдар, шығармашылық идеялар және жасанды интеллект құралдары — барлығы бір жерде.
          </p>
          <a href={`mailto:${author.email}`} className="mt-4 inline-flex items-center gap-2 rounded text-sm font-medium text-brand-700 hover:underline">
            <Mail className="h-4 w-4" aria-hidden /> {author.email}
          </a>
        </div>
        <nav aria-label="Төменгі мәзір" className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link key={s.id} to={s.path} className="rounded py-1 text-slate-600 hover:text-brand-700">
              {s.title}
            </Link>
          ))}
          <Link to="/tools" className="rounded py-1 text-slate-600 hover:text-brand-700">
            Цифрлық құралдар
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} EduTeacher · {author.name}
      </div>
    </footer>
  );
}
