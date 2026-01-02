// src/pages/ApprovalsPage.tsx
// Approval Batch page for PRIMUS OS Continuity System

import React, { useState } from 'react';
import { CheckSquare, Archive, ShieldCheck, CheckCircle } from 'lucide-react';

interface ApprovalDraft {
  id: string;
  client: string;
  contact: string;
  action: string;
  risk: 'Low' | 'Medium' | 'High';
  value: string;
  submitted: string;
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
  const [drafts, setDrafts] = useState<ApprovalDraft[]>(INITIAL_DRAFTS);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);

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

  const approveDraft = (id: string) => {
    const draft = drafts.find(d => d.id === id);
    setDrafts(drafts.filter(d => d.id !== id));
    setToast(`✓ ${draft?.client} outreach approved`);
    setSelectedDrafts(prev => prev.filter(d => d !== id));
    setTimeout(() => setToast(null), 3000);
  };

  const approveSelected = () => {
    const count = selectedDrafts.length;
    setDrafts(drafts.filter(d => !selectedDrafts.includes(d.id)));
    setToast(`✓ ${count} draft${count > 1 ? 's' : ''} approved`);
    setSelectedDrafts([]);
    setTimeout(() => setToast(null), 3000);
  };

  const handleArchive = () => {
    const count = selectedDrafts.length;
    setDrafts(drafts.filter(d => !selectedDrafts.includes(d.id)));
    setToast(`Archived ${count} draft${count > 1 ? 's' : ''}`);
    setSelectedDrafts([]);
    setTimeout(() => setToast(null), 3000);
  };

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
                          onClick={() => approveDraft(draft.id)}
                          className="px-3 py-1 bg-primus-gold text-black rounded text-xs font-medium hover:bg-primus-gold/90 transition-all"
                        >
                          Approve
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