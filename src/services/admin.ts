import type { SectionId } from '../data/types';
import { extOf, guessEmbeddable, MIME } from '../lib/files';
import { STORAGE_BUCKET, supabase } from '../lib/supabase';
import { invalidateMaterials, type Material, type MaterialKind, type StoredFile } from './materials';

/* All writes below are additionally enforced server-side by RLS + Storage policies (supabase/schema.sql). */

export interface MaterialInput {
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
  published: boolean;
}

/** A file slot in the form: either already stored, or picked from the device and not yet uploaded. */
export type FileEntry = { key: string; existing: StoredFile } | { key: string; file: File };
export type CoverEntry = { existing: string } | { file: File } | null;

function client() {
  if (!supabase) throw new Error('Supabase бапталмаған');
  return supabase;
}

async function upload(materialId: string, file: File): Promise<StoredFile> {
  const ext = extOf(file.name);
  if (!ext) throw new Error(`«${file.name}» — бұл файл түріне рұқсат жоқ`);
  // Object keys are ASCII-only (Cyrillic names are rejected by Storage); the original name is kept in `name`
  const path = `${materialId}/${crypto.randomUUID()}.${ext}`;
  // Storage uses the Blob's own type for File uploads (the contentType option is ignored), and
  // browsers — especially on phones — often report "" or application/octet-stream for .docx/.pptx.
  // Re-wrap so the bucket's MIME allow-list always sees the type that matches the extension.
  const body = new Blob([file], { type: MIME[ext] });
  const { error } = await client()
    .storage.from(STORAGE_BUCKET)
    .upload(path, body, { contentType: MIME[ext], cacheControl: '31536000', upsert: false });
  if (error) {
    const msg = /exceeded|too large|maximum/i.test(error.message) ? 'файл тым үлкен (ең көбі 50 МБ)' : error.message;
    throw new Error(`«${file.name}» жүктелмеді: ${msg}`);
  }
  return { path, name: file.name, ext, size: file.size };
}

/** Returns how many of the files could NOT be removed (Storage reports success with an empty list when policies block it). */
async function removePaths(paths: string[]): Promise<number> {
  if (!paths.length) return 0;
  const { data, error } = await client().storage.from(STORAGE_BUCKET).remove(paths);
  const removed = error ? 0 : (data?.length ?? 0);
  if (removed < paths.length) console.warn(`Storage: ${paths.length - removed} file(s) were not removed`, paths);
  return paths.length - removed;
}

interface SaveParams {
  previous?: Material;
  input: MaterialInput;
  entries: FileEntry[];
  cover: CoverEntry;
  onProgress?: (message: string) => void;
}

export async function saveMaterial({ previous, input, entries, cover, onProgress }: SaveParams): Promise<Material> {
  const db = client();
  const id = previous?.id ?? crypto.randomUUID();
  const uploaded: string[] = [];

  try {
    const files: StoredFile[] = [];
    const toUpload = entries.filter((e) => 'file' in e).length + (cover && 'file' in cover ? 1 : 0);
    let done = 0;

    for (const entry of entries) {
      if ('existing' in entry) {
        files.push(entry.existing);
        continue;
      }
      onProgress?.(`Файлдар жүктелуде… ${done + 1}/${toUpload}`);
      const stored = await upload(id, entry.file);
      uploaded.push(stored.path);
      files.push(stored);
      done++;
    }

    let cover_path: string | null = null;
    if (cover && 'existing' in cover) cover_path = cover.existing;
    if (cover && 'file' in cover) {
      onProgress?.(`Мұқаба жүктелуде… ${done + 1}/${toUpload}`);
      const stored = await upload(id, cover.file);
      uploaded.push(stored.path);
      cover_path = stored.path;
    }

    onProgress?.('Сақталуда…');
    const row = { ...input, id, files, cover_path };
    const query = previous ? db.from('materials').update(row).eq('id', id) : db.from('materials').insert(row);
    const { data, error } = await query.select().single();
    if (error) throw new Error(error.code === '42501' ? 'Әкімші құқығы жоқ' : error.message);

    // Clean up files that were removed in the form
    if (previous) {
      const kept = new Set([...files.map((f) => f.path), cover_path]);
      const stale = [...previous.files.map((f) => f.path), previous.cover_path].filter((p): p is string => Boolean(p) && !kept.has(p));
      await removePaths(stale).catch(() => undefined);
    }

    invalidateMaterials();
    return data as Material;
  } catch (err) {
    // Roll back uploads of a failed save so Storage doesn't fill up with orphans
    await removePaths(uploaded).catch(() => undefined);
    throw err;
  }
}

/** Deletes the material and its files. Resolves to the number of files left behind in Storage. */
export async function deleteMaterial(m: Material): Promise<number> {
  const { error } = await client().from('materials').delete().eq('id', m.id);
  if (error) throw new Error(error.message);
  const paths = [...m.files.map((f) => f.path), m.cover_path].filter((p): p is string => Boolean(p));
  const leftover = await removePaths(paths).catch(() => paths.length);
  invalidateMaterials();
  return leftover;
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  const { error } = await client().from('materials').update({ published }).eq('id', id);
  if (error) throw new Error(error.message);
  invalidateMaterials();
}

/**
 * Checks whether a site allows being embedded in an iframe. Uses the optional `check-embed`
 * Edge Function (reads X-Frame-Options / CSP frame-ancestors server-side); browsers cannot read
 * those headers cross-origin, so without the function a list of known domains is used.
 */
export async function checkEmbeddable(url: string): Promise<{ embeddable: boolean; verified: boolean }> {
  try {
    const { data, error } = await client().functions.invoke('check-embed', { body: { url } });
    if (!error && data && typeof data.embeddable === 'boolean') return { embeddable: data.embeddable, verified: true };
  } catch {
    /* function not deployed — fall back */
  }
  return { embeddable: guessEmbeddable(url), verified: false };
}
