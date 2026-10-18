import type { WebResource } from './types';

/*
 * Interactive materials. To add a new one, append an object to the matching list.
 * For a local HTML file put it in public/tools/<section>/ and use kind: 'html' with
 * url: 'tools/<section>/<file>.html'.
 */

export const nationalValues: WebResource[] = [
  {
    id: 'nv-values-world',
    title: 'Ұлттық құндылықтар әлемі',
    description:
      'Құндылық, ұлттық құндылық және ұлттық тәрбие туралы интерактивті қазақша ойын. Ұлттық мұраны таны, құндылықтарды бағала!',
    kind: 'link',
    url: 'https://cozy-companion-creator-22.lovable.app',
    image:
      'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/lovp_0x5bmz36zb9zvabrg8rarytcf6/b16554bff81bb153bde59b7c75cf9892_1791901702867.png',
    tags: ['Ойын', 'Ұлттық тәрбие'],
  },
  {
    id: 'nv-kids-game',
    title: 'Ұлттық құндылықтар әлемі: балаларға арналған ойын',
    description:
      'Бастауыш сынып оқушыларына арналған қазақ ұлттық құндылықтары туралы білім ойыны. Білімді бол, ұлттық құндылықтарды таны!',
    kind: 'link',
    url: 'https://exact-screenshot-visual-45.lovable.app',
    image:
      'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/lovp_0zc4qt3p5f9eatvymh9apjk6qb/07924e8382d94d4a78f472ea511f58d2_1791293693581.png',
    tags: ['Ойын', 'Бастауыш сынып'],
  },
  {
    id: 'nv-kyz-kuu',
    title: 'Қыз қуу — әмбебап ойын',
    description:
      'Ұлттық «Қыз қуу» ойыны негізіндегі интерактивті ойын. Мұғалім сұрақтар мен жауап нұсқаларын өзі құрастырып, сабақта қолдана алады.',
    kind: 'link',
    url: 'https://vibe-coding.diaoft.kz/pages/page_69a0393e00cd6.html',
    tags: ['Ұлттық ойын', 'Конструктор'],
  },
];

export const feedbackTools: WebResource[] = [
  {
    id: 'fb-emoji-vote',
    title: 'Кері байланыс: эмодзи дауыс беру',
    description:
      'Оқушылар сабақты қаншалықты түсінгенін үш эмодзи арқылы белгілейді, дауыс беру нәтижесі бірден көрсетіледі.',
    kind: 'link',
    url: 'https://vibe-coding.diaoft.kz/pages/page_6995c46e6f2b0.html',
    tags: ['Эмодзи', 'Рефлексия'],
  },
  {
    id: 'fb-space-assessment',
    title: 'Аспан әлемі бағалауы',
    description:
      'Сынып оқушыларының тізімін енгізіп, «Аспан әлемі» тақырыбында бағалау мен кері байланысты ұйымдастыруға арналған құрал.',
    kind: 'link',
    url: 'https://vibe-coding.diaoft.kz/pages/page_6995ceb3338f8.html',
    tags: ['Бағалау', 'Сынып тізімі'],
  },
  {
    id: 'fb-mimic',
    title: 'Мимикалық жаттығулар',
    description:
      'Камера арқылы орындалатын бет мимикасына арналған жаттығулар жиынтығы. Құрылғы камераға рұқсат сұрайды.',
    kind: 'link',
    url: 'https://vibe-coding.diaoft.kz/pages/page_69a417b01e231.html',
    tags: ['Камера', 'Эмоция'],
  },
];

export const games: WebResource[] = [
  {
    id: 'game-baamboozle',
    title: 'Мұғалімдерге ойын (Baamboozle)',
    description:
      'Жұмбақтар мен логикалық сұрақтардан тұратын 12 сұрақтық командалық ойын. Командалар кезекпен сұрақ таңдап, ұпай жинайды.',
    kind: 'link',
    url: 'https://www.baamboozle.com/game/3766678',
    tags: ['Командалық', 'Жұмбақ'],
  },
  {
    id: 'game-travel',
    title: 'Бірге саяхаттайық',
    description: 'Сұрақтарға дұрыс жауап беріп, саяхатты сәтті аяқтауға арналған интерактивті білім ойыны.',
    kind: 'link',
    url: 'https://vibe-coding.diaoft.kz/pages/page_699adfbd29701.html',
    tags: ['Викторина', 'Саяхат'],
  },
  {
    id: 'game-neuro',
    title: 'Нейродидактикалық жаттығулар',
    description:
      'Бастауыш сынып оқушыларының есте сақтау қабілетін дамытуға бағытталған 14 интерактивті жаттығу: жад торы, сөз тізбегі, карта сәйкестігі және т.б.',
    kind: 'link',
    url: 'https://curious-cog-quest.lovable.app/',
    image:
      'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/dce827e0-26a5-4db2-8eaa-4d197c912a28/id-preview-5ba457bf--a27efd76-b792-4ad1-a20e-9a6850167319.lovable.app-1775054451117.png',
    tags: ['Жад', 'Логика'],
  },
  {
    id: 'game-pyramid',
    title: 'Білім пирамидасы',
    description: 'Бес деңгейден тұратын математикалық ойын: есептерді шешіп, ұпай жинап, пирамиданың шыңына көтеріл.',
    kind: 'link',
    url: 'https://knowledge-pyramid-builder.lovable.app',
    image:
      'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2f46b38b-e188-40b2-8553-cd0ecdd9ab93/id-preview-9fea5217--515d06d0-35a4-4b02-b4a2-7bdcd68bad1a.lovable.app-1775134324470.png',
    tags: ['Математика', 'Деңгейлер'],
  },
  {
    id: 'game-creator-lab',
    title: 'Цифрлық ойын жобалары',
    description:
      'Оқушылардың шығармашылығын дамытатын 6 ойын: сиқырлы ертегіші, пиксельді шеберхана, цифрлық оркестр, кодтау лабиринті және т.б.',
    kind: 'link',
    url: 'https://kid-creator-lab.lovable.app/',
    image:
      'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f3697dd2-0fdf-4746-8168-1291883b9493/id-preview-be208617--4541f955-2591-4b02-bea0-c99846c66396.lovable.app-1774535200055.png',
    tags: ['Шығармашылық', 'Кодтау'],
  },
  {
    id: 'game-quiz-trail',
    title: 'Қызықты цифрлық викторина',
    description:
      'Тақырыпты таңдап, білімді тексер: зат есімді табу, математикалық есептер және табиғат құбылыстары — әр тақырыпта 10 сұрақ.',
    kind: 'link',
    url: 'https://eager-quiz-trail.lovable.app',
    image:
      'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0b79d1f9-90e1-4d3f-81f4-7bbeab1c6ee9/id-preview-6759496a--caa5956a-7202-467b-b898-551e657cb50b.lovable.app-1775050755467.png',
    tags: ['Викторина', 'Қазақ тілі', 'Математика'],
  },
];
