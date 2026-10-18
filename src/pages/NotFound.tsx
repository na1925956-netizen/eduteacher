import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { usePageTitle } from '../components/PageHeader';

export default function NotFound() {
  usePageTitle('Бет табылмады');
  return (
    <section className="container-page flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl font-black text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Бет табылмады</h1>
      <p className="mt-2 max-w-md text-slate-500">Сіз іздеген бет жоқ немесе оның мекенжайы өзгерген.</p>
      <Link to="/" className="btn-primary mt-6">
        <Home className="h-4 w-4" aria-hidden /> Басты бетке оралу
      </Link>
    </section>
  );
}
