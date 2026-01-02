import React from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ContinuityAssessment } from '../../types/ledger';

const defaultAssessment: ContinuityAssessment = {
  portfolioRating: 'A',
  portfolioRatingNumeric: 82,
  strongStablePercent: 67,
  reviewPercent: 14,
  dormantEquityPercent: 19,
};

interface AssessmentMetricProps {
  label: string;
  value: string;
  tooltip?: string;
}

const AssessmentMetric: React.FC<AssessmentMetricProps> = ({ label, value, tooltip }) => {
  return (
    <Card padding="standard" className="relative group">
      <div className="text-label text-text-muted mb-2">{label}</div>
      <div className="text-h1 text-text-primary">{value}</div>

      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-federal-navy text-white text-label rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {tooltip}
        </div>
      )}
    </Card>
  );
};

interface InitialAssessmentProps {
  onLoadLedger: () => void;
  assessment?: ContinuityAssessment;
}

export const InitialAssessmentPage: React.FC<InitialAssessmentProps> = ({
  onLoadLedger,
  assessment = defaultAssessment,
}) => {
  return (
    <div className="min-h-screen bg-office-slate">
      <TopBar />

      <PageContainer maxWidth="standard">
        <div className="py-12">
          <h1 className="text-h1 text-text-primary mb-3">
            Initial Continuity Scan Complete
          </h1>

          <p className="text-body text-text-muted mb-10">
            Your book has been analyzed for relationship stability and value timing.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-10">
            <AssessmentMetric
              label="Continuity Portfolio Rating"
              value={`${assessment.portfolioRating}`}
              tooltip={`${assessment.portfolioRatingNumeric}/100 – Initial assessment of relationship stability and equity.`}
            />

            <div className="grid grid-cols-3 gap-4">
              <AssessmentMetric
                label="Strong/Stable"
                value={`${assessment.strongStablePercent}%`}
              />
              <AssessmentMetric
                label="Review"
                value={`${assessment.reviewPercent}%`}
              />
              <AssessmentMetric
                label="Dormant Equity"
                value={`${assessment.dormantEquityPercent}%`}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="primary" onClick={onLoadLedger}>
              Load Continuity Ledger
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
