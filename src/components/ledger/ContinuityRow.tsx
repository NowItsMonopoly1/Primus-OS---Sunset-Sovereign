import React from 'react';
import { RelationshipRecord } from '../../types/ledger';
import { ScoreBadge } from './ScoreBadge';
import { ContactCell } from './ContactCell';

interface ContinuityRowProps {
  record: RelationshipRecord;
  isSelected: boolean;
  onSelect: (recordId: string) => void;
  onPrepare: (recordId: string) => void;
  onRecord: (recordId: string) => void;
  onAddToBatch: (recordId: string) => void;
}

const statusStyles = 'px-2 py-1 rounded text-label bg-surface-muted text-text-secondary';

const formatInteraction = (type: string, daysAgo: number): string => {
  return `${type} · ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
};

export const ContinuityRow: React.FC<ContinuityRowProps> = React.memo(({
  record,
  isSelected,
  onSelect,
  onPrepare,
  onRecord,
  onAddToBatch,
}) => {
  return (
    <tr
      className={`border-b border-border-subtle hover:bg-surface-muted cursor-pointer transition-colors ${
        isSelected ? 'bg-surface-muted' : ''
      }`}
      onClick={() => onSelect(record.id)}
    >
      <td className="px-4 py-3">
        <ScoreBadge score={record.continuityScore} numericScore={record.continuityScoreNumeric} />
      </td>

      <td className="px-4 py-3">
        <ContactCell
          name={record.contact.name}
          role={record.contact.role}
          initials={record.contact.initials}
          avatarUrl={record.contact.avatarUrl}
        />
      </td>

      <td className="px-4 py-3">
        <span className={statusStyles}>{record.status}</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-body text-text-primary">{record.valueOutlook}</span>
      </td>

      <td className="px-4 py-3 text-right">
        <span className="text-body text-text-muted">
          {formatInteraction(record.lastInteraction.type, record.lastInteraction.daysAgo)}
        </span>
      </td>

      <td className="px-4 py-3">
        <div
          className="flex items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onPrepare(record.id)}
            className="text-label text-text-secondary hover:text-trust-blue transition-colors"
          >
            Prepare
          </button>
          <span className="text-text-muted">·</span>
          <button
            onClick={() => onRecord(record.id)}
            className="text-label text-text-secondary hover:text-trust-blue transition-colors"
          >
            Record
          </button>
          <span className="text-text-muted">·</span>
          <button
            onClick={() => onAddToBatch(record.id)}
            className="text-label text-text-secondary hover:text-trust-blue transition-colors"
          >
            Add to Approval Batch
          </button>
        </div>
      </td>
    </tr>
  );
});
