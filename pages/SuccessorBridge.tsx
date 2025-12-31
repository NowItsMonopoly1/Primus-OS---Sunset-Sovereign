import { GoogleGenAI } from "@google/genai";
import { MessageSquare, ArrowRight, UserCheck, ShieldCheck, Sparkles, Phone, Anchor, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { CleanClientData } from '../utils/csvIngestor';

interface SuccessorBridgeProps {
  data?: CleanClientData[];
}

const SuccessorBridge: React.FC<SuccessorBridgeProps> = ({ data = [] }) => {
  const [activeLead, setActiveLead] = useState<any>(null);
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  // Default demo leads if no data is provided
  const demoLeads = [
    { 
      name: 'Dr. Aris Thorne', 
      intent: '98%', 
      source: 'Bird Dog', 
      type: 'High Net Worth',
      lastBrokerAction: 'Discussed yacht refi at country club.', 
      dna: 'High-directivity, uses "Cheers" instead of "Best".',
      rapportKeys: ["Loves sailing (Boat: 'The Odyssey')", "Hates small talk", "Values speed over rate"],
      birdDogReason: "⛔ Rate Trap (2.8%). 💡 PIVOT: Liquidated stock ($2M). Pitch Second Lien to protect his 1st MTG."
    },
    { 
      name: 'Sarah Miller', 
      intent: '95%', 
      source: 'Bird Dog', 
      type: 'Family Estate',
      lastBrokerAction: 'Needs $100k for kitchen remodel. Locked at 2.875%.', 
      dna: 'Protective, busy, value-driven.',
      rapportKeys: ["Kitchen remodel", "Strict rate-protector", "Hates being sold"],
      birdDogReason: "⛔ DO NOT REFI. 💡 The Play: Fixed-Rate HELOC for remodel. Keep her low rate lock intact."
    }
  ];

  useEffect(() => {
    if (data.length > 0) {
      // Map real data to the bridge format
      const mapped = data.map(client => ({
        name: client.name,
        intent: client.currentRate < 4 ? '92%' : '88%',
        source: 'Ledger Import',
        type: client.ltv < 50 ? 'High Equity' : 'Portfolio',
        lastBrokerAction: client.notes || 'Legacy relationship record.',
        dna: 'Standard Executive',
        rapportKeys: ['Legacy Client', 'Institutional Asset'],
        birdDogReason: client.currentRate < 4 
          ? `⛔ Rate Trap (${client.currentRate}%). 💡 PIVOT to HELOC.` 
          : `🔥 Rate Spread Detected (${client.currentRate}%). 💰 Standard Refi Play.`
      }));
      setLeads(mapped);
    } else {
      setLeads(demoLeads);
    }
  }, [data]);

  const generateAIAssist = async () => {
    if (!activeLead) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are the Chief of Staff for a high-production Mortgage Broker named Donte. 
          Your job is to write a 'Bridge Message' for a junior agent to send to a client. 
          
          CORE DIRECTIVE: AUTOMATE NUANCE. 
          Decide for the junior agent. If the client has a low rate (like 2.8%), DO NOT try to refinance them. Explicitly pitch a HELOC or Second Lien as 'The Play'.
          
          STYLE RULES: 
          1. Use High-Velocity Industry Terms: 'Spread', 'Basis Points', 'HELOC', 'Equity Position', 'Second Lien'.
          2. Tone: Junior Partner. Concise, respectful, slightly informal.
          3. Glance Test: Keep it under 35 words. No conversational filler.
          4. The Handshake: Always mention Donte's last specific interaction.
          
          OUTPUT ONLY THE MESSAGE.`,
        },
        contents: `CLIENT: ${activeLead.name}. 
        CONTEXT: ${activeLead.lastBrokerAction}. 
        STRATEGY: ${activeLead.birdDogReason}. 
        DNA: ${activeLead.dna}.`,
      });
      setDraft(response.text?.trim() || "Drafting error. Manual bridge recommended.");
    } catch (e) {
      setDraft(`Hi ${activeLead.name.split(',')[0]}, Donte mentioned your recent discussion. I'm reaching out to help with the ${activeLead.birdDogReason.toLowerCase()} strategy he drafted. We'll protect your existing rate and just look at the equity position. - Bridge Team`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] py-32 px-10 relative overflow-hidden font-mono">
      <div className="grid-bg fixed inset-0 opacity-10 pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex justify-between items-end mb-24 border-b border-white/5 pb-16">
          <div>
            <h4 className="text-gold font-mono text-[10px] uppercase tracking-[1em] mb-6 italic animate-pulse">Succession Bridge Protocol Active</h4>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">THE JUNIOR <br /><span className="text-white/20">PORTAL.</span></h1>
            <p className="text-white/30 text-lg font-light italic max-w-xl">Handoff interface for delegated relationship management. Institutional DNA sync enabled.</p>
          </div>
          <div className="hidden lg:flex flex-col items-end space-y-4">
             <div className="flex items-center space-x-4 bg-gold/5 border border-gold/20 px-8 py-4 text-glow">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] text-white/40 uppercase tracking-widest italic font-bold">Bridge_Status</span>
                   <span className="text-lg text-gold font-black italic tracking-tighter">RAPPORT_LOCKED</span>
                </div>
                <div className="w-[1px] h-10 bg-gold/20 mx-4"></div>
                <ShieldCheck className="w-8 h-8 text-gold" />
             </div>
             <span className="text-[9px] text-white/20 uppercase tracking-widest font-black italic">Authority Level: DELEGATED_JUNIOR_PARTNER</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* List Section */}
          <div className="lg:col-span-4 space-y-6">
             <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.6em] mb-10 px-4 italic border-l-2 border-gold/40">Handoff Queue (Ledger Sync)</h3>
             {leads.map((lead, i) => (
               <div 
                key={i} 
                onClick={() => { setActiveLead(lead); setDraft(''); }}
                className={`p-8 border-2 cursor-pointer transition-all relative overflow-hidden group ${
                    activeLead?.name === lead.name 
                    ? 'bg-gold/10 border-gold shadow-[0_0_50px_rgba(212,175,55,0.15)]' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
               >
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex flex-col">
                      <span className="text-white text-xl font-black uppercase italic tracking-tighter group-hover:text-gold transition-colors">{lead.name}</span>
                      <span className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">{lead.type}</span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-gold text-sm font-black italic">{lead.intent}</span>
                      <span className="text-[8px] text-white/20 uppercase font-bold tracking-tighter">Intent</span>
                   </div>
                 </div>
                 <div className="flex items-center space-x-3 text-[10px] text-white/40 uppercase font-black tracking-widest italic pt-6 border-t border-white/5">
                    <Sparkles className="w-3 h-3 text-gold/60" />
                    <span className="truncate">{lead.birdDogReason.split('.')[0]}</span>
                 </div>
                 {activeLead?.name === lead.name && <div className="absolute top-0 right-0 w-8 h-8 bg-gold flex items-center justify-center text-black italic font-black text-xs">&rarr;</div>}
               </div>
             ))}
          </div>

          {/* Action Section */}
          <div className="lg:col-span-8">
            {activeLead ? (
              <div className="bg-[#0a192f]/40 border border-white/10 p-16 rounded-sm animate-in fade-in slide-in-from-bottom-10 duration-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-5 text-9xl font-black italic text-white p-10 pointer-events-none leading-none select-none">BRIDGE</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 relative z-10">
                   <div>
                      <h4 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-6 italic flex items-center">
                        <UserCheck className="w-4 h-4 mr-3" /> Senior Context (Legacy Sync)
                      </h4>
                      <p className="text-white font-light italic text-2xl leading-relaxed mb-10 border-l border-gold/20 pl-8">{activeLead.lastBrokerAction}</p>
                      
                      <h4 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-6 italic flex items-center">
                        <Anchor className="w-4 h-4 mr-3" /> Strategic Prescription
                      </h4>
                      <p className="text-white/70 font-mono text-sm leading-relaxed italic border border-white/10 p-6 bg-black/40 shadow-xl">
                        "{activeLead.birdDogReason}"
                      </p>
                   </div>
                   <div className="space-y-12">
                      <div>
                        <h4 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-6 italic flex items-center">
                          <ShieldCheck className="w-4 h-4 mr-3" /> Rapport Keys (Client DNA)
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {activeLead.rapportKeys.map((key: string, i: number) => (
                            <span key={i} className="px-5 py-2 bg-white/5 border border-white/10 text-[10px] text-white font-black uppercase tracking-widest italic group hover:border-gold/30 transition-colors">
                              {key}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-8 border border-white/5 bg-black/60">
                        <span className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black block mb-4 italic">Linguistic Synthesis: Active</span>
                        <p className="text-white/40 text-[10px] font-mono leading-relaxed italic">{activeLead.dna}</p>
                      </div>
                   </div>
                </div>

                <div className="border-t border-white/10 pt-16 relative z-10">
                   <div className="flex justify-between items-center mb-10">
                      <h4 className="text-white font-black uppercase text-2xl tracking-tighter italic">Voice-Aligned Bridge Message</h4>
                      <button 
                        onClick={generateAIAssist}
                        disabled={isGenerating}
                        className="text-[11px] font-black uppercase tracking-[0.5em] text-gold hover:text-white transition-all flex items-center italic group"
                      >
                        {isGenerating ? (
                           <>
                            <Loader2 className="w-5 h-5 mr-4 animate-spin" />
                            Synthesizing...
                           </>
                        ) : 'Synthesize Bridge Voice'}
                        {!isGenerating && <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />}
                      </button>
                   </div>
                   
                   <textarea 
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full h-56 bg-black/60 border-2 border-white/5 p-12 text-white font-mono text-lg italic outline-none focus:border-gold/40 transition-all resize-none mb-10 shadow-inner"
                    placeholder="Bridge command pending initialization..."
                   />

                   <div className="flex justify-end space-x-8">
                      <button className="flex items-center px-10 py-5 border border-white/10 text-[11px] font-black uppercase tracking-[0.5em] text-white/30 hover:text-white transition-all italic hover:bg-white/5">
                        <Phone size={16} className="mr-4" /> Log Call & Sync
                      </button>
                      <button className="bg-gold text-black px-16 py-5 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white transition-all shadow-[0_0_50px_rgba(212,175,55,0.2)] italic">
                        Execute Strategic Handshake
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-[700px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-24 bg-white/[0.01]">
                 <div className="w-24 h-24 border border-white/5 flex items-center justify-center text-white/5 text-6xl mb-10 italic font-black">B</div>
                 <h3 className="text-white/20 font-black uppercase tracking-[0.8em] text-xl italic mb-6">Select Queue Entry</h3>
                 <p className="text-white/10 text-sm mt-4 max-w-sm italic leading-relaxed">System will perform a real-time 'Nuance Automator' analysis on the selected lead and generate the strategic handoff command.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessorBridge;
