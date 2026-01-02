import React from 'react';
import { RelationshipRecord } from '../../types/ledger';
import { ContinuityRow } from './ContinuityRow';
import { Card } from '../ui/Card';

interface ContinuityLedgerTableProps {
  records: RelationshipRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
  onPrepare: (recordId: string) => void;
  onRecord: (recordId: string) => void;
  onAddToBatch: (recordId: string) => void;
}

export const ContinuityLedgerTable: React.FC<ContinuityLedgerTableProps> = ({
  records,
  selectedRecordId,
  onSelectRecord,
  onPrepare,
  onRecord,
  onAddToBatch,
}) => {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-card py-4 border-b border-border-subtle">
        <h2 className="text-h2 text-text-primary">Portfolio Overview</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-muted">
              <th className="px-4 py-3 text-left text-label text-text-secondary font-medium w-[100px]">
                Continuity Score
              </th>
              <th className="px-4 py-3 text-left text-label text-text-secondary font-medium min-w-[200px]">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-label text-text-secondary font-medium w-[100px]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-label text-text-secondary font-medium min-w-[220px]">
                Value Outlook
              </th>
              <th className="px-4 py-3 text-right text-label text-text-secondary font-medium w-[160px]">
                Last Interaction
              </th>
              <th className="px-4 py-3 text-right text-label text-text-secondary font-medium w-[280px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <ContinuityRow
                key={record.id}
                record={record}
                isSelected={selectedRecordId === record.id}
                onSelect={onSelectRecord}
                onPrepare={onPrepare}
                onRecord={onRecord}
                onAddToBatch={onAddToBatch}
              />
            ))}
          </tbody>
        </table>
      </div>

      {records.length === 0 && (
        <div className="px-card py-12 text-center text-body text-text-muted">
          No relationships loaded. Complete initialization to load your continuity ledger.
        </div>
      )}
    </Card>
  );
};
