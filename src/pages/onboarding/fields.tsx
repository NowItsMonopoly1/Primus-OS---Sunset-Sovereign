import React from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { OnboardingFieldMapping } from '../../types/ledger';

const sampleMappings: OnboardingFieldMapping[] = [
  {
    detectedField: 'Full Name',
    confirmAs: 'Relationship Name',
    example: 'L. Carter',
    isMapped: true,
  },
  {
    detectedField: 'Segment',
    confirmAs: 'Book Class',
    example: 'Tier A',
    isMapped: true,
  },
  {
    detectedField: 'Next Contact Date',
    confirmAs: 'Value Outlook Date',
    example: 'Q3 2025',
    isMapped: true,
  },
  {
    detectedField: 'Custom_Field_1',
    confirmAs: '—',
    example: '—',
    isMapped: false,
  },
];

interface LedgerReviewProps {
  onApprove: () => void;
  onReviewLater: () => void;
  mappings?: OnboardingFieldMapping[];
}

export const LedgerReviewPage: React.FC<LedgerReviewProps> = ({
  onApprove,
  onReviewLater,
  mappings = sampleMappings,
}) => {
  return (
    <div className="min-h-screen bg-office-slate">
      <TopBar />

      <PageContainer maxWidth="wide">
        <div className="py-12">
          <h1 className="text-h1 text-text-primary mb-3">
            Approve Key Relationship Fields
          </h1>

          <p className="text-body text-text-muted mb-8">
            We aligned your existing ledger to firm continuity standards.
          </p>

          <Card padding="none" className="mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-left text-label text-text-secondary font-medium">
                      We Detected
                    </th>
                    <th className="px-4 py-3 text-left text-label text-text-secondary font-medium">
                      Confirm As
                    </th>
                    <th className="px-4 py-3 text-left text-label text-text-secondary font-medium">
                      Example
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, index) => (
                    <tr
                      key={index}
                      className="border-b border-border-subtle last:border-0 hover:bg-surface-muted transition-colors"
                    >
                      <td className="px-4 py-4 text-body text-text-primary">
                        {mapping.detectedField}
                      </td>
                      <td className="px-4 py-4 text-body-strong text-text-primary">
                        {mapping.isMapped ? (
                          mapping.confirmAs
                        ) : (
                          <span className="text-text-muted italic">
                            We'll help categorize this later.
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-body text-text-secondary">
                        {mapping.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <button
              onClick={onReviewLater}
              className="text-body text-text-secondary hover:text-text-primary transition-colors"
            >
              Review Details Later
            </button>

            <Button variant="primary" onClick={onApprove}>
              Approve Field Structure
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
