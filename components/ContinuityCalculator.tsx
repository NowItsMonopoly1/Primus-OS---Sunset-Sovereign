
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const ContinuityCalculator: React.FC = () => {
  const [volume, setVolume] = useState(50); // In Millions
  const commissionRate = 0.01; // 1% (100 BPS) average commission
  const legacyRetention = 0.45; // Sunset Protocol retains ~45% of standard income via autonomous handoffs

  const annualIncome = volume * 1000000 * commissionRate;

  const data = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const year = i + 1;
      const isRetired = year > 3;
      
      return {
        name: `Year ${year}`,
        // Scenario A: Walk Away (The Cliff)
        Standard: isRetired ? 0 : annualIncome,
        // Scenario B: Sunset Protocol (The Annuity)
        Sunset: isRetired ? annualIncome * legacyRetention * Math.pow(0.88, year - 3) : annualIncome, // Decays slightly as book naturally churns
      };
    });
  }, [annualIncome]);

  const totalStandard = annualIncome * 3;
  const totalSunset = data.reduce((acc, curr) => acc + curr.Sunset, 0);
  const wealthPreserved = totalSunset - totalStandard;

  return (
    <div className="bg-[#0a192f]/80 backdrop-blur-xl border border-white/5 rounded-sm overflow-hidden shadow-2xl">
      <div className="bg-black/40 p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
            <div className="bg-gold/10 p-3 border border-gold/20 text-gold">
                <Calculator size={24} />
            </div>
            <div>
                <h3 className="font-serif text-2xl font-black text-white uppercase italic tracking-tighter">The Continuity Audit</h3>
                <p className="text-gold font-mono text-[9px] uppercase tracking-[0.4em] italic font-bold">Quantify Your Sovereign Exit Cost</p>
            </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold italic mb-1">Status: Calculation Engine Active</span>
           <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/40 font-mono italic">Fidelity: Institutional</span>
           </div>
        </div>
      </div>

      <div className="p-10 grid lg:grid-cols-12 gap-12">
        
        {/* Controls */}
        <div className="lg:col-span-4 space-y-10">
            <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                    Annual Production
                  </label>
                  <span className="text-2xl font-black text-gold italic tracking-tighter">${volume}M</span>
                </div>
                <input 
                    type="range" 
                    min="10" 
                    max="500" 
                    step="10"
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))} 
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gold"
                />
                <div className="flex justify-between mt-2 font-mono text-[8px] text-white/10 uppercase tracking-tighter font-bold">
                   <span>$10M</span>
                   <span>$500M</span>
                </div>
                <p className="text-[10px] text-white/40 mt-6 italic leading-relaxed">
                    Estimated Annual Yield: <strong className="text-white">${(annualIncome / 1000).toLocaleString()}k</strong>
                </p>
            </div>

            <div className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-sm group hover:border-red-500/40 transition-colors">
                  <div className="flex items-center text-red-500 font-black text-[10px] uppercase tracking-widest mb-3 italic">
                      <TrendingDown className="w-4 h-4 mr-2" />
                      The Walk-Away Cliff
                  </div>
                  <p className="text-xs text-white/30 leading-relaxed italic">
                      Without a protocol, your income hits <strong className="text-white">$0.00</strong> on Day 1 of retirement. Your relationship equity evaporates instantly.
                  </p>
              </div>

              <div className="bg-gold/5 border border-gold/20 p-6 rounded-sm group hover:border-gold/40 transition-colors">
                  <div className="flex items-center text-gold font-black text-[10px] uppercase tracking-widest mb-3 italic">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      The Sunset Annuity
                  </div>
                  <p className="text-xs text-white/30 leading-relaxed italic">
                      With the Bird Dog Protocol, you retain significant residuals through automated handoffs and digital-twin maintenance.
                  </p>
              </div>
            </div>
        </div>

        {/* The Chart */}
        <div className="lg:col-span-8 relative">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                      <defs>
                          <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSunset" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.2)" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                        tick={{fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontStyle: 'italic'}}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.2)" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(val) => `$${val/1000}k`} 
                        tick={{fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontStyle: 'italic'}}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020202', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0' }}
                        itemStyle={{ color: '#d4af37', textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold' }}
                        formatter={(val: number) => [`$${(val/1000).toLocaleString()}k`, '']}
                        labelStyle={{ color: 'rgba(255,255,255,0.3)', marginBottom: '8px', fontSize: '10px' }}
                      />
                      <Area 
                          type="monotone" 
                          dataKey="Standard" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          fillOpacity={1} 
                          fill="url(#colorStandard)" 
                          name="Walk-Away Baseline"
                      />
                      <Area 
                          type="monotone" 
                          dataKey="Sunset" 
                          stroke="#d4af37" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorSunset)" 
                          name="Sunset Protocol Yield"
                      />
                  </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Total Preservation Widget */}
            <div className="absolute top-0 right-0 p-8 bg-black/60 backdrop-blur-md border border-gold/30 flex flex-col items-end animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex items-center space-x-2 text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-3 italic">
                    <AlertTriangle size={14} className="animate-pulse" />
                    <span>Wealth Preservation Gap</span>
                </div>
                <div className="text-4xl font-black text-white italic tracking-tighter leading-none mb-2">
                    ${(wealthPreserved / 1000).toLocaleString()}k
                </div>
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest italic">
                    7-Year Legacy Asset Retention
                </div>
            </div>

            <div className="mt-8 flex justify-center space-x-12 opacity-20 italic font-mono text-[9px] uppercase tracking-widest">
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border border-red-500 border-dashed"></div>
                  <span>Standard Exit (Income Drop)</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gold"></div>
                  <span>Sunset Protocol Retention</span>
               </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ContinuityCalculator;
