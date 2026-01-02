import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Zap, Shield, Search, Filter, Activity, ChevronDown } from 'lucide-react';

interface DashboardProps {
  data: any[]; // Keep for compatibility, but use relationships
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState<any[]>([]);
  const [selectedRelationship, setSelectedRelationship] = useState<any | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    // Use high-fidelity mock data for demo - tells story of risk vs stability
    const MOCK_DATA = [
      {
        id: '1',
        continuityGrade: 'AAA',
        continuityScore: 99,
        displayName: 'Hamilton Trust',
        roleOrSegment: 'E. Hamilton',
        status: 'STRONG',
        valueOutlook: 'Secured',
        lastInteractionAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d ago
        value: '$12.4M'
      },
      {
        id: '2',
        continuityGrade: 'BB',
        continuityScore: 42,
        displayName: 'Nexus Surgery Group',
        roleOrSegment: 'Dr. S. Vance',
        status: 'At Risk',
        valueOutlook: 'Critical',
        lastInteractionAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45d ago
        value: '$3.1M'
      },
      {
        id: '3',
        continuityGrade: 'A',
        continuityScore: 88,
        displayName: 'Estate of J. Rourke',
        roleOrSegment: 'L. Rourke',
        status: 'Monitoring',
        valueOutlook: 'Q3 2026',
        lastInteractionAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12d ago
        value: '$5.5M'
      },
      {
        id: '4',
        continuityGrade: 'BBB',
        continuityScore: 65,
        displayName: 'Venture Partners IV',
        roleOrSegment: 'M. Chen',
        status: 'Drifting',
        valueOutlook: 'Immediate',
        lastInteractionAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28d ago
        value: '$8.2M'
      },
    ];

    setRelationships(MOCK_DATA);
    setLoading(false);

