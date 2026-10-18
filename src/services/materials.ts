import { useEffect, useState } from 'react';
import type { SectionId } from '../data/types';
import { STORAGE_BUCKET, supabase } from '../lib/supabase';

/*
 * Materials published from the admin panel (Supabase table `materials` + Storage bucket `materials`).
 * Public pages only read; all writes live in services/admin.ts and are enforced by RLS.
 */

export interface StoredFile {
  /** Object key inside the bucket, e.g. "<material id>/<uuid>.pdf" */
  path: string;
  /** Original file name shown to users and used for downloads */
  name: string;
  ext: string;
  size: number;
}

export type MaterialKind = 'files' | 'link' | 'html';

export interface Material {
  id: string;
  section: SectionId;
  title: string;
  description: string;
  grade: number | null;
  subject: string | null;
  category: string | null;
  term: number | null;
  kind: MaterialKind;
  link_url: string | null;
  embeddable: boolean;
  cover_path: string | null;
  files: StoredFile[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

const PAGE = 1000;

/** Public URL of a stored object. With `downloadName` the browser saves it under that name. */
export function fileUrl(path: string, downloadName?: string): string {
  if (!supabase) return '';
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path, downloadName ? { download: downloadName } : undefined).data.publicUrl;
}

/** Cover picture: explicit cover, otherwise the first image file. */
export function coverOf(m: Material): string | undefined {
  if (m.cover_path) return fileUrl(m.cover_path);
  const img = m.files.find((f) => ['jpg', 'jpeg', 'png', 'webp'].includes(f.ext));
  return img ? fileUrl(img.path) : undefined;
}

async function fetchAll(onlyPublished: boolean): Promise<Material[]> {
  if (!supabase) return [];
  const all: Material[] = [];
  // Page through results so the library has no practical size limit
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from('materials').select('*').order('created_at', { ascending: false }).range(from, from + PAGE - 1);
    if (onlyPublished) q = q.eq('published', true);
    const { data, error } = await q;
    if (error) throw error;
    all.push(...((data ?? []) as Material[]));
    if (!data || data.length < PAGE) break;
  }
  return all;
}

/* ---------- Shared cache with change notifications ---------- */

let cache: Promise<Material[]> | null = null;
const listeners = new Set<() => void>();

export function loadPublishedMaterials(): Promise<Material[]> {
  if (!cache) {
    cache = fetchAll(true).catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}

/** Call after the admin changes something so every page re-fetches. */
export function invalidateMaterials() {
  cache = null;
  listeners.forEach((l) => l());
}

export async function getMaterial(id: string): Promise<Material | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('materials').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Material | null) ?? null;
}

export async function loadAllMaterialsForAdmin(): Promise<Material[]> {
  return fetchAll(false);
}

export type MaterialsState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; items: Material[] };

/** Published materials, optionally limited to one section. */
export function useMaterials(section?: SectionId): MaterialsState {
  const [state, setState] = useState<MaterialsState>(supabase ? { status: 'loading' } : { status: 'ready', items: [] });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    listeners.add(bump);
    return () => {
      listeners.delete(bump);
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    setState((s) => (s.status === 'ready' ? s : { status: 'loading' }));
    loadPublishedMaterials()
      .then((items) => alive && setState({ status: 'ready', items: section ? items.filter((i) => i.section === section) : items }))
      .catch(() => alive && setState({ status: 'error', retry: () => setVersion((v) => v + 1) }));
    return () => {
      alive = false;
    };
  }, [section, version]);

  return state;
}
