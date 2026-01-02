import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import { CleanClientData } from './utils/csvIngestor';

// Lazy load heavy components
const Home = lazy(() => import('./pages/Home'));
const Platform = lazy(() => import('./pages/Platform'));
const Partners = lazy(() => import('./pages/Partners'));
const Crisis = lazy(() => import('./pages/Crisis'));
const About = lazy(() => import('./pages/About'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const ShieldDeck = lazy(() => import('./pages/ShieldDeck'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const G2R = lazy(() => import('./pages/G2R'));
const StrategicBriefing = lazy(() => import('./pages/StrategicBriefing'));
const Pricing = lazy(() => import('./pages/Pricing'));
const SuccessorBridge = lazy(() => import('./pages/SuccessorBridge'));
const Security = lazy(() => import('./pages/Security'));
const ApprovalsPage = lazy(() => import('./src/pages/ApprovalsPage'));
const ContinuitySignalsPage = lazy(() => import('./src/pages/ContinuitySignalsPage'));
const DraftComposerPage = lazy(() => import('./src/pages/DraftComposerPage'));
const Strategy = lazy(() => import('./src/pages/Strategy'));
const Outcomes = lazy(() => import('./src/pages/Outcomes'));
const ComingSoon = lazy(() => import('./src/components/ComingSoon'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const [ledgerData, setLedgerData] = useState<CleanClientData[]>([]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#020202] selection:bg-gold selection:text-black">
        <ScrollToTop />
        <Header />
        <main className="flex-grow pt-20">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/platform" element={<ComingSoon />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/crisis" element={<Crisis />} />
              <Route path="/about" element={<About />} />
              <Route 
                path="/onboarding" 
                element={<Onboarding setLedgerData={setLedgerData} />} 
              />
              <Route path="/shield-deck" element={<ShieldDeck />} />
              <Route 
                path="/dashboard" 
                element={<Dashboard data={ledgerData} />} 
              />
              <Route path="/g2r" element={<G2R />} />
              <Route path="/briefing" element={<StrategicBriefing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/bridge" element={<SuccessorBridge />} />
              <Route path="/security" element={<ComingSoon />} />
              <Route path="/continuity-signals" element={<ContinuitySignalsPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="/compose/:id" element={<DraftComposerPage />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/outcomes" element={<Outcomes />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
