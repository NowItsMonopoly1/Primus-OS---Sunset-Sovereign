import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Onboarding from '../pages/Onboarding';
import Approvals from '../pages/Approvals';
import Strategy from './pages/Strategy';
import Vault from './pages/Vault';
import ContinuitySignalsPage from './pages/ContinuitySignalsPage';
import { AuthProvider } from './contexts/AuthContext';

// Placeholder for missing modules (Crisis Mode)
const ComingSoon = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-[#1A1F24] flex flex-col items-center justify-center text-[#E6E8EB]">
    <h1 className="text-2xl font-bold text-[#C6A45E] mb-2">{title}</h1>
    <p className="text-[#B4BAC2]">Module initialization pending execution.</p>
    <p className="text-[#7A828C] text-sm mt-4">Restricted Access: Phase 3 Deployment</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] font-sans">
          {/* Navigation Ribbon */}
          <Header />
          
          <Routes>
            {/* 1. Landing / Login */}
            <Route path="/" element={<Home />} />
            
            {/* 2. The Ledger (Core) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ledger" element={<Navigate to="/dashboard" replace />} />
            
            {/* 3. The Governor (Approvals) */}
            <Route path="/approvals" element={<Approvals />} />
            
            {/* 4. Strategy Engine (The Sunset Protocol) */}
            <Route path="/strategy" element={<Strategy />} />
            
            {/* 5. Secure Vault (Asset Storage) */}
            <Route path="/vault" element={<Vault />} />
            
            {/* 6. Continuity Signals (Heartbeat Engine) */}
            <Route path="/signals" element={<ContinuitySignalsPage />} />
            
            {/* 7. Onboarding (Data Ingestion) */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* 8. Placeholders / Fallbacks */}
            <Route path="/crisis" element={<ComingSoon title="Crisis Succession Mode" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
