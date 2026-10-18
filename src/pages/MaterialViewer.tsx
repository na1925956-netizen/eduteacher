import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Info } from 'lucide-react';
import { sectionById } from '../data/sections';
import { extInfo, isImage, isOffice } from '../lib/files';
import { fileUrl, getMaterial, type Material, type StoredFile } from '../services/materials';
import { DownloadMenu, EmbedFrame, FullscreenButton, HtmlSandbox, ImageGallery, OpenOriginal, useFullscreen } from '../components/viewers';
import { EmptyState, ErrorState, LoadingState } from '../components/ui';
import { usePageTitle } from '../components/PageHeader';
import NotFound from './NotFound';

type Tab = { id: string; label: string; badge: string; images?: StoredFile[]; file?: StoredFile };

function buildTabs(files: StoredFile[]): Tab[] {
  const images = files.filter((f) => isImage(f.ext));
  const others = files.filter((f) => !isImage(f.ext) && f.ext !== 'html');
  const tabs: Tab[] = others.map((f) => ({ id: f.path, label: f.name, badge: extInfo(f.ext).badge, file: f }));
  if (images.length) {
    tabs.push({ id: 'images', label: images.length > 1 ? `Суреттер (${images.length})` : images[0].name, badge: extInfo('png').badge, images });
  }
  // PDFs first: they preview best in every browser
  return tabs.sort((a, b) => Number(b.file?.ext === 'pdf') - Number(a.file?.ext === 'pdf'));
}

function FileView({ tab, material }: { tab: Tab; material: Material }) {
  if (tab.images) return <ImageGallery images={tab.images} title={material.title} />;
  const f = tab.file!;
  if (f.ext === 'pdf') return <EmbedFrame src={fileUrl(f.path)} title={f.name} fallbackUrl={fileUrl(f.path)} className="h-full" />;
  if (isOffice(f.ext)) {
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl(f.path))}`;
    return <EmbedFrame src={officeUrl} title={f.name} fallbackUrl={fileUrl(f.path, f.name)} className="h-full" />;
  }
  return <EmptyState title="Бұл файлды алдын ала қарау мүмкін емес">Файлды жүктеп алып ашыңыз.</EmptyState>;
}

export default function MaterialViewer() {
  const { id = '' } = useParams();
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'ready'; material: Material | null }>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [tabId, setTabId] = useState<string | null>(null);
  const fs = useFullscreen();

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getMaterial(id)
      .then((material) => alive && setState({ status: 'ready', material }))
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [id, attempt]);

  const material = state.status === 'ready' ? state.material : null;
  const tabs = useMemo(() => (material ? buildTabs(material.files) : []), [material]);
  const activeTab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  usePageTitle(material?.title ?? 'Материал');

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error')
    return (
      <div className="container-page py-16">
        <ErrorState onRetry={() => setAttempt((a) => a + 1)} />
      </div>
    );
  if (!material) return <NotFound />;

  const section = sectionById(material.section);
  const htmlFile = material.files.find((f) => f.ext === 'html');
  const hasPdf = material.files.some((f) => f.ext === 'pdf');
  const downloadable = material.files.filter((f) => f.ext !== 'html');

  let body: JSX.Element;
  if (material.kind === 'html' && htmlFile) {
    body = <HtmlSandbox file={htmlFile} title={material.title} />;
  } else if (material.kind === 'link' && material.link_url) {
    body = material.embeddable ? (
      <EmbedFrame src={material.link_url} title={material.title} fallbackUrl={material.link_url} className="h-full" />
    ) : (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-soft">
        <ExternalLink className="h-10 w-10 text-brand-500" aria-hidden />
        <p className="mt-3 max-w-md text-slate-600">Бұл сайт өз бетін басқа сайттың ішінде көрсетуге рұқсат бермейді. Оны жаңа қойындыда ашыңыз.</p>
        <div className="mt-5">
          <OpenOriginal url={material.link_url} label="Ашу" />
        </div>
      </div>
    );
  } else if (activeTab) {
    body = <FileView tab={activeTab} material={material} />;
  } else {
    body = <EmptyState title="Бұл материалда файл жоқ" />;
  }

  return (
    <section className="container-page pt-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to={section.path} className="btn-ghost">
          <ArrowLeft className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{section.title}</span>
          <span className="sm:hidden">Артқа</span>
        </Link>
        <div className="min-w-0 flex-1">
          {material.category && <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{material.category}</p>}
          <h1 className="truncate text-xl font-extrabold sm:text-2xl">{material.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <FullscreenButton onClick={fs.enter} />
          {material.kind === 'link' && material.link_url && material.embeddable && <OpenOriginal url={material.link_url} />}
          {downloadable.length > 0 && <DownloadMenu files={downloadable} />}
        </div>
      </div>

      {material.description && <p className="mt-3 max-w-3xl text-slate-600">{material.description}</p>}

      {material.kind === 'files' && tabs.length > 1 && (
        <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Файлдар">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === activeTab?.id}
              onClick={() => setTabId(t.id)}
              className={`${t.id === activeTab?.id ? 'chip-on' : 'chip-off'} max-w-[16rem]`}
            >
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {material.kind === 'files' && activeTab?.file && isOffice(activeTab.file.ext) && (
        <p className="mt-3 flex items-start gap-2 text-sm text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {hasPdf
            ? 'Бұл материалдың PDF нұсқасы бар — дәлірек көрініс үшін PDF қойындысын таңдаңыз.'
            : 'Құжат Microsoft Office Online арқылы көрсетіледі. Ашылмаса, файлды жүктеп алыңыз.'}
        </p>
      )}

      <div ref={fs.ref} className="mt-4 h-[calc(100vh-230px)] min-h-[440px] bg-transparent">
        {body}
      </div>
    </section>
  );
}
