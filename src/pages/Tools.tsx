import { useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { ToolCard } from '../components/cards';
import { EmptyState, StaggerGrid } from '../components/ui';
import { digitalTools } from '../data/tools';

export default function ToolsPage() {
  const categories = useMemo(() => ['Барлығы', ...Array.from(new Set(digitalTools.map((t) => t.category)))], []);
  const [category, setCategory] = useState('Барлығы');
  const list = category === 'Барлығы' ? digitalTools : digitalTools.filter((t) => t.category === category);

  return (
    <>
      <PageHeader
        title="Цифрлық құралдар"
        tagline="Мұғалімге арналған платформалар"
        description="Сабаққа дайындалуға, тапсырма құрастыруға, көрнекілік жасауға және кері байланыс жинауға көмектесетін жасанды интеллект пен цифрлық платформалар."
        image="images/card-materials.webp"
      />
      <section className="container-page mt-8">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Құрал санаттары">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={category === c ? 'chip-on' : 'chip-off'} aria-pressed={category === c}>
              {c}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Құрал табылмады" />
          </div>
        ) : (
          <StaggerGrid key={category} className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </StaggerGrid>
        )}
      </section>
    </>
  );
}
