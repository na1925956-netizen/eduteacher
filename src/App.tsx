import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import { LoadingState } from './components/ui';
import Home from './pages/Home';
import { AuthProvider } from './services/auth';

// Section pages are code-split and loaded on demand
const ComicsPage = lazy(() => import('./pages/Comics'));
const ComicReader = lazy(() => import('./pages/ComicReader'));
const ToolsPage = lazy(() => import('./pages/Tools'));
const MaterialViewer = lazy(() => import('./pages/MaterialViewer'));
const AdminPage = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const NationalValuesPage = lazy(() => import('./pages/ResourcePages').then((m) => ({ default: m.NationalValuesPage })));
const FeedbackPage = lazy(() => import('./pages/ResourcePages').then((m) => ({ default: m.FeedbackPage })));
const GamesPage = lazy(() => import('./pages/ResourcePages').then((m) => ({ default: m.GamesPage })));
const MaterialsPage = lazy(() => import('./pages/LibraryPages').then((m) => ({ default: m.MaterialsPage })));
const AssessmentPage = lazy(() => import('./pages/LibraryPages').then((m) => ({ default: m.AssessmentPage })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
      <MotionConfig reducedMotion="user">
        <ScrollToTop />
        <a href="#main" className="sr-only z-50 rounded-lg bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Негізгі мазмұнға өту
        </a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main" className="flex-1">
            <Suspense fallback={<LoadingState />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/national-values" element={<NationalValuesPage />} />
                <Route path="/comics" element={<ComicsPage />} />
                <Route path="/comics/:id" element={<ComicReader />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/materials" element={<MaterialsPage />} />
                <Route path="/assessment" element={<AssessmentPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/view/:id" element={<MaterialViewer />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </MotionConfig>
      </AuthProvider>
    </HashRouter>
  );
}
