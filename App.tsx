import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Platform from './pages/Platform';
import Partners from './pages/Partners';
import Crisis from './pages/Crisis';
import About from './pages/About';
import Onboarding from './pages/Onboarding';
import ShieldDeck from './pages/ShieldDeck';
import Dashboard from './pages/Dashboard';
import G2R from './pages/G2R';
import StrategicBriefing from './pages/StrategicBriefing';
import Pricing from './pages/Pricing';
import SuccessorBridge from './pages/SuccessorBridge';
import Security from './pages/Security';
import Header from './components/Header';
import Footer from './components/Footer';
import { CleanClientData } from './utils/csvIngestor';

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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/platform" element={<Platform />} />
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
            <Route path="/security" element={<Security />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
