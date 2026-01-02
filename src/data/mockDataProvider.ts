// src/data/mockDataProvider.ts
// Mock data provider for development - easily replaceable with real Supabase calls

export interface MockRelationship {
  id: string;
  externalId: string | null;
  displayName: string;
  roleOrSegment: string;
  status: string;
  valueOutlook: string | null;
  continuityGrade: string;
  continuityScore: number;
  lastInteractionAt: string | null;
  lastInteractionType: string | null;
  latestSignal?: string | null;
  signalDate?: string | null;
  interactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockInteraction {
  id: string;
  relationship_id: string;
  type: string;
  direction: string;
  occurred_at: string;
  value_event_weight: number;
  notes: string | null;
  source_system: string | null;
  created_at: string;
}

// Mock relationships data
export const mockRelationships: MockRelationship[] = [
  {
    id: 'rel_1',
    externalId: null,
    displayName: 'J. Alvarez',
    roleOrSegment: 'Tier A Relationship',
    status: 'STRONG',
    valueOutlook: 'Renewal pipeline – tier A book',
    continuityGrade: 'AAA',
    continuityScore: 91,
    lastInteractionAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastInteractionType: 'EMAIL',
    latestSignal: 'Strong engagement pattern maintained',
    signalDate: new Date().toISOString(),
    interactionCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rel_2',
    externalId: null,
    displayName: 'M. Lewis',
    roleOrSegment: 'High-referral segment',
    status: 'STABLE',
    valueOutlook: 'Refi-eligible – rate review',
    continuityGrade: 'AA',
    continuityScore: 84,
    lastInteractionAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    lastInteractionType: 'CALL',
    latestSignal: 'Rate discussion completed',
    signalDate: new Date().toISOString(),
    interactionCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rel_3',
    externalId: null,
    displayName: 'R. Khan',
    roleOrSegment: 'Dormant opportunity',
    status: 'REVIEW',
    valueOutlook: 'Dormant – reactivation potential',
    continuityGrade: 'BBB',
    continuityScore: 67,
    lastInteractionAt: new Date(Date.now() - 98 * 24 * 60 * 60 * 1000).toISOString(),
    lastInteractionType: 'EMAIL',
    latestSignal: 'Extended dormancy period',
    signalDate: new Date().toISOString(),
    interactionCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock interactions data
export const mockInteractions: Record<string, MockInteraction[]> = {
  rel_1: [
    {
      id: 'int_1',
      relationship_id: 'rel_1',
      type: 'EMAIL',
      direction: 'OUTBOUND',
      occurred_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      value_event_weight: 2,
      notes: 'Renewal pipeline check-in',
      source_system: 'System',
      created_at: new Date().toISOString(),
    },
    {
      id: 'int_2',
      relationship_id: 'rel_1',
      type: 'CALL',
      direction: 'INBOUND',
      occurred_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      value_event_weight: 3,
      notes: 'Client requested rate review',
      source_system: 'System',
      created_at: new Date().toISOString(),
    },
  ],
  rel_2: [
    {
      id: 'int_3',
      relationship_id: 'rel_2',
      type: 'CALL',
      direction: 'OUTBOUND',
      occurred_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
      value_event_weight: 3,
      notes: 'Rate environment discussion',
      source_system: 'System',
      created_at: new Date().toISOString(),
    },
  ],
  rel_3: [
    {
      id: 'int_4',
      relationship_id: 'rel_3',
      type: 'EMAIL',
      direction: 'OUTBOUND',
      occurred_at: new Date(Date.now() - 98 * 24 * 60 * 60 * 1000).toISOString(),
      value_event_weight: 1,
      notes: 'Reactivation attempt',
      source_system: 'System',
      created_at: new Date().toISOString(),
    },
  ],
};

// Mock API functions - easily replaceable with real Supabase calls
export const mockDataProvider = {
  async getPortfolio(params?: { status?: string; grade?: string; limit?: number; offset?: number }) {
    console.log('📊 Mock: Fetching portfolio with params:', params);

    let filtered = [...mockRelationships];

    if (params?.status) {
      filtered = filtered.filter(rel => rel.status === params.status);
    }

    if (params?.grade) {
      filtered = filtered.filter(rel => rel.continuityGrade === params.grade);
    }

    const offset = params?.offset || 0;
    const limit = params?.limit || 50;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      data: paginated,
      pagination: {
        total: filtered.length,
        limit,
        offset,
      },
    };
  },

  async getRelationship(id: string) {
    console.log('📊 Mock: Fetching relationship:', id);

    const relationship = mockRelationships.find(rel => rel.id === id);
    if (!relationship) {
      throw new Error('Relationship not found');
    }

    const interactions = mockInteractions[id] || [];

    // Mock rationale calculation
    const rationale = {
      recentActivity: `Last contact: ${relationship.lastInteractionType} · ${Math.round((Date.now() - new Date(relationship.lastInteractionAt || '').getTime()) / (1000 * 60 * 60 * 24))} days ago`,
      valueDrivers: `${relationship.roleOrSegment} with ${relationship.continuityGrade} continuity grade`,
      riskConsiderations: relationship.status === 'REVIEW' ? 'Requires attention' : 'Stable relationship',
      recommendedNextStep: relationship.continuityScore > 80 ? 'Maintain engagement' : 'Increase touchpoints',
      governanceNote: `Relationship shows ${relationship.continuityGrade} continuity pattern`,
    };

    return {
      relationship,
      interactions,
      rationale,
      score: {
        score: relationship.continuityScore,
        grade: relationship.continuityGrade,
      },
    };
  },

  // Mock real-time subscriptions (no-op)
  async subscribeToContinuityUpdates(relationshipId: string, callback: Function) {
    console.log('📡 Mock: Continuity subscription for', relationshipId);
    return { unsubscribe: () => console.log('📡 Mock: Unsubscribed from continuity updates') };
  },

  async subscribeToInteractionUpdates(relationshipId: string, callback: Function) {
    console.log('📡 Mock: Interaction subscription for', relationshipId);
    return { unsubscribe: () => console.log('📡 Mock: Unsubscribed from interaction updates') };
  },

  async subscribeToRelationshipUpdates(firmId: string, callback: Function) {
    console.log('📡 Mock: Relationship subscription for', firmId);
    return { unsubscribe: () => console.log('📡 Mock: Unsubscribed from relationship updates') };
  },

  unsubscribeAll() {
    console.log('📡 Mock: Unsubscribed from all channels');
  },
};