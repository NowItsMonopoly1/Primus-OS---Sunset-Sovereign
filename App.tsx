import React, { useEffect, useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import { CleanClientData } from './utils/csvIngestor';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

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
const Vault = lazy(() => import('./src/pages/Vault'));
const Login = lazy(() => import('./src/pages/Login'));
const ComingSoon = lazy(() => import('./src/components/ComingSoon'));

// Protected Route wrapper - BYPASSED FOR TESTING
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth bypass - always allow access
  return <>{children}</>;
};

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
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#020202] selection:bg-gold selection:text-black">
          <ScrollToTop />
          <Header />
          <main className="flex-grow pt-20">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/platform" element={<ComingSoon />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/crisis" element={<Crisis />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/shield-deck" element={<ShieldDeck />} />
                
                {/* Protected routes */}
                <Route 
                  path="/onboarding" 
                  element={
                    <ProtectedRoute>
                      <Onboarding setLedgerData={setLedgerData} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard data={ledgerData} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vault" 
                  element={
                    <ProtectedRoute>
                      <Vault />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vault" 
                  element={
                    <ProtectedRoute>
                      <Vault />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/security" 
                  element={<Navigate to="/vault" replace />}
                />
                <Route 
                  path="/signals" 
                  element={
                    <ProtectedRoute>
                      <ContinuitySignalsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/continuity-signals" 
                  element={<Navigate to="/signals" replace />}
                />
                <Route 
                  path="/approvals" 
                  element={
                    <ProtectedRoute>
                      <ApprovalsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/compose/:id" 
                  element={
                    <ProtectedRoute>
                      <DraftComposerPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/strategy" 
                  element={
                    <ProtectedRoute>
                      <Strategy />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/outcomes" 
                  element={
                    <ProtectedRoute>
                      <Outcomes />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/g2r" element={<G2R />} />
                <Route path="/briefing" element={<StrategicBriefing />} />
                <Route path="/bridge" element={<SuccessorBridge />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
