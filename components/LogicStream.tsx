import React, { useState } from 'react';
import { CheckCircle, Activity, X, Ban, Cpu, Copy, Send, MessageSquare, Edit3 } from 'lucide-react';
import { BirdDogAnalysis } from '../utils/birdDogEngine';

interface LogicStreamProps {
  analysis: BirdDogAnalysis | null;
  onClose: () => void;
}

const LogicStream: React.FC<LogicStreamProps> = ({ analysis, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!analysis) return null;

  // The "Ghost Writer" Logic - Synthesizing based on 'VoiceProfile'
  const generateDraft = () => {
    const firstName = analysis.clientName.split(',')[1]?.trim() || analysis.clientName.split(' ')[0];
    
    if (analysis.generatedNote.includes("HELOC") || analysis.generatedNote.includes("DO NOT REFI")) {
        return `Subject: Strategy for the ${firstName} household\n\nHey ${firstName},\n\nI was reviewing your file this morning. You are locked in at a great rate on your primary mortgage—do not touch that.\n\nHowever, with the equity you've built up, we can set up a "silent" second lien (HELOC) to handle those cash needs we discussed, without touching your main payment.\n\nI have the numbers ready. You free to chat for 5 mins?\n\n- D`;
    } else if (analysis.generatedNote.includes("Save") || analysis.generatedNote.includes("Green Light")) {
        return `Subject: Rates dropped (Time to look)\n\nHey ${firstName},\n\nMarket shifted this morning. I ran the numbers on your current loan vs. today's pricing.\n\nLooks like we can shave about ~$350/mo off your payment with zero out-of-pocket.\n\nI'm free after 2pm if you want to see the breakdown.\n\n- D`;
    } else {
        return `Subject: Quick check-in\n\nHey ${firstName},\n\nJust keeping an eye on rates for you. Nothing compelling enough to move on yet (market is still flat), but I'm watching it daily.\n\nHope the family is well.\n\n- D`;
    }
  };

  const draft = generateDraft();

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#0a192f] shadow-2xl border-l border-white/10 z-[100] flex flex-col font-mono text-xs animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#0a192f]">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2 text-gold">
            <Cpu className="w-5 h-5 animate-pulse" />
            <span className="text-base uppercase tracking-wider font-bold italic">Strategic Analysis Core</span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{analysis.clientName}</h2>
        <div className="flex items-center space-x-3 mt-2">
            <div className={`text-[9px] font-black px-2 py-0.5 border ${analysis.classification === 'HOT' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'} uppercase italic tracking-widest`}>
                {analysis.classification} MATCH
            </div>
            <div className="text-white/20 text-[9px] uppercase tracking-tighter font-bold">Confidence: {analysis.score}%</div>
        </div>
      </div>

      {/* The Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* Logic Steps */}
        <div className="space-y-6">
          <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic mb-4">Internal Reasoning Chain</h4>
          {analysis.reasoningChain.map((step, index) => (
            <div key={index} className="relative pl-6 border-l border-white/10 pb-2">
              <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border flex items-center justify-center bg-[#0a192f] ${
                  step.status === 'approved' || step.status === 'match' ? 'border-gold text-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 
                  step.status === 'blocked' ? 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10'
              }`}>
                  {step.status === 'blocked' ? <Ban size={6} /> : 
                  step.status === 'approved' ? <CheckCircle size={6} /> :
                  <div className="w-1 h-1 rounded-full bg-current opacity-20"></div>}
              </div>

              <div className="flex justify-between items-center mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest italic ${step.status === 'blocked' ? 'text-red-400' : 'text-white/60'}`}>
                      {step.step}
                  </span>
                  <span className="text-[8px] text-white/10 italic">{step.timestamp}</span>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed italic font-light">
                  {step.detail}
              </p>
            </div>
          ))}
        </div>

        {/* OUTREACH MODULE */}
        <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center space-x-2 text-gold mb-4">
                <MessageSquare size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] italic">DNA-Synthesized Outreach</span>
            </div>
            
            <div className="bg-black/40 border border-white/5 p-6 group relative hover:border-gold/20 transition-all">
                <pre className="text-white/60 font-mono text-[10px] whitespace-pre-wrap leading-relaxed italic">
                    {draft}
                </pre>
                
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black p-1 rounded">
                    <button className="p-1.5 text-white/20 hover:text-white transition-colors">
                        <Edit3 size={12} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                    onClick={handleCopy}
                    className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white py-3 border border-white/5 transition-all text-[9px] font-black uppercase tracking-widest italic"
                >
                    {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? "Synthesized" : "Copy Draft"}</span>
                </button>
                
                <a 
                    href={`mailto:?subject=${encodeURIComponent(draft.split('\n')[0].replace('Subject: ', ''))}&body=${encodeURIComponent(draft.split('\n').slice(2).join('\n'))}`}
                    className="flex items-center justify-center space-x-2 bg-gold hover:bg-white text-black py-3 transition-all text-[9px] font-black uppercase tracking-widest italic shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                >
                    <Send size={12} />
                    <span>Open in Gmail</span>
                </a>
            </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-black/40 text-center">
        <p className="text-[8px] text-white/10 uppercase tracking-[0.5em] italic font-black">
            Gemini 3 Flash • Protocol: Automate_Nuance_v2.0
        </p>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};

export default LogicStream;
