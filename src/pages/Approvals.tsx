import React, { useState, useEffect } from 'react';
import { Check, X, Eye, FileText, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

// MOCK DATA: The "Drafts" waiting for review
const INITIAL_DRAFTS = [
  { id: 1, client: 'Hamilton Trust', type: 'Rate Alert', action: 'Refinance Opp', value: '$12.4M', urgency: 'Low' },
  { id: 2, client: 'Nexus Surgery Group', type: 'Continuity Risk', action: 'Personal Check-in', value: '$3.1M', urgency: 'Critical' },
  { id: 3, client: 'Venture Partners IV', type: 'Drift Signal', action: 'Quarterly Review', value: '$8.2M', urgency: 'Medium' },
];

const Approvals: React.FC = () => {
  const [drafts, setDrafts] = useState(INITIAL_DRAFTS);
  const [clearedCount, setClearedCount] = useState(0);

  // The "Dopamine Hit" Function
  const handleApprove = (id: number) => {
    // 1. Remove the item
    setDrafts(drafts.filter(d => d.id !== id));
    // 2. Increment "Work Done" counter
    setClearedCount(prev => prev + 1);
  };

  // EMPTY STATE: The "Zero Inbox" Moment
  if (drafts.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-[#4A9E88]/10 flex items-center justify-center mb-6 border border-[#4A9E88]/30">
          <Check className="w-8 h-8 text-[#4A9E88]" />
        </div>
        <h2 className="text-xl font-semibold tracking-wide text-[#E6E8EB] mb-2">Governance Complete</h2>
        <p className="text-[#B4BAC2] text-sm mb-8 text-center max-w-md">
          All {clearedCount} pending strategic drafts have been approved and queued for execution. System monitoring is active.
        </p>
        <Link to="/" className="px-6 py-2 bg-[#353C45] hover:bg-[#2B323B] text-white text-xs font-medium tracking-wider rounded transition-colors border border-[#353C45]">
          RETURN TO LEDGER
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] font-sans">
      {/* Header */}
      <div className="px-6 h-16 border-b border-[#353C45] flex items-center justify-between bg-[#222831]">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-[#C6A45E]" />
          <span className="font-semibold text-sm tracking-wide">PENDING APPROVALS ({drafts.length})</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#7A828C]">
          AWAITING GOVERNOR REVIEW
        </div>
      </div>

      {/* The List */}
      <div className="max-w-5xl mx-auto mt-8 px-6">
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="group relative bg-[#222831] border border-[#353C45] rounded-sm p-4 flex items-center justify-between hover:border-[#7A828C] transition-all">
              
              {/* Left: Identity & Context */}
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded flex items-center justify-center border ${draft.urgency === 'Critical' ? 'bg-[#B55A4A]/10 border-[#B55A4A]/30 text-[#B55A4A]' : 'bg-[#353C45] border-[#4B5563] text-[#B4BAC2]'}`}>
                  {draft.urgency === 'Critical' ? <ShieldAlert className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-[#E6E8EB]">{draft.client}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1F24] border border-[#353C45] text-[#7A828C]">{draft.type}</span>
                  </div>
                  <p className="text-xs text-[#B4BAC2] mt-0.5">Proposed Action: <span className="text-[#C6A45E]">{draft.action}</span></p>
                </div>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center space-x-3">
                <button className="px-3 py-1.5 text-xs font-medium text-[#B4BAC2] hover:text-white hover:bg-[#353C45] rounded transition-colors flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>Review Draft</span>
                </button>
                
                <div className="h-4 w-[1px] bg-[#353C45] mx-2"></div>

                <button 
                  onClick={() => handleApprove(draft.id)}
                  className="px-4 py-1.5 bg-[#C6A45E]/10 border border-[#C6A45E]/30 text-[#C6A45E] hover:bg-[#C6A45E] hover:text-[#1A1F24] text-xs font-bold tracking-wide rounded transition-all flex items-center space-x-2"
                >
                  <Check className="w-3 h-3" />
                  <span>APPROVE</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Approvals;
