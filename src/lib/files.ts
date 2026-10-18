import { FileArchive, FileCode2, FileImage, FileSpreadsheet, FileText, Presentation, type LucideIcon } from 'lucide-react';

export type FileExt = 'doc' | 'docx' | 'ppt' | 'pptx' | 'pdf' | 'xls' | 'xlsx' | 'jpg' | 'jpeg' | 'png' | 'webp' | 'html';

export const MIME: Record<FileExt, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  html: 'text/html',
};

export const DOCUMENT_EXTS: FileExt[] = ['doc', 'docx', 'ppt', 'pptx', 'pdf', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'webp'];
export const IMAGE_EXTS: FileExt[] = ['jpg', 'jpeg', 'png', 'webp'];
export const OFFICE_EXTS: FileExt[] = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

/** 50 MB — Supabase Free plan per-file maximum (also set on the bucket). */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function extOf(name: string): FileExt | null {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext && ext in MIME ? (ext as FileExt) : null;
}

export const isImage = (ext: string) => (IMAGE_EXTS as string[]).includes(ext);
export const isOffice = (ext: string) => (OFFICE_EXTS as string[]).includes(ext);

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

interface ExtInfo {
  label: string;
  badge: string;
  icon: LucideIcon;
}

export function extInfo(ext: string): ExtInfo {
  switch (ext) {
    case 'doc':
    case 'docx':
      return { label: 'Word', badge: 'bg-blue-100 text-blue-700', icon: FileText };
    case 'ppt':
    case 'pptx':
      return { label: 'PowerPoint', badge: 'bg-orange-100 text-orange-700', icon: Presentation };
    case 'xls':
    case 'xlsx':
      return { label: 'Excel', badge: 'bg-emerald-100 text-emerald-700', icon: FileSpreadsheet };
    case 'pdf':
      return { label: 'PDF', badge: 'bg-red-100 text-red-700', icon: FileText };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
      return { label: 'Сурет', badge: 'bg-violet-100 text-violet-700', icon: FileImage };
    case 'html':
      return { label: 'HTML ойын', badge: 'bg-indigo-100 text-indigo-700', icon: FileCode2 };
    default:
      return { label: ext.toUpperCase(), badge: 'bg-slate-100 text-slate-600', icon: FileArchive };
  }
}

/** Accept attribute for <input type="file"> — both extensions and MIME types so phones offer the right apps. */
export function acceptFor(exts: FileExt[]): string {
  return [...exts.map((e) => `.${e}`), ...new Set(exts.map((e) => MIME[e]))].join(',');
}

/**
 * Domains checked to allow being shown inside an iframe (no X-Frame-Options / frame-ancestors).
 * Used as a fallback when the optional `check-embed` Edge Function is not deployed.
 * Baamboozle and Wordwall send X-Frame-Options: SAMEORIGIN, so they always open in a new tab.
 */
const EMBEDDABLE_HOSTS = ['heyzine.com', 'lovable.app', 'diaoft.kz', 'sslip.io', 'learningapps.org'];

export function guessEmbeddable(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return EMBEDDABLE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export function validateUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Сілтемені енгізіңіз';
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return 'Сілтеме дұрыс емес. Мысалы: https://heyzine.com/flip-book/…';
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'Сілтеме https:// арқылы басталуы керек';
  if (!u.hostname.includes('.')) return 'Сайт мекенжайы толық емес';
  return null;
}
