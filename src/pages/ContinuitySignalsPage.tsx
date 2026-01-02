import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getActiveSignals, resolveSignal, ContinuitySignal } from '../services/supabase/signals';

type SignalPhase = 'all' | 'contact' | 'engagement' | 'life-stage' | 'succession';

interface Signal {
  id: string;
  phase: 'contact' | 'engagement' | 'life-stage' | 'succession';
  relationshipName: string;
  message: string;
  severity: 'positive' | 'neutral' | 'warning' | 'critical';
  timestamp: string;
  actionRequired: boolean;
}

const PHASE_CONFIG = {
  contact: {
    label: 'Contact Recency',
    description: 'Track interaction frequency and recency patterns',
    icon: CheckCircle,
    color: '#4A9E88'
  },
  engagement: {
    label: 'Engagement Quality',
    description: 'Monitor relationship depth and responsiveness',
    icon: TrendingUp,
    color: '#C6A45E'
  },
  'life-stage': {
    label: 'Life-Stage Transitions',
    description: 'Detect critical life events and timing signals',
    icon: Clock,
    color: '#7A828C'
  },
  succession: {
    label: 'Succession Readiness',
    description: 'Assess continuity risk and heir visibility',
    icon: AlertTriangle,
    color: '#B55A4A'
  }
};

const MOCK_SIGNALS: Signal[] = [
  // PHASE 1: Contact Recency
  {
    id: 's1',
    phase: 'contact',
    relationshipName: 'Hamilton Trust',
    message: 'Last contact: 2 days ago. Engagement window optimal.',
    severity: 'positive',
    timestamp: '2025-01-01T10:00:00Z',
    actionRequired: false
  },
  {
    id: 's2',
    phase: 'contact',
    relationshipName: 'Nexus Surgery Group',
    message: '45 days since last contact. Critical threshold exceeded.',
    severity: 'critical',
    timestamp: '2025-01-01T09:30:00Z',
    actionRequired: true
  },
  {
    id: 's3',
    phase: 'contact',
    relationshipName: 'Venture Partners IV',
    message: '28 days since last contact. Engagement drift detected.',
    severity: 'warning',
    timestamp: '2025-01-01T08:00:00Z',
    actionRequired: true
  },

  // PHASE 2: Engagement Quality
  {
    id: 's4',
    phase: 'engagement',
    relationshipName: 'Hamilton Trust',
    message: 'Response rate: 95%. High engagement quality maintained.',
    severity: 'positive',
    timestamp: '2024-12-30T14:00:00Z',
    actionRequired: false
  },
  {
    id: 's5',
    phase: 'engagement',
    relationshipName: 'Nexus Surgery Group',
    message: 'Reduced email open rates (22% → 8%). Attention decline signal.',
    severity: 'warning',
    timestamp: '2024-12-29T11:00:00Z',
    actionRequired: true
  },
  {
    id: 's6',
    phase: 'engagement',
    relationshipName: 'Estate of J. Rourke',
    message: 'Meeting cancellations increased (3 in past month). Review required.',
    severity: 'warning',
    timestamp: '2024-12-28T16:00:00Z',
    actionRequired: true
  },

  // PHASE 3: Life-Stage Transitions
  {
    id: 's7',
    phase: 'life-stage',
    relationshipName: 'Estate of J. Rourke',
    message: 'Estate settlement phase detected. Succession timing critical (Q3 2026).',
    severity: 'warning',
    timestamp: '2024-12-27T10:00:00Z',
    actionRequired: true
  },
  {
    id: 's8',
    phase: 'life-stage',
    relationshipName: 'Venture Partners IV',
    message: 'Principal nearing retirement age (62). Beneficiary visibility low.',
    severity: 'warning',
    timestamp: '2024-12-26T13:00:00Z',
    actionRequired: true
  },
  {
    id: 's9',
    phase: 'life-stage',
    relationshipName: 'Nexus Surgery Group',
    message: 'Practice sale discussion detected (LinkedIn activity). Transition risk.',
    severity: 'critical',
    timestamp: '2024-12-25T09:00:00Z',
    actionRequired: true
  },

  // PHASE 4: Succession Readiness
  {
    id: 's10',
    phase: 'succession',
    relationshipName: 'Hamilton Trust',
    message: 'Successor relationship established (L. Hamilton, 28). Continuity secured.',
    severity: 'positive',
    timestamp: '2024-12-24T15:00:00Z',
    actionRequired: false
  },
  {
    id: 's11',
    phase: 'succession',
    relationshipName: 'Nexus Surgery Group',
    message: 'No heir/beneficiary contact history. Succession gap identified.',
    severity: 'critical',
    timestamp: '2024-12-23T11:00:00Z',
    actionRequired: true
  },
  {
    id: 's12',
    phase: 'succession',
    relationshipName: 'Venture Partners IV',
    message: 'Successor relationship weak (1 interaction in 12 months). Risk moderate.',
    severity: 'warning',
    timestamp: '2024-12-22T14:00:00Z',
    actionRequired: true
  }
];

