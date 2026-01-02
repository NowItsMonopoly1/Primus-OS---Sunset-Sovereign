// src/pages/ApprovalsPage.tsx
// Approval Batch page for PRIMUS OS Continuity System

import React, { useState, useEffect } from 'react';
import { CheckSquare, Archive, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getPendingDrafts, 
  approveDraft, 
  createBatch, 
  approveBatch,
  OutreachDraft 
} from '../services/supabase/governance';
import { getRelationships } from '../services/supabase/relationships';

interface ApprovalDraft {
  id: string;
  client: string;
  contact: string;
  action: string;
  risk: 'Low' | 'Medium' | 'High';
  value: string;
  submitted: string;
  rawDraft: OutreachDraft;
}

// Demo data for approvals - tells a story of proactive outreach
const INITIAL_DRAFTS: ApprovalDraft[] = [
  {
    id: '1',
    client: 'Nexus Surgery Group',
    contact: 'Dr. S. Vance',
    action: 'Re-engagement email drafted: "Haven\'t heard from you in 45 days..."',
    risk: 'High',
    value: '$3.1M',
    submitted: '2h ago'
  },
  {
    id: '2',
    client: 'Venture Partners IV',
    contact: 'M. Chen',
    action: 'Status check email: "Touching base on Q1 planning..."',
    risk: 'Medium',
    value: '$8.2M',
    submitted: '4h ago'
  },
  {
    id: '3',
    client: 'Estate of J. Rourke',
    contact: 'L. Rourke',
    action: 'Value confirmation: "Reviewing estate portfolio positioning..."',
    risk: 'Low',
    value: '$5.5M',
    submitted: '6h ago'
  }
];

const ApprovalsPage: React.FC = () => {
  const [drafts, setDrafts] = useState<ApprovalDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [approving, setApproving] = useState(false);
  const { user } = useAuth();

  // Load pending drafts from database
  useEffect(() => {
    const loadDrafts = async () => {
      setLoading(true);
      
      const { data: draftsData } = await getPendingDrafts();
      const { data: relationshipsData } = await getRelationships();
      
      if (draftsData && relationshipsData) {
        // Transform database drafts to display format
        const displayDrafts: ApprovalDraft[] = draftsData.map(draft => {
          const relationship = relationshipsData.find(r => r.id === draft.relationshipId);
          
          return {
            id: draft.id,
            client: relationship?.displayName || 'Unknown Client',
            contact: relationship?.roleOrSegment || 'Unknown Contact',
            action: draft.subject,
            risk: relationship?.isFounderDependent ? 'High' : 'Low',
            value: relationship?.annualRevenue ? `$${(relationship.annualRevenue / 1000000).toFixed(1)}M` : 'N/A',
            submitted: getTimeAgo(draft.createdAt),
            rawDraft: draft,
          };
        });
        
        setDrafts(displayDrafts);
      }
      
      setLoading(false);
    };

    loadDrafts();
  }, []);

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  const handleSelectDraft = (id: string) => {
    setSelectedDrafts(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDrafts.length === drafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(drafts.map(d => d.id));
    }
  };

  const handleApproveDraft = async (id: string) => {
    if (!user) return;
    
    setApproving(true);
    const { error } = await approveDraft(id, user.id);
    
    if (error) {
      setToast(`❌ Failed to approve draft`);
    } else {
      const draft = drafts.find(d => d.id === id);
      setDrafts(drafts.filter(d => d.id !== id));
      setToast(`✓ ${draft?.client} outreach approved`);
      setSelectedDrafts(prev => prev.filter(d => d !== id));
    }
    
    setApproving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const approveSelected = async () => {
    if (!user || selectedDrafts.length === 0) return;
    
    setApproving(true);
    const count = selectedDrafts.length;
    
    // Create a batch and approve all drafts
    const batchName = `Approval Batch ${new Date().toLocaleString()}`;
    const { data: batch } = await createBatch(
      {
        label: batchName,
        createdBy: user.id,
        draftIds: selectedDrafts,
      },
      user.firmId
    );
    
    if (batch) {
      await approveBatch(batch.id, user.id);
      setDrafts(drafts.filter(d => !selectedDrafts.includes(d.id)));
      setToast(`✓ ${count} draft${count > 1 ? 's' : ''} approved`);
      setSelectedDrafts([]);
    } else {
      setToast(`❌ Failed to approve batch`);
    }
    
    setApproving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleArchive = async () => {
    setDrafts(drafts.filter(d => !selectedDrafts.includes(d.id)));
    setToast(`Archived ${selectedDrafts.length} draft${selectedDrafts.length > 1 ? 's' : ''}`);
    setSelectedDrafts([]);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primus-bg flex items-center justify-center">
        <div className="text-primus-text">Loading approvals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primus-bg text-primus-text p-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 right-8 z-50 bg-primus-bg border-2 border-primus-gold px-6 py-3 rounded-lg flex items-center gap-3 shadow-2xl animate-fade-in">
          <CheckCircle className="w-5 h-5 text-primus-gold" />
          <span className="font-medium text-primus-text">{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-primus-gold" />
            Continuity Approvals
          </h1>
          <div className="flex gap-3">
            <button
              onClick={approveSelected}
              disabled={selectedDrafts.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              Approve ({selectedDrafts.length})
            </button>
            <button
              onClick={handleArchive}
              disabled={selectedDrafts.length === 0}
              className="px-4 py-2 bg-primus-slate/20 text-primus-text rounded-lg hover:bg-primus-slate/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </div>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-primus-bg border border-primus-slate/20 rounded-lg p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-primus-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primus-text mb-2">All continuity drafts cleared</h3>
            <p className="text-primus-slate">System monitoring active. Ledger up to date.</p>
          </div>
        ) : (
          <div className="bg-primus-bg border border-primus-slate/20 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-primus-slate/10">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedDrafts.length === drafts.length && drafts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-primus-slate/30 bg-primus-bg text-primus-gold focus:ring-primus-gold"
                />
                <span className="text-sm font-medium text-primus-slate">
                  {selectedDrafts.length > 0 ? `${selectedDrafts.length} selected` : `Select All (${drafts.length} drafts)`}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primus-slate/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primus-slate">Select</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primus-slate">Relationship</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primus-slate">Proposed Action</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primus-slate">Risk</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primus-slate">Value</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primus-slate">Submitted</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-primus-slate">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primus-slate/10">
                  {drafts.map((draft) => (
                    <tr key={draft.id} className="hover:bg-primus-slate/5 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedDrafts.includes(draft.id)}
                          onChange={() => handleSelectDraft(draft.id)}
                          className="rounded border-primus-slate/30 bg-primus-bg text-primus-gold focus:ring-primus-gold"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-primus-text">{draft.client}</div>
                          <div className="text-sm text-primus-slate">{draft.contact}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-primus-text italic">"{draft.action}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          draft.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                          draft.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {draft.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-primus-text">{draft.value}</td>
                      <td className="px-6 py-4 text-sm text-primus-slate">{draft.submitted}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleApproveDraft(draft.id)}
                          disabled={approving}
                          className="px-3 py-1 bg-primus-gold text-black rounded text-xs font-medium hover:bg-primus-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approving ? 'Approving...' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;