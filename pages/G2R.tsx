
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Visualizer from '../components/Visualizer';

const G2R: React.FC = () => {
  const navigate = useNavigate();

  const phases = [
    { 
      id: "01", 
      name: "Revenue First", 
      focus: "Lead Generation", 
      desc: "Increase revenue to establish a strong financial foundation. We deploy the Primus Outreach protocols to maximize current book yield." 
    },
    { 
      id: "02", 
      name: "Visibility Second", 
      focus: "Brand Presence", 
      desc: "Enhance brand presence and attract potential buyers and top-tier partners through automated, high-fidelity communication." 
    },
    { 
      id: "03", 
      name: "Systems Third", 
      focus: "Operational Scalability", 
      desc: "Implement the Primus OS to ensure efficient operations, producing a sellable operating model that reduces reliance on the owner." 
    },
    { 
      id: "04", 
      name: "Exit Readiness Last", 
      focus: "Seamless Transition", 
      desc: "Prepare the business for a final handoff, maximizing exit options by proving the 'Shadow Twin' can sustain the volume." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#020202] py-24 relative overflow-hidden">
      <div className="grid-bg fixed inset-0 opacity-5 pointer-events-none"></div>
      <Visualizer />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <div className="inline-flex items-center space-x-4 mb-8">
            <span className="text-gold font-mono text-[10px] uppercase tracking-[0.5em]">The Strategic Path</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-10 italic">
            Growth to <br /> <span className="text-gold">Retirement™</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-white/40 font-light leading-relaxed">
            A proprietary 4-phase methodology designed to turn individual production into an institutional asset. Secure your exit. Protect your legacy.
          </p>
        </div>

        {/* The Challenge Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-40 items-center">
          <div className="glass-card p-12 border-l-4 border-l-gold">
            <h3 className="text-white font-bold text-2xl uppercase tracking-tight mb-6">The Challenge</h3>
            <p className="text-white/50 leading-relaxed font-light text-lg">
              Professionals approaching retirement often face a critical dilemma: high production levels with significant owner dependency and a lack of viable exit strategies. This scenario results in limited options for transferring ownership while maintaining business value.
            </p>
          </div>
          <div className="flex flex-col space-y-8">
            <div className="flex items-start space-x-6">
               <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold font-bold">!</div>
               <p className="text-white/30 text-sm font-mono uppercase tracking-widest leading-loose">High Owner Dependency = <br/> Valuation Leakage</p>
            </div>
            <div className="flex items-start space-x-6">
               <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 font-bold">?</div>
               <p className="text-white/30 text-sm font-mono uppercase tracking-widest leading-loose">No viable exit strategy = <br/> Asset Obsolescence</p>
            </div>
          </div>
        </div>

        {/* The 4 Phases */}
        <div className="mb-40">
           <h3 className="text-center text-white font-black text-3xl uppercase tracking-widest mb-20 italic">The Methodology</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {phases.map((p) => (
                <div key={p.id} className="glass-card p-8 border border-white/5 group hover:border-gold/30 transition-all">
                  <div className="text-4xl font-black text-white/5 mb-6 group-hover:text-gold/20 transition-colors">{p.id}</div>
                  <h4 className="text-white font-bold text-lg mb-2 uppercase tracking-tight">{p.name}</h4>
                  <div className="text-gold text-[9px] font-mono uppercase tracking-widest mb-6">{p.focus}</div>
                  <p className="text-white/30 text-sm leading-relaxed font-light">{p.desc}</p>
                </div>
              ))}
           </div>
        </div>

        {/* ROI Section */}
        <div className="bg-[#0a192f] p-16 border border-white/5 mb-40 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-10 text-8xl font-black text-white italic">ROI</div>
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20">
              <div>
                <h3 className="text-white font-bold text-2xl uppercase tracking-tighter mb-8">What This Delivers</h3>
                <ul className="space-y-6">
                   <li className="flex items-center space-x-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 bg-gold"></div>
                      <span>Predictable Income: Secure consistent revenue streams.</span>
                   </li>
                   <li className="flex items-center space-x-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 bg-gold"></div>
                      <span>Reduced Owner Involvement: Minimize daily operations.</span>
                   </li>
                   <li className="flex items-center space-x-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 bg-gold"></div>
                      <span>Operational Clarity: Efficient business processes.</span>
                   </li>
                   <li className="flex items-center space-x-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 bg-gold"></div>
                      <span>Optional Succession Paths: Flexible strategies.</span>
                   </li>
                </ul>
              </div>
              <div className="flex flex-col justify-center">
                 <button 
                  onClick={() => navigate('/crisis')}
                  className="btn-primary w-full py-6 text-sm mb-6"
                 >
                   Run Assessment (Phase 1)
                 </button>
                 <p className="text-white/20 text-[10px] uppercase font-mono tracking-widest text-center italic">
                   "Commitment to providing a strategic path for professionals."
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default G2R;
