import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Cpu, Sparkles, CheckCircle2, Upload, Loader2, BrainCircuit, FileText } from 'lucide-react';
import { synthesizeVoice, VoiceProfile } from '../utils/dnaSynthesizer';
import { parseCSV, CleanClientData } from '../utils/csvIngestor';

interface ShadowOnboardingProps {
  setLedgerData: (data: CleanClientData[]) => void;
}

const ShadowOnboarding: React.FC<ShadowOnboardingProps> = ({ setLedgerData }) => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const [voiceSample, setVoiceSample] = useState('');
  const [dnaProfile, setDnaProfile] = useState<VoiceProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState({ count: 0, time: 0 });

  useEffect(() => {
    const targetProgress = (step / 3) * 100;
    const timer = setInterval(() => {
      setProgress(prev => (prev < targetProgress ? prev + 1 : prev));
    }, 10);
    return () => clearInterval(timer);
  }, [step]);

  const analyzeVoiceDNA = async () => {
    setIsAnalyzing(true);
    try {
      const profile = await synthesizeVoice(voiceSample || "Simulated sample data");
      setDnaProfile(profile);
    } catch (error) {
      console.error("Synthesis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const start = performance.now();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Artificial delay for high-tech "processing" feel
      setTimeout(() => {
        const parsedData = parseCSV(text);
        setLedgerData(parsedData);
        setImportStats({ count: parsedData.length, time: Math.round(performance.now() - start) });
        setIsImporting(false);
        setStep(3);
      }, 1500);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#020202] py-32 px-6 relative flex flex-col items-center justify-center overflow-hidden">
      <div className="grid-bg fixed inset-0 opacity-5 pointer-events-none"></div>

      {/* PROGRESS TRACKER */}
      <div className="fixed top-24 left-0 w-full h-0.5 bg-white/5">
         <div 
          className="h-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-1000" 
          style={{ width: `${progress}%` }}
         ></div>
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h3 className="text-gold font-mono text-[10px] uppercase tracking-[0.5em] mb-6 italic">Protocol Phase 01</h3>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-10 leading-[0.9] italic">The Silent <br/> Handoff.</h2>
            <p className="text-white/40 text-xl font-light leading-relaxed mb-12">
              We don't automate emails. We automate <strong>trust</strong>. Your shadow only acts as you would, using your specific logic, phrases, and personal context.
            </p>
            <div className="grid grid-cols-2 gap-8 mb-12">
               <div className="p-8 border border-white/5 bg-white/[0.02]">
                  <h4 className="text-white font-bold text-xs uppercase mb-3 tracking-widest italic font-black underline decoration-gold/40">The Butler Protocol</h4>
                  <p className="text-white/30 text-xs font-light">Silent relationship maintenance. No robots. No templates. Just your voice, at scale.</p>
               </div>
               <div className="p-8 border border-white/5 bg-white/[0.02]">
                  <h4 className="text-white font-bold text-xs uppercase mb-3 tracking-widest italic font-black underline decoration-gold/40">The Bird Dog Protocol</h4>
                  <p className="text-white/30 text-xs font-light">Scans your past client book for active purchase intent. Pings you when it's time to close.</p>
               </div>
            </div>
            <button onClick={() => setStep(2)} className="btn-primary w-full py-6 italic font-black">Begin Ingestion Phase</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-700">
            <h3 className="text-gold font-mono text-[10px] uppercase tracking-[0.5em] mb-6 italic">Ingestion Lab</h3>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-10 leading-none italic">Asset DNA Extraction</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div className="space-y-6">
                 <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">1. Linguistic Memory</h4>
                 <textarea 
                    value={voiceSample}
                    onChange={e => setVoiceSample(e.target.value)}
                    className="w-full h-32 bg-white/5 border border-white/10 p-6 text-white font-mono text-[10px] outline-none focus:border-gold transition-all resize-none italic"
                    placeholder="Paste a recent high-value client email here..."
                  />
                  <button 
                    onClick={analyzeVoiceDNA} 
                    disabled={isAnalyzing}
                    className="w-full py-4 border border-gold/40 text-gold text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-black transition-all disabled:opacity-50 italic"
                  >
                    {isAnalyzing ? "Extracting Syntax..." : "Clone Voice DNA"}
                  </button>
                  {dnaProfile && <div className="text-[10px] text-emerald-400 font-mono italic animate-pulse">Signature Locked: Hybrid Expert</div>}
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-bold text-xs uppercase tracking-widest italic">2. Database Ingestion</h4>
                <div className="border-2 border-dashed border-white/10 p-10 text-center group hover:border-gold/30 transition-all cursor-pointer bg-white/[0.01] relative">
                   <input 
                      type="file" 
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   {isImporting ? (
                      <Loader2 className="mx-auto w-10 h-10 text-gold animate-spin mb-4" />
                   ) : (
                      <Upload className="mx-auto w-10 h-10 text-white/20 mb-4 group-hover:text-gold transition-colors" />
                   )}
                   <p className="text-white/40 text-[10px] font-light italic">
                     {isImporting ? "Parsing Ledger..." : "Drop .CSV Client List"}
                   </p>
                </div>
                <p className="text-[8px] text-white/20 uppercase tracking-widest leading-relaxed">
                   Supports: Encompass, Calyx, Salesforce, and Raw Master Files.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-10">
               <button onClick={() => setStep(1)} className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] hover:text-white transition-colors italic">Back</button>
               <button 
                onClick={() => setStep(3)} 
                disabled={!dnaProfile}
                className="btn-primary px-16 py-5 italic font-black shadow-[0_0_30px_rgba(212,175,55,0.2)] disabled:opacity-30"
               >
                 Review Profile &rarr;
               </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in zoom-in duration-700 text-center">
             <div className="w-24 h-24 border border-gold/30 bg-gold/5 mx-auto mb-10 flex items-center justify-center">
                <div className="w-2 h-12 bg-gold animate-pulse"></div>
             </div>
             <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-6 italic">Shadow Partnership Active.</h2>
             <div className="bg-white/[0.02] border border-white/10 p-8 mb-12 max-w-sm mx-auto">
                <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest mb-4">
                   <span>Clients Ingested</span>
                   <span className="text-white font-black">{importStats.count || 542}</span>
                </div>
                <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest">
                   <span>System Fidelity</span>
                   <span className="text-gold font-black">Institutional</span>
                </div>
             </div>
             <button onClick={() => navigate('/dashboard')} className="btn-primary px-24 italic font-black">Open Legacy Ledger</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShadowOnboarding;
