import React, { useState, useEffect } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { ContinuityLedgerTable } from '../../components/ledger/ContinuityLedgerTable';
import { DecisionRationalePanel } from '../../components/panels/DecisionRationalePanel';
import { RelationshipRecord, DecisionRationale } from '../../types/ledger';
import { useAuth } from '../../contexts/AuthContext';
import { getRelationships } from '../../services/supabase/relationships';

interface ContinuityLedgerPageProps {
  onPrepareDraft?: (relationshipId: string) => void;
  onRecord?: (relationshipId: string) => void;
  onAddToBatch?: (relationshipId: string) => void;
  onViewHistory?: (relationshipId: string) => void;
}

export const ContinuityLedgerPage: React.FC<ContinuityLedgerPageProps> = ({
  onPrepareDraft = (id) => console.log('Prepare draft for:', id),
  onRecord = (id) => console.log('Record interaction for:', id),
  onAddToBatch = (id) => console.log('Add to batch:', id),
  onViewHistory = (id) => console.log('View history for:', id),
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<RelationshipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load relationships from database
  useEffect(() => {
    const loadRelationships = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error } = await getRelationships();
      
      if (error) {
        console.error('Error loading relationships:', error);
        setError('Failed to load relationships');
        setRelationships([]);
      } else {
        // Transform Supabase data to ledger format
        const records: RelationshipRecord[] = (data || []).map(rel => ({
          id: rel.id,
          name: rel.displayName,
          status: rel.status,
          role: rel.roleOrSegment,
          continuityGrade: rel.continuityGrade,
          valueOutlook: rel.valueOutlook || '',
          lastInteraction: rel.lastInteractionAt ? new Date(rel.lastInteractionAt).toLocaleDateString() : 'Never',
          prepareAction: rel.isFounderDependent ? 'High Priority' : 'Standard',
        }));
        setRelationships(records);
      }
      
      setLoading(false);
    };

    loadRelationships();
  }, []);

  // TODO: Load rationale data from database
  const selectedRationale: DecisionRationale | null = null;

  if (loading) {
    return (
      <div className="min-h-screen bg-office-slate flex items-center justify-center">
        <div className="text-office-text">Loading continuity ledger...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-office-slate flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-office-slate">
      <TopBar showGovernanceMode governanceModeActive />

      <div className="p-page">
        <div className="flex gap-6">
          {/* Left: Continuity Ledger Table (70%) */}
          <div className="flex-1" style={{ flexBasis: '70%' }}>
            <ContinuityLedgerTable
              records={relationships}
              selectedRecordId={selectedRecordId}
              onSelectRecord={setSelectedRecordId}
              onPrepare={onPrepareDraft}
              onRecord={onRecord}
              onAddToBatch={onAddToBatch}
            />
          </div>

          {/* Right: Decision Rationale Panel (30%) */}
          <div className="w-full" style={{ flexBasis: '30%' }}>
            <DecisionRationalePanel
              rationale={selectedRationale}
              onPrepareDraft={onPrepareDraft}
              onAddToBatch={onAddToBatch}
              onViewHistory={onViewHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
