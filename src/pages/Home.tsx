import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Send, Sparkle, UserRound } from 'lucide-react';
import { sections } from '../data/sections';
import { author } from '../data/site';
import { featuredTools } from '../data/tools';
import { publicPath } from '../lib/paths';
import { SectionCard, ToolCard } from '../components/cards';
import { StaggerGrid } from '../components/ui';
import { usePageTitle } from '../components/PageHeader';

const badges = [
  { label: 'Сапалы білім', cls: 'bg-brand-600 ml-6' },
  { label: 'Шығармашылық үрдістер', cls: 'bg-brand-700 ml-2' },
  { label: 'Жасанды интеллект', cls: 'bg-brand-800' },
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#e9f2ff] via-[#f3f8ff] to-[#e6f0fc]">
      {/* Illustration (desktop: right half, full height) */}
      <div className="absolute inset-y-0 right-0 hidden w-[54%] lg:block">
        <img
          src={publicPath('images/hero.webp')}
          alt="Тақта алдында кітап ұстаған мұғалім: «Болашақ бүгінгі жақсы мұғалімнің қолында!»"
          className="fade-left h-full w-full object-cover object-left"
          {...{ fetchpriority: 'high' }}
          width={1434}
          height={564}
        />
      </div>

      <div className="container-page relative grid lg:min-h-[330px] lg:grid-cols-[52%_1fr] xl:min-h-[350px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 py-7 sm:py-9 lg:py-8"
        >
          <h1 className="font-display font-black leading-[0.98] tracking-tight">
            <span className="flex items-center gap-2 text-[2.15rem] min-[400px]:text-[2.5rem] sm:gap-3 sm:text-6xl xl:text-[4.6rem]">
              <span className="text-brand-600">
                Edu<span className="text-brand-800">Teacher</span>
              </span>
              <span className="text-brand-950">—</span>
              <Send className="h-8 w-8 shrink-0 -rotate-12 fill-amber-300 text-amber-400 sm:h-12 sm:w-12" aria-hidden strokeWidth={1.6} />
            </span>
            <span className="mt-1 block text-[1.7rem] font-extrabold text-brand-950 sm:text-4xl xl:text-[2.75rem]">
              білім мен болашақ алаңы
            </span>
          </h1>
          <p className="mt-4 max-w-[36rem] text-base leading-relaxed text-slate-700 sm:text-lg xl:text-[1.2rem]">
            Мұғалімнің цифрлық көмекшісі. Сабаққа қажетті материалдар, шығармашылық идеялар және жасанды интеллект құралдары — барлығы бір жерде.
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-3 rounded-2xl bg-white/85 p-3.5 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:gap-0 sm:p-3">
              <div className="flex items-center gap-3 sm:pr-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <UserRound className="h-6 w-6" aria-hidden />
                </span>
                <span className="leading-tight">
                  <span className="block font-bold text-brand-950 sm:whitespace-nowrap">{author.name}</span>
                  <span className="text-sm text-slate-500">{author.role}</span>
                </span>
              </div>
              <a href={`mailto:${author.email}`} className="flex items-center gap-3 rounded-xl sm:border-l sm:border-slate-200 sm:pl-4">
                <Mail className="h-7 w-7 shrink-0 text-brand-600" aria-hidden />
                <span className="leading-tight">
                  <span className="block text-xs text-slate-500">Электронды пошта:</span>
                  <span className="text-sm font-semibold text-brand-950 hover:text-brand-700">{author.email}</span>
                </span>
              </a>
            </div>

            <ul className="hidden flex-col gap-1.5 2xl:flex" aria-label="Басымдықтар">
              {badges.map((b) => (
                <li key={b.label} className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-medium text-white shadow-md ${b.cls}`}>
                  {b.label}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Illustration (mobile / tablet) */}
      <div className="px-4 pb-10 sm:px-6 lg:hidden">
        <img
          src={publicPath('images/hero.webp')}
          alt="Тақта алдында кітап ұстаған мұғалім"
          className="w-full rounded-3xl shadow-soft"
          width={1434}
          height={564}
        />
      </div>
    </section>
  );
}

export default function Home() {
  usePageTitle('Білім мен болашақ алаңы');

  return (
    <>
      <Hero />

      <div className="relative -mt-6 rounded-t-[2.25rem] bg-[#f6f9ff] pt-6 sm:-mt-7 sm:pt-7">
        <section aria-labelledby="sections-title" className="container-page">
          <h2 id="sections-title" className="sr-only">
            Бөлімдер
          </h2>
          <StaggerGrid className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {sections.map((s) => (
              <SectionCard key={s.id} section={s} />
            ))}
          </StaggerGrid>
        </section>

        <section aria-labelledby="tools-title" className="container-page mt-6">
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-soft sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 id="tools-title" className="flex items-center gap-2 font-sans text-xl font-bold sm:text-2xl">
                <Sparkle className="h-7 w-7 fill-brand-500 text-brand-500" aria-hidden />
                Пайдалы цифрлық құралдар
              </h2>
              <Link to="/tools" className="inline-flex items-center gap-1 rounded text-sm font-medium text-brand-600 hover:text-brand-800 hover:underline">
                Барлық платформаларды көру <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
              {featuredTools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </StaggerGrid>
          </div>
        </section>
      </div>
    </>
  );
}