const ContinuitySignalsPage = () => {
  const [activePhase, setActivePhase] = useState<SignalPhase>('all');
  const [signals, setSignals] = useState<ContinuitySignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load signals from database
  useEffect(() => {
    const loadSignals = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error } = await getActiveSignals();
      
      if (error) {
        console.error('Error loading signals:', error);
        setError('Failed to load signals');
        setSignals([]);
      } else {
        setSignals(data || []);
      }
      
      setLoading(false);
    };

    loadSignals();
  }, []);

  // Map signal types to phases
  const getPhaseFromType = (type: string): SignalPhase => {
    if (type.includes('CONTACT') || type.includes('GAP')) return 'contact';
    if (type.includes('ENGAGEMENT') || type.includes('DRIFT')) return 'engagement';
    if (type.includes('LIFE') || type.includes('STAGE')) return 'life-stage';
    if (type.includes('SUCCESSION')) return 'succession';
    return 'all';
  };

  // Map severity to old format
  const getSeverityType = (severity: 'GREEN' | 'YELLOW' | 'RED'): Signal['severity'] => {
    switch (severity) {
      case 'GREEN': return 'positive';
      case 'YELLOW': return 'warning';
      case 'RED': return 'critical';
      default: return 'neutral';
    }
  };

  // Transform signals for display
  const displaySignals: Signal[] = signals.map(s => ({
    id: s.id,
    phase: getPhaseFromType(s.signalType),
    relationshipName: s.relationshipId, // TODO: Join with relationships table to get name
    message: s.description,
    severity: getSeverityType(s.severity),
    timestamp: s.triggeredAt,
    actionRequired: s.severity === 'RED' || s.severity === 'YELLOW',
  }));

  const filteredSignals = activePhase === 'all'
    ? displaySignals
    : displaySignals.filter(s => s.phase === activePhase);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1F24] flex items-center justify-center">
        <div className="text-[#E6E8EB]">Loading continuity signals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1F24] flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  const getSeverityStyle = (severity: Signal['severity']) => {
    switch (severity) {
      case 'positive':
        return 'bg-[#4A9E88]/10 border-[#4A9E88]/30 text-[#4A9E88]';
      case 'warning':
        return 'bg-[#C6A45E]/10 border-[#C6A45E]/30 text-[#C6A45E]';
      case 'critical':
        return 'bg-[#B55A4A]/10 border-[#B55A4A]/30 text-[#B55A4A]';
      default:
        return 'bg-[#7A828C]/10 border-[#7A828C]/30 text-[#7A828C]';
    }
  };

  const getPhaseStats = (phase: keyof typeof PHASE_CONFIG) => {
    const phaseSignals = MOCK_SIGNALS.filter(s => s.phase === phase);
    const actionRequired = phaseSignals.filter(s => s.actionRequired).length;
    return { total: phaseSignals.length, actionRequired };
  };

  return (
    <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-[#C6A45E]" />
            Continuity Signals
          </h1>
          <p className="text-[#B4BAC2] text-sm">
            Real-time relationship health monitoring across the 4-phase continuity framework
          </p>
        </div>

        {/* Phase Filter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <button
            onClick={() => setActivePhase('all')}
            className={`p-4 rounded border transition-all ${
              activePhase === 'all'
                ? 'bg-[#C6A45E]/10 border-[#C6A45E] shadow-lg'
                : 'bg-[#222831] border-[#353C45] hover:border-[#7A828C]'
            }`}
          >
            <div className="text-left">
              <div className="text-xs uppercase tracking-wide text-[#7A828C] mb-1">All Phases</div>
              <div className="text-2xl font-mono font-bold text-[#E6E8EB]">{MOCK_SIGNALS.length}</div>
              <div className="text-xs text-[#B4BAC2] mt-1">
                {MOCK_SIGNALS.filter(s => s.actionRequired).length} require action
              </div>
            </div>
          </button>

          {(Object.keys(PHASE_CONFIG) as Array<keyof typeof PHASE_CONFIG>).map((phase) => {
            const config = PHASE_CONFIG[phase];
            const Icon = config.icon;
            const stats = getPhaseStats(phase);

            return (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={`p-4 rounded border transition-all ${
                  activePhase === phase
                    ? 'bg-[#222831] border-[#C6A45E] shadow-lg'
                    : 'bg-[#222831] border-[#353C45] hover:border-[#7A828C]'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                    <div className="text-xs uppercase tracking-wide text-[#7A828C]">
                      Phase {Object.keys(PHASE_CONFIG).indexOf(phase) + 1}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-[#E6E8EB] mb-1">{config.label}</div>
                  <div className="text-xs text-[#B4BAC2]">
                    {stats.total} signals • {stats.actionRequired} flagged
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Signals Feed */}
        <div className="space-y-3">
          {filteredSignals.map((signal) => {
            const config = PHASE_CONFIG[signal.phase];
            const Icon = config.icon;

            return (
              <div
                key={signal.id}
                className={`p-4 sm:p-6 rounded border transition-all ${
                  signal.actionRequired
                    ? 'bg-[#222831] border-[#C6A45E]/30 shadow-md'
                    : 'bg-[#222831] border-[#353C45]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Icon & Phase Badge */}
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.color}15`, border: `1px solid ${config.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div className="hidden sm:block text-[10px] uppercase tracking-widest text-[#7A828C]">
                      Phase {Object.keys(PHASE_CONFIG).indexOf(signal.phase) + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base text-[#E6E8EB]">
                        {signal.relationshipName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded border ${getSeverityStyle(signal.severity)}`}>
                          {signal.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-[#7A828C] hidden sm:block">
                          {new Date(signal.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-[#B4BAC2] mb-2">{config.label}</p>
                    <p className="text-sm text-[#E6E8EB]">{signal.message}</p>

                    {signal.actionRequired && (
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <button className="px-4 py-2 bg-[#C6A45E] text-[#1A1F24] rounded hover:bg-[#D4AF37] transition-colors text-sm font-medium">
                          Create Action Item
                        </button>
                        <button className="px-4 py-2 bg-[#353C45] text-[#E6E8EB] rounded hover:bg-[#2B323B] transition-colors text-sm font-medium">
                          View Relationship
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSignals.length === 0 && (
          <div className="text-center py-16">
            <Activity className="mx-auto text-[#7A828C] mb-4" size={48} />
            <p className="text-[#B4BAC2]">No signals for this phase</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContinuitySignalsPage;
