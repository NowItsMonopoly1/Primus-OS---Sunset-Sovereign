
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, LayoutGrid, ArrowLeftRight, Landmark, AlertTriangle, ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Ledger', path: '/dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
    { label: 'Signals', path: '/signals', icon: <Activity className="w-4 h-4" /> },
    { label: 'Governor', path: '/approvals', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Strategy', path: '/strategy', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { label: 'Vault', path: '/vault', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-10 flex items-center justify-between">
        <div className="flex items-center space-x-16">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="relative w-7 h-7 border border-[#C6A45E]/40 flex items-center justify-center bg-[#C6A45E]/5">
              <span className="text-[#C6A45E] text-sm font-black tracking-tighter relative z-10 group-hover:text-white transition-colors">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-[0.25em] text-white leading-none uppercase font-['Inter']">SOLOSCALE</span>
              <span className="text-[9px] font-mono text-[#C6A45E]/60 tracking-[0.15em] uppercase mt-0.5">POWERED BY PRIMUS OS</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 text-base font-bold tracking-[0.3em] uppercase transition-all hover:text-white ${
                  location.pathname === item.path ? 'text-gold' : 'text-white/30'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-10">
          <div className="hidden xl:flex flex-col items-end border-r border-white/5 pr-10">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-tighter italic">Continuity: Active</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/onboarding" className="px-7 py-2.5 bg-gold text-black text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all italic">
              Initialize
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
