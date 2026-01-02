import React from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';

interface InitializeProps {
  onBegin: () => void;
}

export const InitializePage: React.FC<InitializeProps> = ({ onBegin }) => {
  return (
    <div className="min-h-screen bg-office-slate">
      <TopBar />

      <PageContainer maxWidth="standard">
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h1 text-text-primary mb-4">
              Initialize Firm Ledger
            </h1>

            <p className="text-body text-text-secondary mb-2 max-w-[600px] mx-auto">
              Establish your revenue continuity foundation.
            </p>

            <p className="text-body-strong text-text-primary mb-10 max-w-[600px] mx-auto">
              Your relationships are equity. We protect that equity.
            </p>

            <Button variant="primary" onClick={onBegin}>
              Begin Continuity Initialization
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
