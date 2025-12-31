
import React from 'react';

const Partners: React.FC = () => {
  return (
    <div className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-20">
        <h1 className="text-xs font-bold text-gold uppercase tracking-[0.5em] mb-4">Strategic Partnerships</h1>
        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter uppercase mb-8">The Institutional <br /> Business Case</h2>
        <p className="max-w-3xl text-xl text-white/50 font-light leading-relaxed">
          Primus OS isn't an expense; it's an equity protection layer. By stabilizing professional transitions, we increase brokerage EBITDA and institutional valuation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="glass-card p-12 hover:bg-white/5 transition-all">
          <div className="text-gold text-4xl mb-6 font-bold">90%</div>
          <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Relationship Retention</h3>
          <p className="text-white/40 leading-relaxed">
            Standard transitions often lose nearly half of the relationship volume. Primus OS ensures 90% of assets stay within your brand ecosystem by automating the cognitive handoff.
          </p>
        </div>
        <div className="glass-card p-12 hover:bg-white/5 transition-all">
          <div className="text-gold text-4xl mb-6 font-bold">14%</div>
          <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Valuation Lift</h3>
          <p className="text-white/40 leading-relaxed">
            By preventing agent churn and stabilizing revenue flows during professional market cycles, our partners see a significant boost in enterprise resilience.
          </p>
        </div>
      </div>

      <div className="py-20 border-t border-white/5">
         <h2 className="text-xs font-bold text-gold uppercase tracking-[0.4em] mb-12 text-center">Engagement Model</h2>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="p-10 border border-white/10 border-r-0">
               <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Level 01: Pilot</h4>
               <p className="text-white/40 text-sm mb-8 leading-relaxed">Focused deployment for a top producer team. Validates data ingestion and Zeta twin veracity.</p>
               <ul className="text-[10px] text-white/30 space-y-2 uppercase tracking-widest">
                  <li>- 30 Day Onboarding</li>
                  <li>- Cognitive Audit</li>
                  <li>- Voice Synthesis</li>
               </ul>
            </div>
            <div className="p-10 border-2 border-gold relative bg-gold/5 scale-105 z-10 shadow-2xl">
               <div className="absolute top-0 right-0 bg-gold text-black px-4 py-1 text-[10px] font-bold uppercase tracking-widest">Standard</div>
               <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Level 02: Enterprise</h4>
               <p className="text-white/40 text-sm mb-8 leading-relaxed">Full brokerage deployment. Integrated into strategic recruitment and long-horizon retention.</p>
               <ul className="text-[10px] text-white/60 space-y-2 uppercase tracking-widest">
                  <li>- Full CRM Integration</li>
                  <li>- Successor Bridge Access</li>
                  <li>- White-Glove Deployment</li>
               </ul>
            </div>
            <div className="p-10 border border-white/10 border-l-0">
               <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Level 03: Network</h4>
               <p className="text-white/40 text-sm mb-8 leading-relaxed">For associations and large-scale franchise networks seeking to offer Primus as a systemic benefit.</p>
               <ul className="text-[10px] text-white/30 space-y-2 uppercase tracking-widest">
                  <li>- Multi-Tenant Security</li>
                  <li>- Custom Branding</li>
                  <li>- API Access</li>
               </ul>
            </div>
         </div>
      </div>

      <div className="bg-[#080808] p-16 rounded-lg border border-white/5 text-center mt-20">
         <h3 className="text-white font-bold text-3xl mb-6 uppercase tracking-tight">Secure the Handoff</h3>
         <p className="text-white/40 max-w-xl mx-auto mb-10">Connect with our Strategic Partnerships team for a simulated transition audit of your top producer book.</p>
         <button className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-gold transition-colors">Request Partnership Audit</button>
      </div>
    </div>
  );
};

export default Partners;
