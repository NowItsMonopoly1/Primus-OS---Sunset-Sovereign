/**
 * Primus OS Business Edition - Frontend API Client
 *
 * Connects React UI to Express backend with optional real-time Supabase integration
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Lazy load Supabase to avoid import errors when not configured
let supabase: any = null;
let supabaseLoaded = false;

const loadSupabase = async () => {
  if (!supabaseLoaded) {
    try {
      const supabaseModule = await import('../supabaseClient');
      supabase = supabaseModule.supabase;
    } catch (error) {
      console.warn('⚠️  Supabase not configured. API calls will fail.');
      supabase = null;
    }
    supabaseLoaded = true;
  }
  return supabase;
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // ============================================
  // LEDGER ENDPOINTS
  // ============================================

  /**
   * Get portfolio list
   */
  async getPortfolio(params?: {
    status?: string;
    grade?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE}/ledger?${query}`);
    return handleResponse(response);
  },

  /**
   * Get relationship details with rationale
   */
  async getRelationship(id: string) {
    const response = await fetch(`${API_BASE}/ledger/${id}`);
    return handleResponse(response);
  },

  /**
   * Create outreach draft
   */
  async createDraft(relationshipId: string, data: { subject: string; body: string }) {
    const response = await fetch(`${API_BASE}/ledger/${relationshipId}/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Record interaction
   */
  async recordInteraction(
    relationshipId: string,
    data: {
      type: string;
      direction: string;
      notes?: string;
      valueEventWeight?: number;
    }
  ) {
    const response = await fetch(`${API_BASE}/ledger/${relationshipId}/record-interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Recalculate all continuity scores (admin)
   */
  async recalculateScores() {
    const response = await fetch(`${API_BASE}/ledger/recalculate-scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // ============================================
  // GOVERNANCE ENDPOINTS
  // ============================================

  /**
   * List all batches
   */
  async getBatches(status?: string) {
    const query = status ? `?status=${status}` : '';
    const response = await fetch(`${API_BASE}/governance/batches${query}`);
    return handleResponse(response);
  },

  /**
   * Create new batch
   */
  async createBatch(label: string) {
    const response = await fetch(`${API_BASE}/governance/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    return handleResponse(response);
  },

  /**
   * Get batch with drafts
   */
  async getBatch(batchId: string) {
    const response = await fetch(`${API_BASE}/governance/batches/${batchId}`);
    return handleResponse(response);
  },

  /**
   * Add draft to batch
   */
  async addDraftToBatch(batchId: string, draftId: string) {
    const response = await fetch(`${API_BASE}/governance/batches/${batchId}/add-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId }),
    });
    return handleResponse(response);
  },

  /**
   * Remove draft from batch
   */
  async removeDraftFromBatch(batchId: string, draftId: string) {
    const response = await fetch(`${API_BASE}/governance/batches/${batchId}/remove-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId }),
    });
    return handleResponse(response);
  },

  /**
   * Submit batch for review
   */
  async submitBatch(batchId: string) {
    const response = await fetch(`${API_BASE}/governance/batches/${batchId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  /**
   * Approve batch (admin)
   */
  async approveBatch(batchId: string) {
    const response = await fetch(`${API_BASE}/governance/batches/${batchId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  /**
   * Reject batch (admin)
   */
  async rejectBatch(batchId: string, reason: string) {
    const response = await fetch(`${API_BASE}/governance/batches/${batchId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  /**
   * Execute batch (admin)
   */
  async executeBatch(batchId: string) {
    const response = await fetch(`${API_BASE}/governance/batches/${batchId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  /**
   * Archive batch
   */
  async archiveBatch(batchId: string) {
    const response = await fetch(`${API_BASE}/governance/batches/${batchId}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // ============================================
  // ONBOARDING ENDPOINTS
  // ============================================

  /**
   * List ledger sources
   */
  async getLedgerSources() {
    const response = await fetch(`${API_BASE}/onboarding/ledger-sources`);
    return handleResponse(response);
  },

  /**
   * Create ledger source
   */
  async createLedgerSource(data: { sourceType: string; sourceName: string }) {
    const response = await fetch(`${API_BASE}/onboarding/ledger-sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Preview field mappings
   */
  async previewFields(ledgerSourceId: string, sampleHeaders: string[]) {
    const response = await fetch(`${API_BASE}/onboarding/preview-fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ledgerSourceId, sampleHeaders }),
    });
    return handleResponse(response);
  },

  /**
   * Approve field mappings
   */
  async approveFields(ledgerSourceId: string, mappings: any[]) {
    const response = await fetch(`${API_BASE}/onboarding/approve-fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ledgerSourceId, mappings }),
    });
    return handleResponse(response);
  },

  /**
   * Run assessment
   */
  async runAssessment(ledgerSourceId: string, rawRecords: any[]) {
    const response = await fetch(`${API_BASE}/onboarding/run-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ledgerSourceId, rawRecords }),
    });
    return handleResponse(response);
  },

  // ============================================
  // REAL-TIME SUBSCRIPTIONS (Hybrid Approach)
  // ============================================

  /**
   * Subscribe to continuity score updates for a specific relationship
   */
  async subscribeToContinuityUpdates(
    relationshipId: string,
    callback: (payload: any) => void
  ) {
    const client = await loadSupabase();
    if (!client) {
      console.warn('Supabase not available for continuity subscriptions');
      return { unsubscribe: () => {} };
    }

    return client
      .channel(`continuity-${relationshipId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'continuity_snapshots',
          filter: `relationship_id=eq.${relationshipId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to interaction updates for a specific relationship
   */
  async subscribeToInteractionUpdates(
    relationshipId: string,
    callback: (payload: any) => void
  ) {
    const client = await loadSupabase();
    if (!client) {
      console.warn('Supabase not available for interaction subscriptions');
      return { unsubscribe: () => {} };
    }

    return client
      .channel(`interactions-${relationshipId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `relationship_id=eq.${relationshipId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Subscribe to relationship status changes
   */
  async subscribeToRelationshipUpdates(
    firmId: string,
    callback: (payload: any) => void
  ) {
    const client = await loadSupabase();
    if (!client) {
      console.warn('Supabase not available for relationship subscriptions');
      return { unsubscribe: () => {} };
    }

    return client
      .channel(`relationships-${firmId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'relationships',
          filter: `firm_id=eq.${firmId}`,
        },
        callback
      )
      .subscribe();
  },

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    if (supabase) {
      supabase.removeAllChannels();
    }
  },

  // ============================================
  // LAUNCH AGENT ENDPOINTS
  // ============================================

  /**
   * Run automated continuity audit via Launch Agent
   */
  async runContinuityAudit(firmId: string) {
    const response = await fetch(`${API_BASE}/launch-agent/continuity-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firmId }),
    });
    return handleResponse(response);
  },

  /**
   * Run automated security scan via Launch Agent
   */
  async runSecurityScan(firmId: string) {
    const response = await fetch(`${API_BASE}/launch-agent/security-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firmId }),
    });
    return handleResponse(response);
  },

  /**
   * Get comprehensive risk assessment (continuity + security)
   */
  async getRiskAssessment(firmId: string) {
    const response = await fetch(`${API_BASE}/launch-agent/risk-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firmId }),
    });
    return handleResponse(response);
  },

  /**
   * Get available Launch Agent adapters
   */
  async getLaunchAgentAdapters() {
    const response = await fetch(`${API_BASE}/launch-agent/adapters`);
    return handleResponse(response);
  },

  /**
   * Check Launch Agent service status
   */
  async getLaunchAgentStatus() {
    const response = await fetch(`${API_BASE}/launch-agent/status`);
    return handleResponse(response);
  },
};

export default api;
