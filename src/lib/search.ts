import { comics } from '../data/comics';
import { feedbackTools, games, nationalValues } from '../data/resources';
import { sections } from '../data/sections';
import { digitalTools } from '../data/tools';
import type { WebResource } from '../data/types';
import type { Material } from '../services/materials';

export interface SearchEntry {
  id: string;
  title: string;
  subtitle: string;
  group: string;
  /** Internal route (HashRouter path) */
  to?: string;
  /** External URL or public path, opened in a new tab */
  href?: string;
  haystack: string;
}

export const normalize = (s: string) => s.toLocaleLowerCase('kk-KZ').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();

const fromResource = (r: WebResource, group: string): SearchEntry => ({
  id: r.id,
  title: r.title,
  subtitle: r.description,
  group,
  href: r.url,
  haystack: normalize([r.title, r.description, ...(r.tags ?? [])].join(' ')),
});

export function buildStaticIndex(): SearchEntry[] {
  return [
    ...sections.map((s) => ({
      id: `section-${s.id}`,
      title: s.title,
      subtitle: s.description,
      group: 'Бөлімдер',
      to: s.path,
      haystack: normalize(`${s.title} ${s.tagline ?? ''} ${s.description}`),
    })),
    ...nationalValues.map((r) => fromResource(r, 'Ұлттық құндылықтар')),
    ...comics.map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: `Комикс · ${c.category}`,
      group: 'Комикстер',
      to: `/comics/${c.id}`,
      haystack: normalize(`${c.title} ${c.category} комикс`),
    })),
    ...feedbackTools.map((r) => fromResource(r, 'Кері байланыс')),
    ...games.map((r) => fromResource(r, 'Цифрлық ойындар')),
    ...digitalTools.map((t) => ({
      id: `tool-${t.id}`,
      title: t.name,
      subtitle: t.description,
      group: 'Цифрлық құралдар',
      href: t.url,
      haystack: normalize(`${t.name} ${t.description} ${t.category}`),
    })),
  ];
}

/** Admin-published materials: each opens in the universal viewer. */
export function materialsToEntries(items: Material[]): SearchEntry[] {
  return items.map((m) => {
    const section = sections.find((s) => s.id === m.section);
    const meta = [m.category, m.subject, m.grade ? `${m.grade}-сынып` : null].filter(Boolean).join(' · ');
    const external = m.kind === 'link' && !m.embeddable && m.link_url;
    return {
      id: `m-${m.id}`,
      title: m.title,
      subtitle: meta || m.description,
      group: section?.title ?? 'Материалдар',
      to: external ? undefined : `/view/${m.id}`,
      href: external || undefined,
      haystack: normalize(`${m.title} ${m.description} ${meta} ${section?.title ?? ''} ${m.files.map((f) => f.name).join(' ')}`),
    };
  });
}

export function searchEntries(index: SearchEntry[], query: string, limit = 30): SearchEntry[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(' ');
  return index
    .map((e) => {
      if (!words.every((w) => e.haystack.includes(w))) return null;
      const t = normalize(e.title);
      const score = t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2;
      return { e, score };
    })
    .filter((x): x is { e: SearchEntry; score: number } => x !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.e);
}
