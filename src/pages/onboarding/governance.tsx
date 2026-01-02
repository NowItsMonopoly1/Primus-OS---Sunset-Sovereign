import React from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface GovernanceModeProps {
  onProceed: () => void;
  onViewRules?: () => void;
}

export const GovernanceModePage: React.FC<GovernanceModeProps> = ({
  onProceed,
  onViewRules,
}) => {
  return (
    <div className="min-h-screen bg-office-slate">
      <TopBar />

      <PageContainer maxWidth="standard">
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="w-full max-w-[520px]">
            <h1 className="text-h1 text-text-primary mb-3 text-center">
              Governance Mode: Active
            </h1>

            <p className="text-body text-text-muted mb-10 text-center">
              All relationship outreach now follows firm-level review standards.
            </p>

            <Card padding="standard" className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-body-strong text-text-primary mb-1">
                    Governance Mode
                  </div>
                  <div className="text-body text-text-secondary">
                    Ensures consistent messaging and protects relationship equity.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-text-muted"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <div className="relative inline-block w-11 h-6 bg-trust-blue rounded-full cursor-not-allowed opacity-80">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="text-label text-text-muted flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Admin-only
              </div>
            </Card>

            <div className="flex flex-col gap-4 items-center">
              <Button variant="primary" onClick={onProceed} className="w-full max-w-[280px]">
                Proceed to Portfolio
              </Button>

              {onViewRules && (
                <button
                  onClick={onViewRules}
                  className="text-body text-trust-blue hover:underline"
                >
                  View Governance Rules
                </button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
