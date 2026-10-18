import PageHeader from '../components/PageHeader';
import LibraryView from '../components/LibraryView';
import { assessmentCategories, materialCategories } from '../data/library';
import { sectionById } from '../data/sections';

export function MaterialsPage() {
  return (
    <>
      <PageHeader
        section={sectionById('materials')}
        title="Дайын материалдар"
        tagline="Мұғалім кітапханасы"
        description="ҚМЖ, презентациялар, жұмыс парақтары, тесттер, есептер жинақтары және әдістемелік материалдар. Файлдарды қарап, жүктеп алыңыз."
      />
      <LibraryView section="materials" categories={materialCategories} />
    </>
  );
}

export function AssessmentPage() {
  return (
    <>
      <PageHeader
        section={sectionById('assessment')}
        title="Аралық бақылау тапсырмалары"
        description="БЖБ, ТЖБ, аралық бақылау, тест тапсырмалары, бағалау критерийлері мен дескрипторлар — сынып пен пән бойынша."
      />
      <LibraryView section="assessment" categories={assessmentCategories} withTerm />
    </>
  );
}
