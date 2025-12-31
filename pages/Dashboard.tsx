import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Zap, Shield, Search, Filter, Activity } from 'lucide-react';
import LogicStream from '../components/LogicStream';
import { analyzeLead, BirdDogAnalysis } from '../utils/birdDogEngine';
import { CleanClientData } from '../utils/csvIngestor';

interface DashboardProps {
  data: CleanClientData[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [formulaValue, setFormulaValue] = useState("=BIRD_DOG_V2(\"Scan_Database\", \"Rate_Trap_Filter: ON\")");
  const [selectedAnalysis, setSelectedAnalysis] = useState<BirdDogAnalysis | null>(null);
  const [processedRows, setProcessedRows] = useState<any[]>([]);

  const mockRows = [
    { 
        id: 'PR-9012', 
        name: "Smith, John", 
        lastContact: "2 days ago", 
        trigger: "Rate Trap (3.1%)", 
        aiNote: "⛔ DO NOT REFI. Locked at 3.1%. 💡 The Play: Pitch HELOC for 'Boat' purchase.", 
        status: "HOT - CALL NOW",
        currentRate: 3.1, 
        ltv: 50, 
        notes: "Wants a boat refi." 
    },
    { 
        id: 'PR-8821', 
        name: "Miller, Sarah", 
        lastContact: "11:08 AM", 
        trigger: "Nuance-Pivot", 
        aiNote: "⛔ DO NOT REFI. Locked at 2.875%. 💡 Pitch HELOC for remodel.", 
        status: "HOT",
        currentRate: 2.875, 
        ltv: 40, 
        notes: "Needs $100k for kitchen remodel." 
    },
    { 
        id: 'PR-7742', 
        name: "Williams, Ted", 
        lastContact: "12 hours ago", 
        trigger: "Spread > 0.75%", 
        aiNote: "🔥 Green Light. Spread 1.1%. 💰 The Play: Save ~$350/mo on Refi.", 
        status: "WARM",
        currentRate: 7.2, 
        ltv: 70, 
        notes: "High rate primary residence." 
    }
  ];

  useEffect(() => {
    const rawData = data && data.length > 0 ? data : mockRows;
    const marketRate = 6.125;

    const analyzed = rawData.map((client: any, i) => {
      const analysis = analyzeLead({
        name: client.name,
        currentRate: client.currentRate,
        ltv: client.ltv,
        notes: client.notes
      }, marketRate);

      return {
        ...client,
        id: client.id || `PR-${9000 + i}`,
        trigger: analysis.reasoningChain.find(s => s.status === 'blocked' || s.status === 'match')?.step || "Active Monitoring",
        aiNote: analysis.generatedNote,
        status: analysis.classification === 'HOT' ? "HOT - ACTION" : (analysis.classification || "NURTURING"),
        fullAnalysis: analysis
      };
    });

    setProcessedRows(analyzed);
  }, [data]);

  const handleRowClick = (row: any) => {
    setSelectedAnalysis(row.fullAnalysis);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
      if (Math.random() > 0.7) {
        const formulas = ["=BIRD_DOG_V2(\"Scan_Database\", \"Rate_Trap_Filter: ON\")", "=MAP(VOICE_DNA, ZETA_SYNTAX)", "=SUM(REVENUE_AT_RISK) * SUNSET_YIELD", "=VALIDATE_COMPLIANCE(LEDGER_SYNC)"];
        setFormulaValue(formulas[Math.floor(Math.random() * formulas.length)]);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen bg-[#020202] flex flex-col overflow-hidden font-mono text-[10px] selection:bg-gold/20">
      {/* Tightened Excel Ribbon */}
      <div className="bg-[#107C41] text-white px-6 py-3 flex justify-between items-center shadow-2xl z-20 border-b border-black/20">
        <div className="flex items-center space-x-6">
          <FileSpreadsheet className="w-4 h-4 opacity-80" />
          <span className="font-bold text-[12px] tracking-tight uppercase italic flex items-center">
            {data && data.length > 0 ? 'Imported_Client_Ledger.xlsx' : 'Sunset_Protocol_Master_Ledger.xlsx'}
            <span className="ml-3 px-2 py-0.5 bg-black/30 text-[8px] border border-white/10 rounded-sm font-black tracking-widest">PRO_VER</span>
          </span>
        </div>
        <div className="flex space-x-8 text-emerald-100/60 hidden md:flex font-black uppercase tracking-[0.2em] italic text-[9px]">
          <span className="cursor-pointer hover:text-white transition-colors border-b border-transparent hover:border-white/40">File</span>
          <span className="cursor-pointer hover:text-white transition-colors border-b border-transparent hover:border-white/40">Ledger_Sync</span>
          <span className="cursor-pointer hover:text-white transition-colors border-b border-transparent hover:border-white/40">Security_Vault</span>
          <span className="cursor-pointer hover:text-white transition-colors border-b border-transparent hover:border-white/40">Nuance_Logic</span>
        </div>
      </div>

      {/* Formula Bar - Compact Enterprise Style */}
      <div className="bg-[#050505] border-b border-white/5 flex items-center px-4 py-2 z-10">
        <div className="text-gold font-black px-4 border-r border-white/5 italic select-none">fx</div>
        <div className="flex-1 px-6 text-white/50 font-mono overflow-hidden whitespace-nowrap text-ellipsis italic font-bold text-[11px] flex items-center">
           <span className="text-blue-400 mr-2">{formulaValue.split('(')[0]}</span>
           <span className="text-white/20 mr-1">(</span>
           <span className="text-emerald-400">"{formulaValue.includes('"') ? formulaValue.split('"')[1] : 'SYSTEM_INIT'}"</span>
           <span className="text-white/20">)</span>
        </div>
        <div className="flex items-center space-x-5 px-4">
           <Search className="w-3 h-3 text-white/20 cursor-pointer hover:text-gold transition-colors" />
           <Filter className="w-3 h-3 text-white/20 cursor-pointer hover:text-gold transition-colors" />
           <div className="h-4 w-[1px] bg-white/5"></div>
           <Activity className="w-3 h-3 text-gold/40 animate-pulse" />
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-auto bg-black relative custom-scrollbar">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#0a192f] sticky top-0 z-10 border-b border-white/10 shadow-lg">
            <tr>
              <th className="w-12 border-r border-white/5 p-2 text-center text-white/10 bg-black/40 italic font-black">#</th>
              <th className="border-r border-white/5 px-6 py-2 text-left font-black text-white/40 uppercase tracking-[0.2em] italic w-48">Client_Entity</th>
              <th className="border-r border-white/5 px-6 py-2 text-left font-black text-white/40 uppercase tracking-[0.2em] italic w-32">Last_Action</th>
              <th className="border-r border-white/5 px-6 py-2 text-left font-black text-white/40 uppercase tracking-[0.2em] italic w-40">Trigger_Event</th>
              <th className="border-r border-white/5 px-6 py-2 text-left font-black text-gold/60 uppercase tracking-[0.2em] italic flex-1">The Play (Strategic Prescription)</th>
              <th className="border-b border-white/5 px-6 py-2 text-left font-black text-white/40 uppercase tracking-[0.2em] italic w-32">Integrity</th>
            </tr>
          </thead>
          <tbody className="text-white/50">
            {processedRows.map((row, index) => (
              <tr 
                key={row.id} 
                onClick={() => handleRowClick(row)}
                className="hover:bg-gold/[0.04] transition-colors cursor-pointer group border-b border-white/[0.02]"
              >
                <td className="border-r border-white/5 text-center text-white/5 bg-white/[0.01] font-sans font-bold italic py-2">{index + 1}</td>
                <td className="border-r border-white/5 px-6 py-2 text-white/90 font-black uppercase tracking-tighter italic text-[11px] group-hover:text-white transition-colors">{row.name}</td>
                <td className="border-r border-white/5 px-6 py-2 text-white/20 italic text-[9px]">{row.lastContact}</td>
                <td className="border-r border-white/5 px-6 py-2">
                  <div className="flex items-center space-x-2">
                     <div className={`w-1 h-1 rounded-full ${row.status.includes('HOT') ? 'bg-gold animate-pulse' : 'bg-white/10'}`}></div>
                     <span className="text-white/40 uppercase tracking-widest italic text-[9px] truncate max-w-[140px]">{row.trigger}</span>
                  </div>
                </td>
                <td className="border-r border-white/5 px-6 py-2 text-white/60 italic border-l-2 border-l-gold relative bg-gold/[0.01] group-hover:bg-gold/[0.03] transition-colors">
                  <span className="truncate block max-w-[600px] leading-tight group-hover:max-w-none group-hover:whitespace-normal transition-all">{row.aiNote}</span>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center space-x-3 transition-all">
                        <span className="text-[8px] text-gold font-black bg-black border border-gold/30 px-3 py-1 tracking-widest italic shadow-2xl">INSPECT_NUANCE</span>
                   </div>
                </td>
                <td className="px-6 py-2">
                  <span className={`px-3 py-0.5 text-[8px] font-black uppercase tracking-widest italic border ${
                    row.status.includes("HOT") ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
             {/* Dynamic Empty State Filler */}
             {[...Array(Math.max(0, 30 - processedRows.length))].map((_, i) => (
               <tr key={i+300} className="border-b border-white/[0.02] opacity-[0.02]">
                 <td className="border-r border-white/5 text-center bg-white/5 py-2">{processedRows.length + i + 1}</td>
                 <td className="border-r border-white/5 p-4"></td>
                 <td className="border-r border-white/5 p-4"></td>
                 <td className="border-r border-white/5 p-4"></td>
                 <td className="border-r border-white/5 p-4"></td>
                 <td className="p-4"></td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Tightened Footer Status Bar */}
      <div className="bg-[#050505] border-t border-white/10 px-6 py-2.5 text-[9px] text-white/20 flex justify-between font-black uppercase tracking-[0.2em] italic z-20">
        <div className="flex items-center space-x-10">
          <div className="flex items-center space-x-2">
            <Zap className="w-2.5 h-2.5 text-green-500 animate-pulse" />
            <span className="text-white/40">ENGINE_SYNC: 100%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-2.5 h-2.5 text-gold/40" />
            <span className="text-white/40">SECURITY: GLBA_SECURED</span>
          </div>
          <span className="text-white/10 hidden lg:inline">LEDGER_ID: SM_V2_{Math.floor(Math.random()*100000)}</span>
        </div>
        <div className="flex items-center space-x-10">
           <span className="flex items-center">CLIENTS_ACTIVE: <span className="text-white ml-2">{processedRows.length}</span></span>
           <span className="flex items-center">YIELD_OPTIMIZATION: <span className="text-emerald-400 ml-2">+18.4%</span></span>
           <div className="flex space-x-2 ml-6">
              <div className="w-2 h-2 bg-gold/10"></div>
              <div className="w-2 h-2 bg-gold/30"></div>
              <div className="w-2 h-2 bg-gold/50"></div>
           </div>
        </div>
      </div>

       {selectedAnalysis && (
            <LogicStream 
                analysis={selectedAnalysis} 
                onClose={() => setSelectedAnalysis(null)} 
            />
        )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #020202;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #112240;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4af37;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
