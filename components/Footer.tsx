
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
             <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-6 h-6 bg-gold flex items-center justify-center rounded-sm">
                <span className="text-black font-bold text-xs italic">S</span>
              </div>
              <span className="text-lg font-bold tracking-tighter text-white uppercase italic">SUNSET PROTOCOL</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6 italic">
              The institutional standard for legacy monetization and digital twin continuity in high-value asset environments.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 cursor-pointer transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-6 italic">Platform</h4>
            <ul className="space-y-4 italic font-light">
              <li><Link to="/platform" className="text-white/40 text-sm hover:text-gold transition-colors">The Continuity Engine</Link></li>
              <li><Link to="/platform" className="text-white/40 text-sm hover:text-gold transition-colors">Zeta Digital Twins</Link></li>
              <li><Link to="/pricing" className="text-white/40 text-sm hover:text-gold transition-colors">Investment Model</Link></li>
              <li><Link to="/crisis" className="text-white/40 text-sm hover:text-gold transition-colors">Risk Audit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-6 italic">Strategy</h4>
            <ul className="space-y-4 italic font-light">
              <li><Link to="/briefing" className="text-white/40 text-sm hover:text-gold transition-colors">Strategic Briefing</Link></li>
              <li><Link to="/g2r" className="text-white/40 text-sm hover:text-gold transition-colors">G2R™ Roadmap</Link></li>
              <li><Link to="/about" className="text-white/40 text-sm hover:text-gold transition-colors">Our Mission</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-6 italic">Compliance</h4>
             <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-white/5 border border-white/10 flex items-center justify-center p-2 rounded">
                  <span className="text-[10px] font-bold text-white/30 text-center uppercase tracking-tighter italic">SOC-2 READY</span>
                </div>
                <div className="aspect-square bg-white/5 border border-white/10 flex items-center justify-center p-2 rounded">
                  <span className="text-[10px] font-bold text-white/30 text-center uppercase tracking-tighter italic">RESPA SAFE</span>
                </div>
             </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-xs italic">
            &copy; {new Date().getFullYear()} Sunset Protocol Systems Corp. All rights reserved.
          </p>
          <div className="flex space-x-8">
            <button className="text-white/20 text-xs hover:text-white italic">Privacy Policy</button>
            <button className="text-white/20 text-xs hover:text-white italic">Terms of Service</button>
            <button className="text-white/20 text-xs hover:text-white italic">Security Disclosure</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
