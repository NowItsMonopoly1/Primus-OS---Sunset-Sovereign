import React, { useState } from 'react';
import { ContinuityScore } from '../../types/ledger';

interface ScoreBadgeProps {
  score: ContinuityScore;
  numericScore: number;
  className?: string;
}

const scoreColors: Record<ContinuityScore, string> = {
  AAA: 'bg-score-aaa text-white',
  AA: 'bg-score-aa text-white',
  A: 'bg-score-a text-white',
  BBB: 'bg-score-bbb text-white',
  BB: 'bg-score-bb text-carbon-black',
  B: 'bg-score-b text-carbon-black',
};

const getScoreContext = (score: ContinuityScore, numeric: number): string => {
  if (numeric >= 90) {
    return 'High stability. Frequent value events in last 18 months.';
  } else if (numeric >= 80) {
    return 'Strong relationship with consistent engagement pattern.';
  } else if (numeric >= 70) {
    return 'Stable relationship with regular touchpoints.';
  } else if (numeric >= 60) {
    return 'Moderate engagement. Review opportunities for strengthening.';
  } else if (numeric >= 50) {
    return 'Limited recent activity. Consider reactivation strategy.';
  } else {
    return 'Dormant relationship. Evaluate continuity value.';
  }
};

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, numericScore, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        className={`px-2 py-1 rounded text-label font-medium min-w-[48px] text-center ${scoreColors[score]} ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {score}
      </div>

      {showTooltip && (
        <div className="absolute z-50 left-0 top-full mt-2 px-3 py-2 bg-federal-navy text-white text-label rounded-card shadow-lg w-64">
          <div className="font-medium mb-1">Continuity Score: {numericScore}/100</div>
          <div className="font-normal">{getScoreContext(score, numericScore)}</div>
        </div>
      )}
    </div>
  );
};
