
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-6 mb-32 text-center">
        <h1 className="text-xs font-bold text-gold uppercase tracking-[0.5em] mb-4">Our Mission</h1>
        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter uppercase mb-8">The Institutional Shield</h2>
        <p className="text-2xl text-white/70 font-light leading-relaxed mb-12 italic">
          "We are building the shield for institutional legacy preservation."
        </p>
        <p className="text-lg text-white/50 leading-relaxed font-light text-left md:text-center">
          Primus OS was founded to solve a critical vulnerability: high-value professional services are built on the fragile foundations of individual relationships. When those individuals evolve or transition, the institution bleeds. Our mission is to institutionalize that value through digital intelligence, ensuring that the legacy of every producer becomes the permanent asset of the enterprise.
        </p>
      </div>

      <div className="bg-[#080808] py-32">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
               <div>
                  <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em] mb-8">Leadership</h3>
                  <div className="space-y-12">
                     <div className="group border-b border-white/10 pb-8 hover:border-gold/50 transition-colors">
                        <h4 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">ALEXANDER VAUGHN</h4>
                        <p className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Chief Executive & Founder</p>
                        <p className="text-white/40 text-sm leading-relaxed">Two decades of enterprise architecture in fintech and real estate scaling. Dedicated to systemic market stability.</p>
                     </div>
                     <div className="group border-b border-white/10 pb-8 hover:border-gold/50 transition-colors">
                        <h4 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">DR. ELARA VANCE</h4>
                        <p className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Head of Cognitive Computing</p>
                        <p className="text-white/40 text-sm leading-relaxed">Pioneer in behavioral AI and linguistic cloning for professional services continuity.</p>
                     </div>
                  </div>
               </div>
               
               <div className="glass-card p-12 rounded-lg flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-gold uppercase tracking-[0.4em] mb-6">Our Core Philosophy</h3>
                  <ul className="space-y-8">
                    <li>
                      <h5 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Relentless Security</h5>
                      <p className="text-white/40 text-sm">Data is the most valuable asset in the world. We treat it with institutional reverence.</p>
                    </li>
                    <li>
                      <h5 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Cognitive Fidelity</h5>
                      <p className="text-white/40 text-sm">Our technology clones the professional logic and voice that defines the producer's value.</p>
                    </li>
                    <li>
                      <h5 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Legacy Stability</h5>
                      <p className="text-white/40 text-sm">Succession is a strategic long-game. Our systems are built for decades of institutional memory.</p>
                    </li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
      
      <div className="py-32 px-6 text-center">
         <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 tracking-tighter uppercase">Secure the Standard</h2>
            <p className="text-white/40 mb-10 leading-relaxed font-light">If you share our vision for institutional stability and the preservation of professional production, we invite you to connect.</p>
            <button className="text-xs font-bold text-gold uppercase tracking-[0.4em] border-b border-gold pb-2 hover:text-white hover:border-white transition-all">Careers & Inquiries</button>
         </div>
      </div>
    </div>
  );
};

export default About;
