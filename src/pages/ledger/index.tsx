import React, { useState } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { ContinuityLedgerTable } from '../../components/ledger/ContinuityLedgerTable';
import { DecisionRationalePanel } from '../../components/panels/DecisionRationalePanel';
import { RelationshipRecord, DecisionRationale } from '../../types/ledger';
import { sampleRelationships, sampleRationale } from '../../data/sampleLedgerData';

interface ContinuityLedgerPageProps {
  // These props allow for real data integration
  relationships?: RelationshipRecord[];
  rationaleData?: Record<string, DecisionRationale>;
  onPrepareDraft?: (relationshipId: string) => void;
  onRecord?: (relationshipId: string) => void;
  onAddToBatch?: (relationshipId: string) => void;
  onViewHistory?: (relationshipId: string) => void;
}

export const ContinuityLedgerPage: React.FC<ContinuityLedgerPageProps> = ({
  relationships = sampleRelationships,
  rationaleData = sampleRationale,
  onPrepareDraft = (id) => console.log('Prepare draft for:', id),
  onRecord = (id) => console.log('Record interaction for:', id),
  onAddToBatch = (id) => console.log('Add to batch:', id),
  onViewHistory = (id) => console.log('View history for:', id),
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const selectedRationale = selectedRecordId ? rationaleData[selectedRecordId] || null : null;

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
