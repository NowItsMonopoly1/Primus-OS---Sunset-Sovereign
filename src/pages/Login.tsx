import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, CheckCircle, Fingerprint } from 'lucide-react';

const Login: React.FC = () => {
  const [stage, setStage] = useState<'init' | 'biometric' | 'granted'>('init');
  const navigate = useNavigate();

  useEffect(() => {
    // Animation sequence: System Init → Biometric → Access Granted → Dashboard
    const timer1 = setTimeout(() => setStage('biometric'), 1500);
    const timer2 = setTimeout(() => setStage('granted'), 3000);
    const timer3 = setTimeout(() => navigate('/dashboard'), 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1F24] flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md">
        
        {/* Security Theatre Container */}
        <div className="bg-[#222831] border border-[#353C45] rounded-sm p-12 text-center">
          
          {/* Logo/Shield */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 border-2 border-[#C6A45E]/40 flex items-center justify-center bg-[#C6A45E]/5 rounded-sm">
              {stage === 'init' && <Shield className="w-10 h-10 text-[#C6A45E] animate-pulse" />}
              {stage === 'biometric' && <Fingerprint className="w-10 h-10 text-[#C6A45E] animate-pulse" />}
              {stage === 'granted' && <CheckCircle className="w-10 h-10 text-[#4A9E88]" />}
            </div>
          </div>

          {/* Brand Hierarchy */}
          <div className="mb-8">
            <h1 className="text-2xl font-black tracking-[0.25em] text-white leading-none uppercase mb-2 font-['Inter']">
              SOLOSCALE
            </h1>
            <p className="text-xs font-mono text-[#C6A45E]/60 tracking-[0.15em] uppercase">
              POWERED BY PRIMUS OS
            </p>
          </div>

          {/* Status Messages */}
          <div className="space-y-4 min-h-[80px] flex flex-col justify-center">
            {stage === 'init' && (
              <div className="animate-fadeIn">
                <p className="text-base text-[#E6E8EB] font-semibold mb-2">System Initialization</p>
                <p className="text-sm text-[#B4BAC2]">Establishing secure connection...</p>
              </div>
            )}

            {stage === 'biometric' && (
              <div className="animate-fadeIn">
                <p className="text-base text-[#E6E8EB] font-semibold mb-2">Verifying Biometrics</p>
                <p className="text-sm text-[#B4BAC2]">Authenticating identity matrix...</p>
                <div className="flex justify-center mt-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#C6A45E] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#C6A45E] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#C6A45E] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {stage === 'granted' && (
              <div className="animate-fadeIn">
                <p className="text-base text-[#4A9E88] font-semibold mb-2">Access Granted</p>
                <p className="text-sm text-[#B4BAC2]">Loading continuity protocols...</p>
              </div>
            )}
          </div>

          {/* Security Footer */}
          <div className="mt-12 pt-6 border-t border-[#353C45]">
            <div className="flex items-center justify-center space-x-2 text-xs text-[#7A828C]">
              <Lock className="w-3 h-3" />
              <span className="font-mono uppercase tracking-wider">256-BIT ENCRYPTED SESSION</span>
            </div>
          </div>

        </div>

        {/* Compliance Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-[#7A828C] font-mono uppercase tracking-wider">
            SOC 2 TYPE II CERTIFIED • FINRA COMPLIANT
          </p>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;
