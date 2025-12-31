
import React, { useState } from 'react';

const Platform: React.FC = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const shadowServices = [
    { title: 'Ledger Maintenance', desc: 'Our agents update your books in real-time, handling client status, data cleaning, and record integrity using autonomous logic.' },
    { title: 'Linguistic Outreach', desc: 'Proactive status reports and strategic outreach that mimic your exact cadence. You get the credit; we handle the keyboard.' },
    { title: 'Revenue Protection', desc: 'Continuous pipeline monitoring and automated deal-flow stability to ensure recurring yield remains an institutional asset.' },
    { title: 'Succession Bridging', desc: 'The architectural transfer of institutional memory from the primary owner to the successor through digitized records.' },
  ];

  const simulationEvents = [
    { label: "10:04 AM", action: "Ledger Row PR-9012 updated: outreach synthesized.", status: "Auto-Updated" },
    { label: "11:22 AM", action: "Client record J. Harrison cleaned: missing doc found.", status: "Auto-Cleaned" },
    { label: "01:15 PM", action: "Pipeline Report PR-8821 drafted for successor review.", status: "Bridge-Active" },
    { label: "03:45 PM", action: "Audit completed for Ledger Sheet: 100% compliance.", status: "Vault-Checked" },
  ];

  const startSimulation = () => {
    setSimulationActive(true);
    setSimStep(0);
    const interval = setInterval(() => {
      setSimStep(prev => {
        if (prev >= simulationEvents.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div className="py-20 bg-[#020202]">
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="lg:w-1/2">
            <h1 className="text-xs font-bold text-gold uppercase tracking-[0.6em] mb-6 italic">Core Infrastructure</h1>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-10 leading-[0.9]">Autonomous <br /> Bookkeeping</h2>
            <p className="text-xl text-white/40 font-light leading-relaxed mb-12">
              Primus OS provides the ease of a familiar spreadsheet with the power of intelligence agents. We maintain your books, update your clients, and secure your assets in real-time.
            </p>
            
            {/* SHADOW DAY SIMULATION MODAL/BLOCK */}
            <div className="bg-[#0a192f] border border-white/10 p-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${simulationActive ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}></div>
                    <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Agent Status: {simulationActive ? 'Processing' : 'Standby'}</span>
                  </div>
               </div>
               <h3 className="text-white font-bold text-sm uppercase tracking-[0.3em] mb-8 italic">Live Ledger Update Simulation</h3>
               
               <div className="space-y-4 mb-10 min-h-[180px]">
                  {!simulationActive ? (
                    <div className="flex flex-col items-center justify-center py-10">
                       <p className="text-white/20 text-[10px] uppercase font-mono mb-6">Simulate real-time ledger management?</p>
                       <button onClick={startSimulation} className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] border border-gold/40 px-6 py-3 hover:bg-gold hover:text-black transition-all">Execute Maintenance</button>
                    </div>
                  ) : (
                    simulationEvents.map((ev, i) => (
                      <div key={i} className={`flex items-center justify-between p-4 border-l-2 transition-all duration-700 ${i <= simStep ? 'border-gold bg-white/[0.03] opacity-100' : 'border-white/5 opacity-0'}`}>
                        <div className="flex flex-col">
                           <span className="text-[8px] font-mono text-white/20 mb-1">{ev.label}</span>
                           <span className="text-[11px] text-white font-light tracking-tight italic font-mono">{ev.action}</span>
                        </div>
                        <span className="text-[8px] font-mono text-gold uppercase tracking-widest font-bold">{ev.status}</span>
                      </div>
                    ))
                  )}
               </div>

               {simulationActive && simStep === simulationEvents.length - 1 && (
                 <div className="animate-in fade-in duration-1000 p-6 bg-gold/5 border border-gold/20">
                    <p className="text-[10px] text-white/60 leading-relaxed italic">
                      "Your ledger was updated 4 times today without human intervention. Intelligence agents maintained 100% data fidelity."
                    </p>
                 </div>
               )}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="aspect-square relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gold/5 blur-[150px] animate-pulse"></div>
              <div className="relative w-full h-full border border-white/5 flex items-center justify-center group overflow-hidden bg-black/20 backdrop-blur-xl">
                 <div className="absolute inset-4 border border-white/5 animate-[spin_120s_linear_infinite]"></div>
                 <div className="absolute inset-12 border border-white/5 border-dashed animate-[spin_80s_linear_infinite_reverse]"></div>
                 <div className="text-center z-10 p-12">
                   <div className="text-8xl mb-6 font-thin text-white/5">Σ</div>
                   <div className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.8em]">Ledger Optimizer</div>
                   <div className="mt-6 text-white/10 text-[9px] uppercase font-mono tracking-tighter italic">Syncing Books of Business...</div>
                   <div className="mt-10 flex justify-center space-x-3 opacity-20">
                      <div className="w-1 h-3 bg-white/40 animate-[pulse_2s_infinite]"></div>
                      <div className="w-1 h-3 bg-white/40 animate-[pulse_2s_infinite_0.5s]"></div>
                      <div className="w-1 h-3 bg-white/40 animate-[pulse_2s_infinite_1s]"></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h3 className="text-white font-bold text-2xl uppercase tracking-tighter mb-4 italic">The Service Model</h3>
            <div className="h-[1px] w-20 bg-gold/50"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {shadowServices.map((s, i) => (
              <div key={i} className="p-10 hover:bg-white/[0.02] transition-all border-r border-white/5 last:border-r-0 group">
                <div className="text-white/5 font-mono text-[10px] mb-8 tracking-[0.5em] group-hover:text-gold transition-colors italic">SVC-CODE: B{i+1}00</div>
                <h3 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">{s.title}</h3>
                <p className="text-white/30 text-xs leading-relaxed font-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Platform;
