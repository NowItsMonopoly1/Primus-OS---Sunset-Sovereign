import React, { useState, useEffect } from 'react';
import { Activity, Lock, Calendar, CheckCircle, DollarSign, Flag } from 'lucide-react';

const Strategy = () => {
  // Load saved state from localStorage AND URL parameters
  const [volume, setVolume] = useState(() => {
    // Check URL params first, then localStorage, then default
    const urlParams = new URLSearchParams(window.location.search);
    const urlVolume = urlParams.get('volume');
    if (urlVolume) return Number(urlVolume);

    const saved = localStorage.getItem('strategy-volume');
    return saved ? Number(saved) : 100;
  });

  const [commission, setCommission] = useState(() => {
    // Check URL params first, then localStorage, then default
    const urlParams = new URLSearchParams(window.location.search);
    const urlCommission = urlParams.get('commission');
    if (urlCommission) return Number(urlCommission);

    const saved = localStorage.getItem('strategy-commission');
    return saved ? Number(saved) : 100;
  });

  const [legacy, setLegacy] = useState(0);
  const [primus, setPrimus] = useState(0);

  // Persist state changes to localStorage AND URL parameters
  useEffect(() => {
    localStorage.setItem('strategy-volume', volume.toString());
    // Update URL without triggering page reload
    const url = new URL(window.location.href);
    url.searchParams.set('volume', volume.toString());
    url.searchParams.set('commission', commission.toString());
    window.history.replaceState({}, '', url);
  }, [volume, commission]);

  // Calculate projections
  useEffect(() => {
    // Simple 5-Year Projection Math
    let l = volume * 1000000;
    let p = volume * 1000000;
    let lTotal = 0;
    let pTotal = 0;
    const rate = commission / 10000;

    for (let i = 0; i < 5; i++) {
      l = l * 0.80; // 20% Decay
      lTotal += l * rate;
      p = p * 0.95; // 5% Decay
      pTotal += p * rate;
    }
    setLegacy(Math.round(lTotal));
    setPrimus(Math.round(pTotal));
  }, [volume, commission]);

  const format = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] pb-12 sm:pb-20">
      {/* Mobile-optimized header */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#353C45] bg-[#222831] sticky top-0 z-10">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#C6A45E] flex-shrink-0" />
            <span className="truncate">THE SUNSET PROTOCOL</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#B4BAC2] mt-1">STRATEGIC CONTINUITY ROADMAP</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {/* CALCULATOR - Mobile responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Input Controls */}
          <div className="lg:col-span-4 bg-[#222831] border border-[#353C45] p-4 sm:p-6 rounded">
            <h3 className="text-xs font-bold text-[#7A828C] uppercase mb-4 sm:mb-6">Projection Inputs</h3>
            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="text-sm sm:text-base text-[#E6E8EB] block mb-3 flex justify-between items-center">
                  <span>Book Volume</span>
                  <span className="text-[#C6A45E] font-mono font-bold">${volume}M</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-full h-3 accent-[#C6A45E] cursor-pointer"
                  aria-label="Book volume in millions"
                  style={{ touchAction: 'none' }}
                />
                <div className="flex justify-between text-xs text-[#7A828C] mt-1">
                  <span>$10M</span>
                  <span>$500M</span>
                </div>
              </div>
              <div>
                <label className="text-sm sm:text-base text-[#E6E8EB] block mb-3 flex justify-between items-center">
                  <span>Commission Rate</span>
                  <span className="text-[#C6A45E] font-mono font-bold">{commission} bps</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={commission}
                  onChange={e => setCommission(Number(e.target.value))}
                  className="w-full h-3 accent-[#C6A45E] cursor-pointer"
                  aria-label="Commission in basis points"
                  style={{ touchAction: 'none' }}
                />
                <div className="flex justify-between text-xs text-[#7A828C] mt-1">
                  <span>50 bps</span>
                  <span>250 bps</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results - Mobile optimized */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1A1F24] border border-[#353C45] p-4 sm:p-6 rounded">
              <div className="text-xs text-[#7A828C] uppercase mb-2">Legacy Decay (5-YR)</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-mono text-[#7A828C] line-through break-all">{format(legacy)}</div>
              <div className="text-[10px] text-[#555] mt-2 uppercase">Unmanaged Trajectory</div>
            </div>
            <div className="bg-[#222831] border-2 border-[#C6A45E] p-4 sm:p-6 rounded relative overflow-hidden shadow-lg">
              <div className="text-xs text-[#C6A45E] uppercase font-bold mb-2">Primus Protected</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-mono text-white font-bold break-all">{format(primus)}</div>
              <div className="mt-2 text-[#4A9E88] font-mono font-bold text-sm sm:text-base">
                +{format(primus - legacy)}
              </div>
              <div className="text-[10px] text-[#4A9E88] uppercase">Net Recaptured</div>
            </div>
          </div>
        </div>

        {/* ROADMAP */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#7A828C] uppercase mb-6"><Flag className="w-5 h-5 text-[#C6A45E]" /> Execution Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['AUDIT & STABILIZATION', 'CONTINUITY AUTOMATION', 'ASSET OPTIMIZATION', 'SUCCESSION EVENT'].map((title, i) => (
              <div key={i} className={`p-4 border ${i === 0 ? 'bg-[#222831] border-[#C6A45E]' : 'bg-[#1A1F24] border-[#353C45] opacity-60'}`}>
                <div className="text-xs font-mono text-[#C6A45E] mb-2">PHASE 0{i+1}</div>
                <div className="font-bold text-sm text-white">{title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Strategy;