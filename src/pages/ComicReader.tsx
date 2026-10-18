import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Maximize2 } from 'lucide-react';
import { comicById } from '../data/comics';
import { usePageTitle } from '../components/PageHeader';
import NotFound from './NotFound';

/** Heyzine allows embedding (no X-Frame-Options), so books open inside the site. */
export default function ComicReader() {
  const { id = '' } = useParams();
  const comic = comicById(id);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const frameWrap = useRef<HTMLDivElement>(null);
  usePageTitle(comic ? comic.title : 'Комикс табылмады');

  useEffect(() => {
    setLoaded(false);
    setSlow(false);
    const t = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(t);
  }, [id]);

  if (!comic) return <NotFound />;

  const fullscreen = () => frameWrap.current?.requestFullscreen?.().catch(() => undefined);

  return (
    <section className="container-page pt-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/comics" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Комикстерге оралу
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">{comic.category}</p>
          <h1 className="truncate text-xl font-extrabold sm:text-2xl">{comic.title}</h1>
        </div>
        <div className="flex gap-2">
          {document.fullscreenEnabled && (
            <button type="button" onClick={fullscreen} className="btn-ghost" aria-label="Толық экран">
              <Maximize2 className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Толық экран</span>
            </button>
          )}
          <a href={comic.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Кітапты ашу <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>

      <div ref={frameWrap} className="relative mt-4 h-[calc(100vh-190px)] min-h-[420px] overflow-hidden rounded-3xl bg-slate-900 shadow-lift">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500" role="status">
            <Loader2 className="h-9 w-9 animate-spin text-brand-500" aria-hidden />
            <span>Кітап жүктелуде…</span>
            {slow && (
              <p className="max-w-sm px-4 text-center text-sm">
                Жүктелу ұзаққа созылып тұр. Кітапты{' '}
                <a href={comic.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline">
                  жаңа қойындыда ашып
                </a>{' '}
                көріңіз.
              </p>
            )}
          </div>
        )}
        <iframe
          key={comic.id}
          src={comic.url}
          title={`Комикс: ${comic.title}`}
          className="h-full w-full border-0"
          allow="fullscreen"
          allowFullScreen
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </section>
  );
}
