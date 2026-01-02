import React from 'react';
import { DecisionRationale } from '../../types/ledger';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DecisionRationalePanelProps {
  rationale: DecisionRationale | null;
  onPrepareDraft?: (relationshipId: string) => void;
  onAddToBatch?: (relationshipId: string) => void;
  onViewHistory?: (relationshipId: string) => void;
}

interface RationaleSectionProps {
  title: string;
  content: string;
}

const RationaleSection: React.FC<RationaleSectionProps> = ({ title, content }) => (
  <div className="mb-6 last:mb-0">
    <h4 className="text-label text-text-secondary uppercase mb-2">{title}</h4>
    <p className="text-body text-text-primary leading-relaxed">{content}</p>
  </div>
);

export const DecisionRationalePanel: React.FC<DecisionRationalePanelProps> = ({
  rationale,
  onPrepareDraft,
  onAddToBatch,
  onViewHistory,
}) => {
  if (!rationale) {
    return (
      <Card padding="standard" className="h-full">
        <h3 className="text-h2 text-text-primary mb-3">Decision Rationale</h3>
        <p className="text-body text-text-muted italic">
          Select a relationship to view rationale.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="standard" className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-h2 text-text-primary mb-2">Decision Rationale</h3>
        <p className="text-body text-text-muted mb-6">Why This Relationship Matters</p>

        <RationaleSection title="Recent Activity" content={rationale.recentActivity} />
        <RationaleSection title="Value Drivers" content={rationale.valueDrivers} />
        <RationaleSection title="Risk Considerations" content={rationale.riskConsiderations} />
        <RationaleSection title="Recommended Next Step" content={rationale.recommendedNextStep} />
        <RationaleSection title="Governance Note" content={rationale.governanceNote} />
      </div>

      <div className="border-t border-border-subtle pt-4 mt-6 space-y-3">
        {onPrepareDraft && (
          <Button
            variant="primary"
            className="w-full"
            onClick={() => onPrepareDraft(rationale.relationshipId)}
          >
            Prepare Draft for Review
          </Button>
        )}

        {onAddToBatch && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => onAddToBatch(rationale.relationshipId)}
          >
            Add to Approval Batch
          </Button>
        )}

        {onViewHistory && (
          <button
            onClick={() => onViewHistory(rationale.relationshipId)}
            className="text-body text-trust-blue hover:underline w-full text-center"
          >
            View history
          </button>
        )}
      </div>
    </Card>
  );
};
