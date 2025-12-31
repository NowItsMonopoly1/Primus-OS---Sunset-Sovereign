
import React from 'react';
import { Check, Shield, Activity, Fingerprint, Lock, Scale, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020202] py-24 px-6 relative overflow-hidden">
      <div className="grid-bg fixed inset-0 opacity-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-24">
          <h4 className="text-gold font-mono text-[10px] uppercase tracking-[0.8em] mb-6 italic">Fiscal Architecture</h4>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none mb-10">
            INVESTMENT <br /> <span className="text-white/20">STRUCTURE.</span>
          </h1>
          <p className="text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto italic">
            We operate on a transparent Fee-for-Service model to ensure full compliance and maximize your retirement equity.
          </p>
        </div>

        <div className="space-y-12">
          {/* PHASE 1: THE BUILD (CapEx) */}
          <div className="group bg-[#0a192f]/50 border border-white/5 rounded-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Cost Center */}
              <div className="lg:col-span-4 p-12 bg-black/40 border-r border-white/5 flex flex-col justify-center">
                <span className="text-gold font-mono text-[10px] uppercase tracking-widest mb-4 italic">Phase 01: Onboarding</span>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6">The Legacy Audit</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-black text-white tracking-tighter">$9,800</span>
                  <span className="ml-3 text-white/20 text-xs font-bold uppercase tracking-widest">Setup Fee</span>
                </div>
                <p className="text-white/30 text-xs leading-relaxed italic">
                  A intensive 30-day architectural sprint to digitize your professional voice and data infrastructure.
                </p>
              </div>

              {/* Scope of Work */}
              <div className="lg:col-span-8 p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Fingerprint className="w-4 h-4 text-gold" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">Linguistic DNA Extraction</h4>
                    </div>
                    <p className="text-white/40 text-xs font-light leading-relaxed italic">
                      Ingestion of 5+ years of communication history to map your syntax, cadence, and personal relationship markers.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Activity className="w-4 h-4 text-gold" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">Database Sanitation</h4>
                    </div>
                    <p className="text-white/40 text-xs font-light leading-relaxed italic">
                      Professional-grade cleaning and formatting of your client records for the Autonomous Ledger logic.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Scale className="w-4 h-4 text-gold" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">Compliance Guardrail Setup</h4>
                    </div>
                    <p className="text-white/40 text-xs font-light leading-relaxed italic">
                      Custom logic configuration of the Butler Protocol to adhere to strict regulatory standards (Reg Z/RESPA).
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="w-4 h-4 text-gold" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">Institutional Integration</h4>
                    </div>
                    <p className="text-white/40 text-xs font-light leading-relaxed italic">
                      Hard-sync with your existing CRM and marketing tech stack for seamless background operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHASE 2: THE PROTOCOL (OpEx) */}
          <div className="group bg-[#0a192f]/50 border border-gold/20 rounded-sm overflow-hidden relative shadow-[0_0_50px_rgba(212,175,55,0.05)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.5)]"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Cost Center */}
              <div className="lg:col-span-4 p-12 bg-gold/[0.03] border-r border-white/5 flex flex-col justify-center">
                <span className="text-gold font-mono text-[10px] uppercase tracking-widest mb-4 italic">Phase 02: Continuity</span>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6">Protocol Retainer</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-black text-white tracking-tighter">$1,500</span>
                  <span className="ml-3 text-gold text-xs font-bold uppercase tracking-widest">/ Month</span>
                </div>
                <p className="text-white/30 text-xs leading-relaxed italic">
                  Recurring operational support for your autonomous legacy infrastructure.
                </p>
              </div>

              {/* Scope of Work */}
              <div className="lg:col-span-8 p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Activity className="w-4 h-4 text-gold" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">The Bird Dog (24/7 Scan)</h4>
                    </div>
                    <p className="text-white/40 text-xs font-light leading-relaxed italic">
                      Continuous intent detection scanning across your entire book. Identifying market opportunities in real-time.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Lock className="w-4 h-4 text-gold" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">Data Sovereignty Guaranteed</h4>
                    </div>
                    <p className="text-white/40 text-xs font-light leading-relaxed italic">
                      You own the database and the AI model. Your intellectual capital remains your institutional asset.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="w-4 h-4 text-gold" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">Shadow Twin Maintenance</h4>
                    </div>
                    <p className="text-white/40 text-xs font-light leading-relaxed italic">
                      Ongoing refinement of your digital shadow's voice to ensure perfect fidelity as market conditions shift.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Scale className="w-4 h-4 text-gold" />
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">Liability Shielding</h4>
                    </div>
                    <p className="text-white/40 text-xs font-light leading-relaxed italic">
                      Human-in-the-loop verification for all complex queries. We protect your license while you enjoy your legacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 p-16 bg-[#0a192f] border border-white/5 text-center relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 group-hover:bg-gold transition-colors"></div>
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 italic">Begin the Legacy Audit</h2>
           <p className="text-white/40 mb-12 max-w-xl mx-auto italic">
             The Sunset Protocol is a software licensing agreement. We do not participate in loan commissions, ensuring 100% compliance with institutional standards.
           </p>
           <button 
             onClick={() => navigate('/onboarding')}
             className="btn-primary px-20 italic font-black shadow-[0_0_30px_rgba(212,175,55,0.1)]"
           >
             Initialize Audit &rarr;
           </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-mono text-white/10 uppercase tracking-[0.4em] italic">
            Institutional Pricing | SOC-2 | GLBA | RESPA Compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
