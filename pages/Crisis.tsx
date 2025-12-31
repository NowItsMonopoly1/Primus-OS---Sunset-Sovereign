
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Crisis: React.FC = () => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Audit Inputs v1.0
  const [inputs, setInputs] = useState({
    agentCount: 200,
    topQuartileProduction: 70, // % of total
    avgVolumePerTopProducer: 25, // $M
    ageDistribution: 58, // Weighted avg
    recruitmentScore: 3, // 1-5
  });

  const results = useMemo(() => {
    const topProducers = Math.floor(inputs.agentCount * (inputs.topQuartileProduction / 100));
    const annualVolumeAtRisk = topProducers * inputs.avgVolumePerTopProducer;
    
    const ageRisk = inputs.ageDistribution > 60 ? 1.4 : inputs.ageDistribution > 50 ? 1.1 : 0.8;
    const recruitmentRisk = (6 - inputs.recruitmentScore) * 0.2;
    const baseAttrition = 0.55; 

    const total5YearRisk = annualVolumeAtRisk * 5 * baseAttrition * ageRisk * (1 + recruitmentRisk);
    
    const chartData = Array.from({ length: 5 }, (_, i) => ({
      year: `Year ${i + 1}`,
      loss: (annualVolumeAtRisk * (i + 1) * 0.45 * ageRisk).toFixed(1)
    }));

    const gapIndex = ((inputs.ageDistribution / 65) * (6 - inputs.recruitmentScore) * 20).toFixed(0);

    return { total5YearRisk, chartData, gapIndex, annualVolumeAtRisk };
  }, [inputs]);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert("Continuity Risk Audit Generated. Check your secure vault.");
    }, 2500);
  };

  return (
    <div className="py-24 px-6 bg-[#020202] min-h-screen text-[#ccd6f6]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-[1px] bg-gold"></div>
            <span className="text-[10px] font-mono text-gold uppercase tracking-[0.5em]">Institutional Audit v1.0</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none mb-6">
            The $1 Trillion <br /> <span className="text-[#8892b0] italic">Continuity Cliff.</span>
          </h1>
          <p className="text-xl text-[#8892b0] font-light max-w-2xl leading-relaxed">
            Unmanaged producer attrition is the single greatest threat to brokerage valuation. Quantify your exposure below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-white/5 border border-white/5 mb-24 shadow-2xl">
          {/* Controls */}
          <div className="lg:col-span-4 bg-[#0a192f] p-12 border-r border-white/5">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-12 flex items-center">
              <span className="w-1.5 h-1.5 bg-gold mr-3"></span> Audit Inputs
            </h3>
            
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-mono text-[#8892b0] uppercase tracking-widest leading-none">Total Agent Count</label>
                  <span className="text-white font-mono text-lg leading-none">{inputs.agentCount}</span>
                </div>
                <input 
                  type="range" min="50" max="2000" step="50"
                  value={inputs.agentCount} 
                  onChange={e => setInputs({...inputs, agentCount: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/10 h-1 appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-mono text-[#8892b0] uppercase tracking-widest leading-none">% Production (Top Quartile)</label>
                  <span className="text-white font-mono text-lg leading-none">{inputs.topQuartileProduction}%</span>
                </div>
                <input 
                  type="range" min="10" max="90" step="5"
                  value={inputs.topQuartileProduction} 
                  onChange={e => setInputs({...inputs, topQuartileProduction: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/10 h-1 appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-mono text-[#8892b0] uppercase tracking-widest leading-none">Avg Volume / Top Producer ($M)</label>
                  <span className="text-white font-mono text-lg leading-none">${inputs.avgVolumePerTopProducer}M</span>
                </div>
                <input 
                  type="range" min="5" max="100" step="5"
                  value={inputs.avgVolumePerTopProducer} 
                  onChange={e => setInputs({...inputs, avgVolumePerTopProducer: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/10 h-1 appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-mono text-[#8892b0] uppercase tracking-widest leading-none">Age Distribution (Avg)</label>
                  <span className="text-white font-mono text-lg leading-none">{inputs.ageDistribution}</span>
                </div>
                <input 
                  type="range" min="40" max="75"
                  value={inputs.ageDistribution} 
                  onChange={e => setInputs({...inputs, ageDistribution: parseInt(e.target.value)})}
                  className="w-full accent-gold bg-white/10 h-1 appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-mono text-[#8892b0] uppercase tracking-widest leading-none">Recruitment Score (1-5)</label>
                  <span className="text-white font-mono text-lg leading-none">{inputs.recruitmentScore}</span>
                </div>
                <div className="flex gap-2">
                   {[1,2,3,4,5].map(i => (
                     <button 
                      key={i}
                      onClick={() => setInputs({...inputs, recruitmentScore: i})}
                      className={`flex-grow h-1 transition-all ${inputs.recruitmentScore >= i ? 'bg-gold' : 'bg-white/5'}`}
                     ></button>
                   ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-8 bg-[#112240] p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
               <div className="border-l border-gold/40 pl-8">
                  <h4 className="text-[#8892b0] text-[10px] font-mono uppercase tracking-widest mb-4">5-Year Volume At Risk</h4>
                  <div className="text-6xl font-black text-white tracking-tighter">
                    ${(results.total5YearRisk / 1000).toFixed(1)}B
                  </div>
                  <p className="text-[10px] text-gold font-bold mt-4 uppercase tracking-widest">Action Required: Immediate</p>
               </div>
               <div className="border-l border-white/10 pl-8">
                  <h4 className="text-[#8892b0] text-[10px] font-mono uppercase tracking-widest mb-4">Successor Gap Index</h4>
                  <div className="text-6xl font-black text-white tracking-tighter">
                    {results.gapIndex}%
                  </div>
                  <p className="text-[10px] text-white/30 mt-4 uppercase tracking-widest">Structural vulnerability rating</p>
               </div>
            </div>

            <div className="h-96 w-full relative mb-12">
               <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Revenue Retention Curve vs. Baseline Attrition</h4>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={results.chartData}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a192f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0' }}
                      itemStyle={{ color: '#d4af37', textTransform: 'uppercase', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="loss" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#riskGrad)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="p-8 bg-black/40 border border-white/5 flex items-center justify-between">
               <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-gold/10 flex items-center justify-center text-gold">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-xs text-[#8892b0] font-light italic leading-relaxed">
                    "Delaying institutional deployment by 12 months increases succession risk by <span className="text-white font-bold">+24.2%</span>."
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 bg-[#0a192f] p-16 border border-white/10 relative overflow-hidden group">
           <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none"></div>
           <div className="relative z-10">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">Request Secure Audit PDF</h3>
              <p className="text-[#8892b0] text-sm font-light max-w-lg leading-relaxed mb-10">
                Receive the formal Continuity Risk Report. Includes deep-dive analysis on top-quartile production shifts and long-horizon retention mapping.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                 <input 
                  type="email" 
                  placeholder="Professional Email Address"
                  className="bg-white/5 border border-white/10 px-6 py-4 text-white text-xs outline-none focus:border-gold transition-all min-w-[300px]"
                 />
                 <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="btn-primary py-4 px-10 text-[10px] disabled:opacity-50"
                 >
                   {isDownloading ? "Generating..." : "Generate Report"}
                 </button>
              </div>
           </div>
           <div className="relative z-10 flex flex-col items-center lg:items-end">
              <button 
                onClick={() => navigate('/shield-deck')}
                className="text-white/40 text-[9px] font-bold uppercase tracking-[0.4em] hover:text-gold transition-colors mb-4"
              >
                View Institutional Shield Deck &rarr;
              </button>
              <div className="flex space-x-4 opacity-20">
                 <div className="w-12 h-12 border border-white flex items-center justify-center text-[10px] font-black italic">FINRA</div>
                 <div className="w-12 h-12 border border-white flex items-center justify-center text-[10px] font-black italic">GLBA</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Crisis;
