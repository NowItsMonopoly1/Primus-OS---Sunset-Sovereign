
import React from 'react';
import { Shield, Lock, EyeOff, Server, FileCheck, Globe, Database, Eye } from 'lucide-react';

const Security: React.FC = () => {
  const specs = [
    { title: "AES-256 Encryption", icon: <Lock className="w-5 h-5" />, desc: "All client data is encrypted at rest and in transit using military-grade standards. Keys are rotated every 24 hours." },
    { title: "Zero-Knowledge Ingestion", icon: <EyeOff className="w-5 h-5" />, desc: "We process professional DNA through isolated compute instances. Primus OS engineers never see your raw communication data." },
    { title: "Data Sovereignty", icon: <Database className="w-5 h-5" />, desc: "You retain 100% ownership of your legacy book. We provide a 'Kill Switch' for instant data extraction and wiping." },
    { title: "GLBA Compliance", icon: <Shield className="w-5 h-5" />, desc: "Our data privacy frameworks are mapped directly to the Gramm-Leach-Bliley Act standards for consumer financial information." },
    { title: "SOC-2 Type II Ready", icon: <FileCheck className="w-5 h-5" />, desc: "Built to satisfy the rigorous security audits of top-tier financial institutions and global brokerage networks." },
    { title: "Regulatory Guardrails", icon: <Globe className="w-5 h-5" />, desc: "Our Butler Protocol includes hard-coded 'Deterministic Compliance' modules for Reg-Z and RESPA standards." }
  ];

  return (
    <div className="min-h-screen bg-[#020202] py-24 px-6 relative overflow-hidden">
      <div className="grid-bg fixed inset-0 opacity-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center justify-center p-4 bg-gold/5 border border-gold/20 rounded-full mb-8">
            <Shield className="w-10 h-10 text-gold" />
          </div>
          <h4 className="text-gold font-mono text-[10px] uppercase tracking-[0.8em] mb-6 italic">Institutional Trust Framework</h4>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none mb-10">
            THE SECURITY <br /> <span className="text-white/20">DOCTRINE.</span>
          </h1>
          <p className="text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto italic">
            Privacy isn't a feature; it's our foundational mandate. We protect your professional legacy with the same rigor banks use to protect their vaults.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mb-24">
          {specs.map((s, i) => (
            <div key={i} className="bg-[#0a192f]/50 border border-white/5 p-12 hover:bg-[#0a192f] transition-all group">
              <div className="text-gold mb-8 group-hover:scale-110 transition-transform origin-left">
                 {s.icon}
              </div>
              <h3 className="text-white font-black uppercase tracking-tighter text-xl mb-4 italic">{s.title}</h3>
              <p className="text-white/30 text-xs leading-relaxed font-light italic">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Technical Schematic Block */}
        <div className="mt-24 p-16 bg-[#050505] border border-white/5 relative overflow-hidden group">
           <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none"></div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 italic">The Data Sovereignty <br/> Guarantee.</h2>
                 <p className="text-white/40 text-sm leading-relaxed mb-8 italic">
                   Unlike standard SaaS platforms, you own the "Linguistic Model" we train for you. If you choose to leave the Primus ecosystem, your digital twin logic is yours to take. Your intellectual property never becomes our leverage.
                 </p>
                 <div className="flex space-x-8 opacity-20">
                    <span className="text-[10px] font-black italic border border-white px-4 py-2">AES-256</span>
                    <span className="text-[10px] font-black italic border border-white px-4 py-2">TLS 1.3</span>
                    <span className="text-[10px] font-black italic border border-white px-4 py-2">SOC-2</span>
                 </div>
              </div>
              <div className="relative">
                 <div className="aspect-square border border-white/5 flex flex-col items-center justify-center p-12 bg-black/40 backdrop-blur-xl relative">
                    <div className="absolute inset-4 border border-gold/10 animate-pulse"></div>
                    <div className="w-20 h-20 border border-gold flex items-center justify-center mb-6">
                       <Shield className="w-10 h-10 text-gold" />
                    </div>
                    <span className="text-gold font-mono text-[9px] uppercase tracking-[0.4em] mb-4 italic font-black">Encrypted Silo Locked</span>
                    <div className="w-full space-y-2 px-10">
                       <div className="h-0.5 bg-gold/20 w-full"></div>
                       <div className="h-0.5 bg-gold/20 w-3/4"></div>
                       <div className="h-0.5 bg-gold/20 w-1/2"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-24 text-center border-t border-white/5 pt-16">
           <p className="text-[10px] font-mono text-white/10 uppercase tracking-[0.4em] italic mb-10">
             Audit-Ready Compliance • Financial Privacy Standard
           </p>
           <div className="flex justify-center space-x-12 opacity-30 grayscale hover:grayscale-0 transition-all mb-16">
              <span className="text-xl font-black text-white italic tracking-tighter">GOOGLE CLOUD</span>
              <span className="text-xl font-black text-white italic tracking-tighter">VANTA</span>
              <span className="text-xl font-black text-white italic tracking-tighter">AUTH0</span>
           </div>
           <button className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white border-b border-white/10 pb-2 transition-all italic">
             Request Formal Security Whitepaper &rarr;
           </button>
        </div>
      </div>
    </div>
  );
};

export default Security;
