import type { LucideIcon } from 'lucide-react';

export type SectionId = 'national' | 'comics' | 'feedback' | 'games' | 'materials' | 'assessment';

export interface Section {
  id: SectionId;
  path: string;
  /** Full title used on cards and page headers */
  title: string;
  /** Short label for the navigation bar */
  navLabel: string;
  /** Page tagline shown after the dash, e.g. «Ұлт мұрасы» */
  tagline?: string;
  description: string;
  image: string;
  icon: LucideIcon;
  theme: SectionTheme;
}

export interface SectionTheme {
  /** Card / page header background */
  bg: string;
  /** Round arrow button */
  button: string;
  /** Icon colour in the navigation */
  icon: string;
  /** Accent text / badges */
  accent: string;
}

/**
 * A resource that lives on another site or as a local HTML file in /public.
 * - kind "link": `url` is an absolute https:// address
 * - kind "html": `url` is a path inside /public, e.g. "tools/feedback/my-tool.html"
 */
export interface WebResource {
  id: string;
  title: string;
  description: string;
  kind: 'link' | 'html';
  url: string;
  /** Preview picture: absolute URL or path inside /public. Optional — a styled placeholder is shown otherwise. */
  image?: string;
  tags?: string[];
}

export interface Comic {
  id: string;
  title: string;
  category: ComicCategory;
  url: string;
  cover?: string;
}

export type ComicCategory =
  | 'Ертегілер'
  | 'Абай шығармалары'
  | 'Тарихи мұралар'
  | 'Әдеби шығармалар'
  | 'Математикалық комикстер';

export interface DigitalTool {
  id: string;
  name: string;
  description: string;
  url: string;
  logo?: string;
  category: string;
  /** Shown on the home page strip */
  featured?: boolean;
}

