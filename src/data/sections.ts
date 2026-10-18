import { BookOpen, ClipboardCheck, FolderOpen, Gamepad2, Flower2, MessageCircleHeart } from 'lucide-react';
import type { Section, SectionId } from './types';

export const sections: Section[] = [
  {
    id: 'national',
    path: '/national-values',
    title: 'Ұлттық құндылықтар',
    navLabel: 'Ұлттық құндылықтар',
    tagline: 'Ұлт мұрасы',
    description: 'Сабақта қолдануға болатын ұлттық тәрбие мен қазақ халқының мәдени мұрасы',
    image: 'images/card-national.webp',
    icon: Flower2,
    theme: {
      bg: 'bg-gradient-to-br from-[#fff8e4] via-[#fff1d2] to-[#ffe9c4]',
      button: 'bg-[#ffd96b] text-brand-950',
      icon: 'text-rose-600',
      accent: 'text-amber-700 bg-amber-100',
    },
  },
  {
    id: 'comics',
    path: '/comics',
    title: 'Комикстер',
    navLabel: 'Комикстер',
    tagline: 'Комикстер әлемі — Оқы, таны, үйрен!',
    description: 'Сабаққа арналған комикстерді жоспарлау және жасау',
    image: 'images/card-comics.webp',
    icon: BookOpen,
    theme: {
      bg: 'bg-gradient-to-br from-[#fff0f6] via-[#ffe5f0] to-[#ffd9ea]',
      button: 'bg-[#f7a6cd] text-brand-950',
      icon: 'text-amber-500',
      accent: 'text-pink-700 bg-pink-100',
    },
  },
  {
    id: 'feedback',
    path: '/feedback',
    title: 'Кері байланыс',
    navLabel: 'Кері байланыс',
    tagline: 'Оқушы үнін тыңдайық',
    description: 'Сабақ соңында оқушылардың пікірін анықтау әдістері',
    image: 'images/card-feedback.webp',
    icon: MessageCircleHeart,
    theme: {
      bg: 'bg-gradient-to-br from-[#eef6ff] via-[#e3f0ff] to-[#d6e9ff]',
      button: 'bg-[#9cc9f7] text-brand-950',
      icon: 'text-sky-500',
      accent: 'text-sky-700 bg-sky-100',
    },
  },
  {
    id: 'games',
    path: '/games',
    title: 'Цифрлық ойындар',
    navLabel: 'Цифрлық ойындар',
    tagline: 'Ойна, ойлан, үйрен!',
    description: 'Бастауыш сынып оқушыларына арналған қызықты және тиімді белсенді ойындар',
    image: 'images/card-games.webp',
    icon: Gamepad2,
    theme: {
      bg: 'bg-gradient-to-br from-[#f3efff] via-[#ebe4ff] to-[#e0d6ff]',
      button: 'bg-[#c9b8fb] text-brand-950',
      icon: 'text-brand-600',
      accent: 'text-violet-700 bg-violet-100',
    },
  },
  {
    id: 'materials',
    path: '/materials',
    title: 'Дайын материалдар',
    navLabel: 'Дайын материалдар',
    tagline: 'Мұғалім кітапханасы',
    description: 'Сабақ жоспарлары, жұмыс парақтары, тестер, презентациялар және т.б.',
    image: 'images/card-materials.webp',
    icon: FolderOpen,
    theme: {
      bg: 'bg-gradient-to-br from-[#ebfbf3] via-[#dcf7ea] to-[#cdf2df]',
      button: 'bg-[#7fe0b4] text-brand-950',
      icon: 'text-brand-600',
      accent: 'text-emerald-700 bg-emerald-100',
    },
  },
  {
    id: 'assessment',
    path: '/assessment',
    title: 'Аралық бақылау тапсырмалары',
    navLabel: 'Аралық бақылау',
    description: 'Бөлім және тоқсан бойынша аралық бақылау тапсырмалары, үлгілер және бағалау критерийлері',
    image: 'images/card-assessment.webp',
    icon: ClipboardCheck,
    theme: {
      bg: 'bg-gradient-to-br from-[#fff4e8] via-[#ffead6] to-[#ffdfc2]',
      button: 'bg-[#ffb871] text-brand-950',
      icon: 'text-sky-500',
      accent: 'text-orange-700 bg-orange-100',
    },
  },
];

export const sectionById = (id: SectionId): Section => {
  const s = sections.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown section: ${id}`);
  return s;
};
