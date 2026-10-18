import type { Comic, ComicCategory } from './types';

export const comicCategories: ComicCategory[] = [
  'Ертегілер',
  'Абай шығармалары',
  'Тарихи мұралар',
  'Әдеби шығармалар',
  'Математикалық комикстер',
];

const thumb = (hash: string, v3 = false) =>
  `https://cdnm.heyzine.com/files/uploaded/${v3 ? 'v3/' : ''}${hash}.pdf-thumb.jpg`;

/** Heyzine flip-books. Add a new comic by appending an object; `cover` is optional. */
export const comics: Comic[] = [
  {
    id: 'ertegi-1',
    title: 'Ертегі — 1',
    category: 'Ертегілер',
    url: 'https://heyzine.com/flip-book/5358fc7756.html',
    cover: thumb('5358fc77562fbdcac25d8e12c7d1327624a7d772'),
  },
  {
    id: 'ertegi-2',
    title: 'Ертегі — 2',
    category: 'Ертегілер',
    url: 'https://heyzine.com/flip-book/f211551d26.html',
    cover: thumb('f211551d264cebb36eeb6d23af5d9049a3407da5'),
  },
  {
    id: 'abai-murasy',
    title: 'Абай мұрасы',
    category: 'Абай шығармалары',
    url: 'https://heyzine.com/flip-book/e0fd2f33c3.html',
    cover: thumb('e0fd2f33c39103e9295d1e14e8dc41fb743c22e1'),
  },
  {
    id: 'abai-17',
    title: 'Абайдың 17-қара сөзі',
    category: 'Абай шығармалары',
    url: 'https://heyzine.com/flip-book/becc9dc77e.html',
  },
  {
    id: 'tarihi-eskertkishter',
    title: 'Тарихи ескерткіштер',
    category: 'Тарихи мұралар',
    url: 'https://heyzine.com/flip-book/941cb5eec1.html',
    cover: thumb('941cb5eec132950d3e53ed2c27d187ec25e5953b', true),
  },
  {
    id: 'mirzhakyp',
    title: 'Міржақып Дулатұлының әңгімесі',
    category: 'Әдеби шығармалар',
    url: 'https://heyzine.com/flip-book/b15779b4ad.html',
    cover: thumb('b15779b4adfe415b4856b677be25e75adc871e15'),
  },
  {
    id: 'aisha-bibi',
    title: 'Айша бибі кесенесі',
    category: 'Тарихи мұралар',
    url: 'https://heyzine.com/flip-book/5c2d906caf.html',
    cover: thumb('5c2d906cafc4fcdc11963dfec15c1a4a02a0c634'),
  },
  {
    id: 'asan-kaigy',
    title: 'Асан Қайғы',
    category: 'Әдеби шығармалар',
    url: 'https://heyzine.com/flip-book/f405d0efce.html',
    cover: thumb('f405d0efce16d0d68db36ff9bd4dc2c2263c13bd', true),
  },
  {
    id: 'speed-problems',
    title: 'Жылдамдыққа арналған есептер',
    category: 'Математикалық комикстер',
    url: 'https://heyzine.com/flip-book/57a945156c.html',
    cover: thumb('57a945156c25208290af1562412f13c8a6752eb0', true),
  },
  {
    id: 'logic-problems',
    title: 'Логикалық есептер',
    category: 'Математикалық комикстер',
    url: 'https://heyzine.com/flip-book/e495f08f69.html',
    cover: thumb('e495f08f697b4b734d0ea6df9f681a6f6c4d159d', true),
  },
];

export const comicById = (id: string) => comics.find((c) => c.id === id);
