import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Visualizer from '../components/Visualizer';
import ContinuityCalculator from '../components/ContinuityCalculator';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-[#020202] min-h-screen selection:bg-gold/30">
      <div className="grid-bg fixed inset-0 opacity-10 pointer-events-none"></div>

      {/* HERO SECTION - THE INSTITUTIONAL SHIELD */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <Visualizer />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#020202] z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-4 mb-8">
            <span className="text-gold font-mono text-[9px] uppercase tracking-[1em] animate-pulse italic">Autonomous Succession Standard</span>
          </div>
          
          <h1 className="text-6xl md:text-[8.5rem] font-black text-white leading-[0.8] mb-12 tracking-tighter uppercase italic">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-white/80 to-gold">INSTITUTIONAL</span> <br />
            SHIELD.
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl text-white/40 mb-16 font-light leading-relaxed tracking-tight">
            Don't let your top producers retire with <strong>your assets</strong>. Primus OS digitizes, secures, and autonomously transitions books of business—turning agent attrition into perpetual revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            <button 
              onClick={() => navigate('/onboarding')}
              className="btn-primary px-20 py-7 text-base shadow-[0_0_60px_rgba(212,175,55,0.2)] hover:scale-105 transition-transform italic"
            >
              Deploy for Enterprise
            </button>
            <Link to="/crisis" className="text-base font-bold uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all border-b border-gold/20 pb-2 italic">
              View Succession Crisis Report &rarr;
            </Link>
          </div>
        </div>

        {/* Floating "Strategic Intent" Widget */}
        <div className="absolute bottom-20 right-10 hidden xl:block animate-in slide-in-from-bottom-20 duration-1000 delay-500">
           <div className="glass-card p-8 border border-gold/20 w-96 shadow-2xl relative">
              <div className="absolute -top-3 -left-3 bg-gold text-black text-[9px] font-black px-3 py-1.5 uppercase tracking-widest italic shadow-xl">Continuity Engine Alert</div>
              <div className="flex justify-between items-center mb-6 mt-3">
                 <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Row ID: PR-9012 • Legacy Sync: 98%</span>
                 </div>
              </div>
              <p className="text-xs text-white leading-relaxed italic mb-6 font-light border-l-2 border-gold/40 pl-4">
                "⛔ **Refi Trap Avoided.** Rate is 2.8%. Pushing HELOC bridge to successor for remodel intent. Junior Partner handoff ready."
              </p>
              <div className="flex justify-between items-center border-t border-white/5 pt-5">
                 <span className="text-[10px] text-gold font-black uppercase tracking-widest">Protocol: NUANCE_AUTOMATOR</span>
                 <span className="text-[9px] text-white/20 uppercase font-mono tracking-tighter underline cursor-pointer hover:text-white transition-colors">Inspect Logic</span>
              </div>
           </div>
        </div>
      </section>

      {/* THE PROBLEM/SOLUTION BLOCK */}
      <section className="py-40 px-6 relative bg-black overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 grid-bg opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
            <div>
              <h2 className="text-xs font-bold text-gold uppercase tracking-[0.6em] mb-10 italic">The $1 Trillion Cliff.</h2>
              <h3 className="text-6xl font-black text-white uppercase tracking-tighter mb-10 italic leading-[0.9]">
                70% of producers have <br/> <span className="text-white/20">no plan.</span>
              </h3>
              <p className="text-xl text-white/40 font-light leading-relaxed italic mb-12">
                When they leave, your volume leaves with them. The manual handoff is broken. Primus clones operational intelligence, ensuring your brand stays the primary relationship holder.
              </p>
              <div className="flex items-center space-x-12 opacity-40 grayscale">
                 <span className="text-xs font-black italic border border-white px-6 py-3 tracking-[0.2em]">SOC-2 READY</span>
                 <span className="text-xs font-black italic border border-white px-6 py-3 tracking-[0.2em]">GLBA COMPLIANT</span>
              </div>
            </div>
            
            <div className="space-y-16">
               <div className="border-l border-gold/30 pl-10">
                  <h4 className="text-white font-black uppercase tracking-widest text-lg italic mb-4">Asset Retention</h4>
                  <p className="text-white/40 text-sm leading-relaxed italic">Retain 90% of a retiring agent's book within your ecosystem. Stop the bleed to competitors through autonomous relationship maintenance.</p>
               </div>
               <div className="border-l border-gold/30 pl-10">
                  <h4 className="text-white font-black uppercase tracking-widest text-lg italic mb-4">Recruiting Edge</h4>
                  <p className="text-white/40 text-sm leading-relaxed italic">Attract top talent by offering the industry's only guaranteed, autonomous exit strategy. Turn your brokerage into a career-long annuity.</p>
               </div>
               <div className="border-l border-gold/30 pl-10">
                  <h4 className="text-white font-black uppercase tracking-widest text-lg italic mb-4">Perpetual Revenue</h4>
                  <p className="text-white/40 text-sm leading-relaxed italic">Turn 'former' agents into passive stakeholders. The Engine works; everyone gets paid. The institutional memory never fades.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR SECTION */}
      <section className="py-40 px-6 relative bg-[#020202] overflow-hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto relative z-10 text-center mb-24">
           <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.6em] mb-6 italic">Fiscal Analysis</h3>
           <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Quantify Your <span className="text-white/20">Retention Lift.</span></h2>
        </div>
        <div className="max-w-7xl mx-auto">
          <ContinuityCalculator />
        </div>
      </section>

      {/* THE "HOW IT WORKS" TRIPTYCH */}
      <section className="py-40 px-6 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { step: "INGEST", title: "Institutional Sync", desc: "We analyze the agent's history, communication patterns, and client nuance through the Linguistic Lab." },
                { step: "CLONE", title: "Zeta Digital Twin", desc: "We synthesize the agent's voice and logic into an autonomous shadow agent that maintains the legacy book." },
                { step: "DEPLOY", title: "Autonomous Transition", desc: "The OS manages the daily relationship handoff to the Successor, securing the asset for the enterprise." }
              ].map((item, i) => (
                <div key={i} className="group">
                  <span className="text-gold font-mono text-[9px] font-black uppercase tracking-[0.5em] mb-6 block italic">Step 0{i+1}: {item.step}</span>
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-6 group-hover:text-gold transition-colors">{item.title}</h4>
                  <p className="text-white/30 text-sm leading-relaxed italic font-light">{item.desc}</p>
                  <div className="mt-10 h-1 bg-white/5 w-20 group-hover:w-full transition-all duration-700"></div>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
