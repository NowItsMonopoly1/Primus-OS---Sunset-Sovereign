import React from 'react';

interface TopBarProps {
  firmName?: string;
  showGovernanceMode?: boolean;
  governanceModeActive?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  firmName = 'G2R Continuity Partners',
  showGovernanceMode = false,
  governanceModeActive = true,
}) => {
  return (
    <div className="bg-federal-navy h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-white text-body-strong">Primus OS</span>
        <span className="text-white/40">|</span>
        <span className="text-white text-body">G2R</span>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-white/70 text-body">{firmName}</span>
        <span className="text-white/40">·</span>
        <span className="text-white/70 text-body">Leadership View</span>

        {showGovernanceMode && (
          <>
            <span className="text-white/40">·</span>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-body">Governance Mode:</span>
              <span className="text-white text-body-strong">
                {governanceModeActive ? 'On' : 'Off'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
