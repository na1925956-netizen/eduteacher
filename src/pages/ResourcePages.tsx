import type { ReactNode } from 'react';
import { Gamepad2, Info, Flower2, MessageCircleHeart, Loader2, RotateCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { ResourceCard } from '../components/cards';
import MaterialCard from '../components/MaterialCard';
import { EmptyState, StaggerGrid } from '../components/ui';
import { sectionById } from '../data/sections';
import { feedbackTools, games, nationalValues } from '../data/resources';
import type { SectionId, WebResource } from '../data/types';
import { useMaterials, type MaterialsState } from '../services/materials';

/** Small inline status for admin-published materials loading under the built-in ones. */
export function RemoteStatus({ state }: { state: MaterialsState }) {
  if (state.status === 'loading')
    return (
      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Жаңа материалдар жүктелуде…
      </p>
    );
  if (state.status === 'error')
    return (
      <p className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-red-600" role="alert">
        Жаңа материалдарды жүктеу мүмкін болмады.
        <button type="button" onClick={state.retry} className="inline-flex items-center gap-1 font-semibold underline">
          <RotateCw className="h-3.5 w-3.5" aria-hidden /> Қайталау
        </button>
      </p>
    );
  return null;
}

interface ResourcePageProps {
  sectionId: SectionId;
  title: string;
  tagline: string;
  description: string;
  items: WebResource[];
  actionLabel: string;
  placeholderIcon: ReactNode;
  note?: ReactNode;
}

function ResourcePage({ sectionId, title, tagline, description, items, actionLabel, placeholderIcon, note }: ResourcePageProps) {
  const section = sectionById(sectionId);
  const remote = useMaterials(sectionId);
  const published = remote.status === 'ready' ? remote.items : [];
  const total = items.length + published.length;

  return (
    <>
      <PageHeader section={section} title={title} tagline={tagline} description={description} />
      <section className="container-page mt-8">
        {note && (
          <p className="mb-5 flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
            {note}
          </p>
        )}
        {total === 0 && remote.status === 'ready' ? (
          <EmptyState title="Материалдар әзірге жоқ">Жақын арада жаңа материалдар қосылады.</EmptyState>
        ) : (
          <StaggerGrid key={published.length} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Newest admin-published materials first, then the built-in ones */}
            {published.map((m) => (
              <MaterialCard key={m.id} material={m} theme={section.theme} placeholderIcon={placeholderIcon} openLabel={actionLabel} />
            ))}
            {items.map((r, i) => (
              <ResourceCard key={r.id} resource={r} theme={section.theme} actionLabel={actionLabel} placeholderIcon={placeholderIcon} index={i} />
            ))}
          </StaggerGrid>
        )}
        <RemoteStatus state={remote} />
      </section>
    </>
  );
}

export function NationalValuesPage() {
  return (
    <ResourcePage
      sectionId="national"
      title="Ұлттық құндылықтар"
      tagline="Ұлт мұрасы"
      description="Ұлттық тәрбие мен қазақ халқының мәдени мұрасын сабақта таныстыруға арналған интерактивті материалдар."
      items={nationalValues}
      actionLabel="Ашу"
      placeholderIcon={<Flower2 className="h-10 w-10 text-rose-500" aria-hidden />}
      note="Сыртқы сайттар жаңа қойындыда ашылады. Файлдарды сайт ішінде қарап, жүктеп алуға болады."
    />
  );
}

export function FeedbackPage() {
  return (
    <ResourcePage
      sectionId="feedback"
      title="Кері байланыс"
      tagline="Оқушы үнін тыңдайық"
      description="Сабақ соңында оқушылардың пікірін, көңіл-күйін және тақырыпты қаншалықты түсінгенін анықтауға арналған құралдар."
      items={feedbackTools}
      actionLabel="Қолдану"
      placeholderIcon={<MessageCircleHeart className="h-10 w-10 text-sky-500" aria-hidden />}
      note="Құралдар жаңа қойындыда ашылады. Кейбір құралдар камераға немесе микрофонға рұқсат сұрауы мүмкін."
    />
  );
}

export function GamesPage() {
  return (
    <ResourcePage
      sectionId="games"
      title="Цифрлық ойындар"
      tagline="Ойна, ойлан, үйрен!"
      description="Бастауыш сынып оқушыларына арналған қызықты әрі тиімді белсенді ойындар мен интерактивті жаттығулар."
      items={games}
      actionLabel="Ойынды бастау"
      placeholderIcon={<Gamepad2 className="h-10 w-10 text-brand-600" aria-hidden />}
      note="Ойындар жаңа қойындыда немесе қауіпсіз оқшауланған терезеде ашылады — интерактивті тақтада толық экранда көрсетуге ыңғайлы."
    />
  );
}
