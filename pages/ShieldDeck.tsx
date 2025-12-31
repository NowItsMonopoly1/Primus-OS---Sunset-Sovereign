
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ShieldDeck: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    { 
      title: "The Continuity Mandate", 
      subtitle: "This is not optional anymore.", 
      content: "Market conditions and producer aging have created a critical vulnerability for established institutions." 
    },
    { 
      title: "The $1T Producer Cliff", 
      subtitle: "Quantifying National Exposure", 
      content: "Over $1.2 Trillion in assets are currently held by producers entering a 5-year retirement window." 
    },
    { 
      title: "Your Current Risk Profile", 
      subtitle: "Personalized Audit Results", 
      content: "Based on our Continuity Audit, your institution is facing significant retention leakage without intervention." 
    },
    { 
      title: "Where Volume Disappears", 
      subtitle: "Relationship Attrition Proof", 
      content: "Relationships leak first. When a producer disengages, the institutional memory fades within 18 months." 
    },
    { 
      title: "Primus OS: The Continuity Engine", 
      subtitle: "The Architectural Solution", 
      content: "A unified platform designed to capture, clone, and continue professional production autonomously." 
    },
    { 
      title: "The Digital Twin", 
      subtitle: "The Best Producer Never Leaves", 
      content: "We synthesize professional DNA (voice, logic, patterns) to create a high-fidelity Shadow Twin." 
    },
    { 
      title: "Ghost Mode Doctrine", 
      subtitle: "Silent Execution Overview", 
      content: "Technology that reflects the expert rather than replacing them. White-label outcomes, always." 
    },
    { 
      title: "Security & Compliance", 
      subtitle: "Regulatory-Grade Infrastructure", 
      content: "GLBA, SOC-2 Ready, Zero-Knowledge Proof encryption. Built for the rigor of financial services." 
    },
    { 
      title: "Economics Model", 
      subtitle: "Asset Retention vs. Loss Curve", 
      content: "Deployment of Primus OS delivers a 14% lift in enterprise valuation by stabilizing recurring revenue." 
    },
    { 
      title: "Stakeholder Benefits", 
      subtitle: "The 'Everyone Wins' Framework", 
      content: "Owners secure equity. Producers secure legacy. Successors secure a validated book of business." 
    },
    { 
      title: "Zero-Friction Rollout", 
      subtitle: "Phased Deployment Strategy", 
      content: "30-day pilot validation followed by institutional integration across top-quartile producers." 
    },
    { 
      title: "The Protected Future", 
      subtitle: "The Decision Point", 
      content: "Establish your office's Silent Succession Standard today." 
    }
  ];

  const nextSlide = () => setActiveSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="grid-bg fixed inset-0 opacity-5 pointer-events-none"></div>
      
      {/* Slide Navigator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
         {slides.map((_, i) => (
           <div 
            key={i} 
            onClick={() => setActiveSlide(i)}
            className={`h-1 transition-all cursor-pointer ${activeSlide === i ? 'w-12 bg-gold shadow-[0_0_10px_rgba(212,175,55,1)]' : 'w-4 bg-white/10 hover:bg-white/30'}`}
           ></div>
         ))}
      </div>

      {/* Main Slide Content */}
      <div className="relative z-10 max-w-5xl w-full bg-[#0a192f] border border-white/5 aspect-video flex flex-col justify-center p-24 shadow-2xl overflow-hidden group">
         <div className="absolute top-10 right-10 flex items-center space-x-4 opacity-20">
            <span className="text-[10px] font-mono text-white tracking-[0.5em] uppercase">Slide 0{activeSlide + 1} / 12</span>
            <div className="w-10 h-10 border border-white flex items-center justify-center text-[12px] font-black italic">P</div>
         </div>

         <div key={activeSlide} className="animate-in fade-in slide-in-from-right-8 duration-700">
            <h4 className="text-gold font-mono text-xs uppercase tracking-[0.8em] mb-8">{slides[activeSlide].subtitle}</h4>
            <h2 className="text-7xl font-black text-white uppercase tracking-tighter leading-none mb-12 italic">
               {slides[activeSlide].title.split(':').map((part, i) => (
                 <span key={i} className={i === 1 ? 'text-[#8892b0]' : ''}>{part}{i === 0 && slides[activeSlide].title.includes(':') ? ':' : ''}<br /></span>
               ))}
            </h2>
            <p className="text-2xl text-[#8892b0] font-light leading-relaxed max-w-3xl">
               {slides[activeSlide].content}
            </p>
         </div>

         {activeSlide === slides.length - 1 && (
           <button 
            onClick={() => navigate('/onboarding')}
            className="btn-primary mt-12 w-max animate-in fade-in zoom-in duration-1000 delay-500"
           >
             Initialize Institutional Audit
           </button>
         )}

         {/* Navigation Controls */}
         <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/10 hover:text-gold transition-colors text-3xl font-thin">&larr;</button>
         <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/10 hover:text-gold transition-colors text-3xl font-thin">&rarr;</button>
      </div>

      {/* Technical Footer */}
      <div className="fixed bottom-10 left-10 flex flex-col space-y-1 opacity-20">
         <span className="text-[7px] font-mono text-white uppercase tracking-widest">DECK_ID: PRM_SHIELD_V1.0</span>
         <span className="text-[7px] font-mono text-white uppercase tracking-widest italic">FOR_INTERNAL_EXECUTIVE_USE</span>
      </div>
    </div>
  );
};

export default ShieldDeck;