    // Mock real-time subscriptions for demo
    console.log('Real-time subscriptions simulated for demo');
  }, []);

  const handleRowClick = async (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
    if (expandedRow !== id) {
      setDetailLoading(true);
      
      // DEMO MODE: Simulate API call with mock data instead of real API
      setTimeout(() => {
        // Find the relationship in our mock data
        const mockRelationships = [
          {
            id: '1',
            continuityGrade: 'AAA',
            continuityScore: 99,
            displayName: 'Hamilton Trust',
            roleOrSegment: 'E. Hamilton',
            status: 'STRONG',
            valueOutlook: 'Secured',
            lastInteractionAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            value: '$12.4M',
            // Additional mock details for expanded view
            riskFactors: ['Low engagement', 'Market volatility'],
            lastContact: '2 days ago',
            nextAction: 'Quarterly review scheduled',
            relationshipManager: 'Sarah Chen'
          },
          {
            id: '2',
            continuityGrade: 'BB',
            continuityScore: 42,
            displayName: 'Nexus Surgery Group',
            roleOrSegment: 'Dr. S. Vance',
            status: 'At Risk',
            valueOutlook: 'Critical',
            lastInteractionAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            value: '$3.1M',
            riskFactors: ['45+ days since contact', 'Competitor outreach detected'],
            lastContact: '45 days ago',
            nextAction: 'URGENT: Personal outreach required',
            relationshipManager: 'Marcus Rodriguez'
          },
          {
            id: '3',
            continuityGrade: 'A',
            continuityScore: 88,
            displayName: 'Estate of J. Rourke',
            roleOrSegment: 'L. Rourke',
            status: 'Monitoring',
            valueOutlook: 'Q3 2026',
            lastInteractionAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            value: '$5.5M',
            riskFactors: ['Estate transition in progress'],
            lastContact: '12 days ago',
            nextAction: 'Monitor estate proceedings',
            relationshipManager: 'Jennifer Walsh'
          },
          {
            id: '4',
            continuityGrade: 'BBB',
            continuityScore: 65,
            displayName: 'Venture Partners IV',
            roleOrSegment: 'M. Chen',
            status: 'Drifting',
            valueOutlook: 'Immediate',
            lastInteractionAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            value: '$8.2M',
            riskFactors: ['28 days since contact', 'Reduced engagement'],
            lastContact: '28 days ago',
            nextAction: 'Schedule immediate check-in',
            relationshipManager: 'David Park'
          }
        ];
        
        const detail = mockRelationships.find(rel => rel.id === id);
        setSelectedRelationship(detail || null);
        
        // DEMO MODE: Simulate real-time subscriptions (no actual API calls)
        console.log('Real-time subscriptions simulated for demo');
        
        setDetailLoading(false);
      }, 300); // Demo-optimized delay for responsiveness
      
      // DEMO MODE: No real cleanup needed since no real subscriptions
      return () => {
        console.log('Real-time subscriptions not available for this relationship');
      };
    }
  };

  if (loading) return <div className="p-8 text-center text-primus-text">Loading Continuity Ledger...</div>;

  return (
    <div className="min-h-screen bg-primus-bg text-primus-text p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <Shield className="text-primus-gold w-6 h-6 sm:w-8 sm:h-8" />
          <span className="truncate">Continuity Ledger</span>
        </h1>

        <div className="bg-primus-bg border border-primus-slate/20 rounded-lg overflow-hidden">
          {/* Mobile: Card View, Desktop: Table View */}
          <div className="hidden md:block overflow-x-auto lg:overflow-visible">
            <table className="w-full min-w-full lg:min-w-0">
              <thead className="bg-primus-slate/10">
                <tr>
                  <th className="px-8 py-5 text-left text-base font-semibold text-primus-slate">Rating</th>
                  <th className="px-8 py-5 text-left text-base font-semibold text-primus-slate">Record</th>
                  <th className="px-8 py-5 text-left text-base font-semibold text-primus-slate">Status</th>
                  <th className="px-8 py-5 text-left text-base font-semibold text-primus-slate">Horizon</th>
                  <th className="px-8 py-5 text-left text-base font-semibold text-primus-slate">Last Verified</th>
                  <th className="px-8 py-5 text-left text-base font-semibold text-primus-slate">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primus-slate/10">
                {relationships.map((rel) => (
                  <React.Fragment key={rel.id}>
                    <tr
                      className="hover:bg-primus-slate/5 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(rel.id)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primus-gold">{rel.continuityGrade}</span>
                          <span className="text-xs text-primus-slate opacity-0 hover:opacity-100 transition-opacity">
                            ({rel.continuityScore})
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-medium">
                        <div>
                          <div className="font-semibold text-primus-text text-base">{rel.displayName}</div>
                          <div className="text-sm text-primus-slate">{rel.roleOrSegment}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-2 rounded text-sm font-medium ${
                          rel.status === 'STRONG' ? 'bg-green-500/20 text-green-400' :
                          rel.status === 'At Risk' ? 'bg-red-500/20 text-red-400' :
                          rel.status === 'Monitoring' ? 'bg-yellow-500/20 text-yellow-400' :
                          rel.status === 'Drifting' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rel.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-primus-slate">
                        <div>
                          <div className="font-medium text-primus-text text-base">{rel.valueOutlook}</div>
                          <div className="text-sm">{rel.value}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-primus-slate text-base">
                        {rel.lastInteractionAt ? new Date(rel.lastInteractionAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-8 py-6">
                        <ChevronDown
                          className={`w-4 h-4 text-primus-slate transition-transform ${
                            expandedRow === rel.id ? 'rotate-180' : ''
                          }`}
                        />
                      </td>
                    </tr>
                    {expandedRow === rel.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-primus-slate/5">
                          {detailLoading ? (
                            <div className="flex items-center justify-center py-8 gap-3">
                              <Activity className="w-5 h-5 animate-spin text-primus-gold" />
                              <span className="text-primus-slate">Analyzing relationship signals...</span>
                            </div>
                          ) : selectedRelationship ? (
                            <div className="space-y-4">
                              <h3 className="font-semibold">Decision Panel</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-primus-slate">Value: ${selectedRelationship.value?.toLocaleString() || 'N/A'}</p>
                                  <p className="text-sm text-primus-slate">Rating Score: {selectedRelationship.numericScore || 'N/A'}/100</p>
                                  <p className="text-sm text-primus-slate">Rationale: {selectedRelationship.rationale || 'No rationale available'}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/approvals');
                                    }}
                                    className="px-6 py-3 bg-[#C6A45E] text-black rounded hover:bg-[#D4AF37] transition-colors text-sm font-medium"
                                  >
                                    Send to Governor
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/continuity-signals');
                                    }}
                                    className="px-6 py-3 bg-primus-slate/20 text-primus-text rounded hover:bg-primus-slate/40 transition-colors text-sm font-medium"
                                  >
                                    View Signals
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-primus-slate">Failed to load details</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-primus-slate/10">
            {relationships.map((rel) => (
              <div
                key={rel.id}
                className="p-4 hover:bg-primus-slate/5 transition-colors active:bg-primus-slate/10"
                onClick={() => handleRowClick(rel.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-bold text-primus-gold">{rel.continuityGrade}</span>
                      <span className="text-sm text-primus-slate">({rel.continuityScore})</span>
                    </div>
                    <h3 className="font-semibold text-base text-primus-text truncate">{rel.displayName}</h3>
                    <p className="text-sm text-primus-slate">{rel.roleOrSegment}</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-primus-slate transition-transform flex-shrink-0 ml-2 ${
                      expandedRow === rel.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    rel.status === 'STRONG' ? 'bg-green-500/20 text-green-400' :
                    rel.status === 'At Risk' ? 'bg-red-500/20 text-red-400' :
                    rel.status === 'Monitoring' ? 'bg-yellow-500/20 text-yellow-400' :
                    rel.status === 'Drifting' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {rel.status}
                  </span>
                  <span className="text-sm text-primus-slate">{rel.value}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-primus-slate">
                  <span>{rel.valueOutlook}</span>
                  <span>{rel.lastInteractionAt ? new Date(rel.lastInteractionAt).toLocaleDateString() : 'Never'}</span>
                </div>

                {expandedRow === rel.id && (
                  <div className="mt-4 pt-4 border-t border-primus-slate/10 space-y-3">
                    {detailLoading ? (
                      <div className="flex items-center justify-center py-6 gap-3">
                        <Activity className="w-5 h-5 animate-spin text-primus-gold" />
                        <span className="text-sm text-primus-slate">Analyzing relationship signals...</span>
                      </div>
                    ) : selectedRelationship ? (
                      <div className="space-y-4">
                        <div className="text-sm">
                          <p className="text-primus-slate mb-1">Value: <span className="text-primus-text font-medium">{selectedRelationship.value}</span></p>
                          <p className="text-primus-slate mb-1">Rating Score: <span className="text-primus-text font-medium">{selectedRelationship.numericScore || 'N/A'}/100</span></p>
                          <p className="text-primus-slate mb-1">Rationale: <span className="text-primus-text">{selectedRelationship.rationale || 'No rationale available'}</span></p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/approvals');
                            }}
                            className="w-full px-4 py-3 bg-[#C6A45E] text-black rounded hover:bg-[#D4AF37] transition-colors text-sm font-medium"
                          >
                            Send to Governor
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/continuity-signals');
                            }}
                            className="w-full px-4 py-3 bg-primus-slate/20 text-primus-text rounded hover:bg-primus-slate/40 transition-colors text-sm font-medium"
                          >
                            View Signals
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-primus-slate text-sm">Failed to load details</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {relationships.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto text-primus-slate mb-4" size={48} />
            <p className="text-primus-slate">No relationships in continuity ledger.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
