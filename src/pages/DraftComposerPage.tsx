// src/pages/DraftComposerPage.tsx
// Governed Messaging Draft Composer page for PRIMUS OS

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, FileText, Lightbulb } from 'lucide-react';
import { Relationship, ContinuitySignal } from '../data/continuityData';
import api from '../services/api';
import { getRelationshipSignals } from '../services/supabase/signals';
import { useCurrentProfile } from '../hooks/useCurrentProfile';

const DraftComposerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [signals, setSignals] = useState<ContinuitySignal[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(true);
  const { profile } = useCurrentProfile();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [relationshipsData, signalsData] = await Promise.all([
          api.getPortfolio(),
          getRelationshipSignals(id!),
        ]);

        const rel = relationshipsData.find((r: Relationship) => r.id === id);
        setRelationship(rel || null);

        setSignals(signalsData.data || []);

        // Prefill draft based on signals
        if (rel && relSignals.length > 0) {
          const recentSignal = relSignals[0];
          setSubject(`Update on ${rel.name}'s Continuity`);
          setBody(`Dear ${rel.name},\n\nBased on our recent insights, I wanted to reach out regarding your financial position.\n\n${recentSignal.message}\n\nPlease let me know if you'd like to discuss further.\n\nBest regards,\n${profile?.name || 'Your Advisor'}`);
          setRationale(`Prepared based on ${recentSignal.type.toLowerCase()}. Ensuring continuity and exploring opportunities.`);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, profile]);

  const handlePrepareDraft = async () => {
    if (!relationship || !profile) return;

    try {
      await api.createDraft(relationship.id, { subject, body });
      // Note: rationale is not in the api.createDraft, perhaps add to data
      alert('Draft prepared and sent to approvals queue.');
      // Could navigate back or clear form
    } catch (error) {
      console.error('Failed to create draft:', error);
      alert('Failed to prepare draft.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!relationship) return <div className="p-8 text-center">Relationship not found.</div>;

  return (
    <div className="min-h-screen bg-primus-bg text-primus-text p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <FileText className="text-primus-gold" />
          Draft Composer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Composer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primus-bg border border-primus-slate/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Compose Message</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-primus-bg border border-primus-slate/20 rounded focus:border-primus-blue focus:outline-none"
                    placeholder="Enter subject line"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 bg-primus-bg border border-primus-slate/20 rounded focus:border-primus-blue focus:outline-none resize-none"
                    placeholder="Compose your message..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePrepareDraft}
                className="px-6 py-3 bg-primus-blue text-black rounded hover:bg-primus-gold transition-colors flex items-center gap-2"
              >
                <Send size={20} />
                Prepare Draft
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Relationship Info */}
            <div className="bg-primus-bg border border-primus-slate/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Relationship</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {relationship.name}</p>
                <p><strong>Rating:</strong> {relationship.rating} ({relationship.numericScore})</p>
                <p><strong>Status:</strong> {relationship.status}</p>
                <p><strong>Horizon:</strong> {relationship.horizon} months</p>
                <p><strong>Last Verified:</strong> {relationship.lastVerified}</p>
              </div>
            </div>

            {/* Rationale */}
            <div className="bg-primus-bg border border-primus-slate/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="text-primus-gold" size={20} />
                Rationale
              </h3>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-primus-bg border border-primus-slate/20 rounded focus:border-primus-blue focus:outline-none resize-none text-sm"
                placeholder="Explain the purpose and reasoning for this communication..."
              />
            </div>

            {/* Recent Signals */}
            <div className="bg-primus-bg border border-primus-slate/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Signals</h3>
              <div className="space-y-3">
                {signals.slice(0, 3).map(signal => (
                  <div key={signal.id} className="text-sm">
                    <p className="font-medium">{signal.type}</p>
                    <p className="text-primus-slate">{signal.message}</p>
                    <p className="text-xs text-primus-slate mt-1">
                      {new Date(signal.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftComposerPage;