import React, { useState } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LedgerSource } from '../../types/ledger';

interface SourceOption {
  id: LedgerSource;
  title: string;
  description: string;
}

const sourceOptions: SourceOption[] = [
  {
    id: 'crm',
    title: 'CRM Platform (Salesforce, Surefire, Shape)',
    description: 'Seamless ledger continuity from CRM standards.',
  },
  {
    id: 'los',
    title: 'Loan Origination System (Encompass, Floify, Arive)',
    description: 'Connect continuity signals to your existing LOS.',
  },
  {
    id: 'spreadsheet',
    title: 'Internal Spreadsheets (Excel, Google Sheets)',
    description: 'Standardize your current ledger into firm-wide structure.',
  },
  {
    id: 'admin',
    title: 'Administrator Setup Required',
    description: 'Route this step to Operations or IT.',
  },
];

interface SourceConfirmationProps {
  onContinue: (source: LedgerSource) => void;
}

export const SourceConfirmationPage: React.FC<SourceConfirmationProps> = ({ onContinue }) => {
  const [selectedSource, setSelectedSource] = useState<LedgerSource | null>(null);

  return (
    <div className="min-h-screen bg-office-slate">
      <TopBar />

      <PageContainer maxWidth="standard">
        <div className="py-12">
          <h1 className="text-h1 text-text-primary mb-3">
            Confirm Current Ledger Source
          </h1>

          <p className="text-body text-text-muted mb-8">
            We'll align your existing ledger to firm continuity standards.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {sourceOptions.map((option) => (
              <Card
                key={option.id}
                interactive
                padding="standard"
                className={`${
                  selectedSource === option.id
                    ? 'border-trust-blue ring-2 ring-trust-blue ring-opacity-20'
                    : ''
                }`}
                onClick={() => setSelectedSource(option.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input
                      type="radio"
                      checked={selectedSource === option.id}
                      onChange={() => setSelectedSource(option.id)}
                      className="w-4 h-4 text-trust-blue focus:ring-focus-ring"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-body-strong text-text-primary mb-1">
                      {option.title}
                    </h3>
                    <p className="text-body text-text-secondary">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <a href="#" className="text-body text-trust-blue hover:underline">
              Need assistance with integration?
            </a>

            <Button
              variant="primary"
              disabled={!selectedSource}
              onClick={() => selectedSource && onContinue(selectedSource)}
            >
              Continue
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
