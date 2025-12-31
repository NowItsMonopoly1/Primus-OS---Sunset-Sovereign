
import React from 'react';
import { Link } from 'react-router-dom';

const StrategicBriefing: React.FC = () => {
  const sections = [
    {
      title: "01. The Sunset Protocol (Home)",
      subtitle: "The Brand Promise",
      desc: "Our primary interface isn't a tool—it's an exit strategy. We position the platform as 'Invisible Infrastructure' that turns a $300M pipeline into an autonomous annuity.",
      features: ["Legacy Monetization focus", "Live Bird Dog Feed", "Bird Dog Alert Widget"]
    },
    {
      title: "02. The Continuity Cliff (Audit)",
      subtitle: "The Business Case",
      desc: "We use hard data to prove the vulnerability of unmanaged attrition. This page quantifies the 'Billions at Risk' to force institutional decision-making.",
      features: ["Interactive Risk Calculator", "Retention Curve Projections", "Institutional Vulnerability Index"]
    },
    {
      title: "03. The Bird Dog & Butler (Platform)",
      subtitle: "The Intelligence Core",
      desc: "This section explains how our agents operate. The 'Bird Dog' finds the money; the 'Butler' maintains the relationship safely.",
      features: ["Autonomous Ingestion", "Linguistic DNA Cloning", "Compliance-First Execution"]
    },
    {
      title: "04. The Autonomous Ledger (Dashboard)",
      subtitle: "The Invisible UI",
      desc: "A high-fidelity spreadsheet interface that senior brokers already know how to use. It provides the proof of work without the learning curve.",
      features: ["Excel-Native UX", "Shadow Briefing Column", "Live Protocol Telemetry"]
    },
    {
      title: "05. Investment Structure (Pricing)",
      subtitle: "The Asset Management Model",
      desc: "We present costs as CapEx and OpEx investments rather than SaaS tiers. This ensures the broker sees the 'Build' and 'Maintain' phases clearly.",
      features: ["Legacy Audit Setup Fee", "Protocol Retainer (OpEx)", "Data Sovereignty Guarantee"]
    },
    {
      title: "06. G2R™ Methodology (Roadmap)",
      subtitle: "The Strategic Rollout",
      desc: "The 4-phase plan from Growth to Retirement. This ensures the broker knows exactly how we take them from 'Primary Producer' to 'Passive Stakeholder'.",
      features: ["Phased Execution Plan", "Asset Stabilization", "Final Exit Readiness"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020202] py-24 px-6 relative overflow-hidden">
      <div className="grid-bg fixed inset-0 opacity-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-24">
          <h4 className="text-gold font-mono text-[10px] uppercase tracking-[0.8em] mb-6 italic">Strategic Partner Briefing</h4>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none mb-10">
            THE LEAVE-BEHIND <br /> <span className="text-white/20">BLUEPRINT.</span>
          </h1>
          <p className="text-xl text-white/40 font-light leading-relaxed max-w-2xl italic">
            A comprehensive architectural breakdown of the Sunset Protocol. Use this to explain the mechanics of the "Shadow Partner" to your board or primary stakeholders.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {sections.map((s, i) => (
            <div key={i} className="group bg-[#0a192f]/50 border border-white/5 p-12 hover:bg-[#0a192f] transition-all duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="lg:w-2/3">
                  <h3 className="text-white font-black text-3xl uppercase tracking-tighter mb-2 italic group-hover:text-gold transition-colors">{s.title}</h3>
                  <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-6 italic">{s.subtitle}</p>
                  <p className="text-white/40 text-lg font-light leading-relaxed mb-8 italic">
                    {s.desc}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {s.features.map((f, j) => (
                      <span key={j} className="px-4 py-1.5 bg-white/5 border border-white/5 text-[9px] text-white/30 uppercase tracking-widest font-bold">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="lg:w-1/3 flex lg:justify-end">
                   <Link 
                    to={i === 0 ? '/' : i === 1 ? '/crisis' : i === 2 ? '/platform' : i === 3 ? '/dashboard' : i === 4 ? '/pricing' : '/g2r'}
                    className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all border-b border-white/10 pb-2 italic"
                   >
                     View Section &rarr;
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 p-16 bg-gold/5 border border-gold/20 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6 italic">Ready for Institutional Deployment?</h2>
           <p className="text-white/40 mb-10 max-w-xl mx-auto italic">
             The Sunset Protocol is ready to stabilize your brokerage's production. Initialize your first pilot today.
           </p>
           <Link to="/onboarding" className="btn-primary inline-block px-20 italic font-black">Initialize System</Link>
        </div>
      </div>
    </div>
  );
};

export default StrategicBriefing;
