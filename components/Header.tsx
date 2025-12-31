
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, LayoutGrid, ArrowLeftRight, Landmark, AlertTriangle } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'The Ledger', path: '/dashboard', icon: <LayoutGrid className="w-3 h-3" /> },
    { label: 'Successor Bridge', path: '/bridge', icon: <ArrowLeftRight className="w-3 h-3" /> },
    { label: 'Prospectus', path: '/pricing', icon: <Landmark className="w-3 h-3" /> },
    { label: 'Vault', path: '/security', icon: <Shield className="w-3 h-3" /> },
    { label: 'Risk Audit', path: '/crisis', icon: <AlertTriangle className="w-3 h-3" /> },
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
            <div className="relative w-7 h-7 border border-gold/40 flex items-center justify-center bg-gold/5">
              <span className="text-gold text-sm font-black tracking-tighter relative z-10 group-hover:text-white transition-colors italic">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-[0.2em] text-white leading-none uppercase italic">SUNSET</span>
              <span className="text-[7px] font-mono text-gold/40 tracking-[0.4em] uppercase mt-1">Sovereign Standard</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 text-[9px] font-bold tracking-[0.3em] uppercase transition-all hover:text-white ${
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
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-tighter italic">Bird Dog: Hunting</span>
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
