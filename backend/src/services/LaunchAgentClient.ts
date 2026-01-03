import axios, { AxiosInstance } from 'axios';

export interface LaunchAgentConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface ExecuteAdapterRequest {
  adapter_id: string;
  action: string;
  params: Record<string, any>;
}

export interface RiskBundleRequest {
  firm_id: string;
  include_executive_summary: boolean;
}

export interface AdapterResult {
  status: string;
  data: any;
  timestamp: string;
  adapter_id: string;
}

export interface RiskBundleResult {
  continuity: AdapterResult;
  security: AdapterResult;
  executive_summary?: string;
  risk_score?: number;
}

/**
 * Launch Agent Client - Integrates governance-first automation platform
 * Provides continuity audits, security scans, and risk assessments
 */
export class LaunchAgentClient {
  private client: AxiosInstance;
  private isAvailable: boolean = false;

  constructor(config: LaunchAgentConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      }
    });

    // Test connection
    this.checkAvailability();
  }

  /**
   * Check if Launch Agent service is available
   */
  private async checkAvailability(): Promise<void> {
    try {
      await this.client.get('/health');
      this.isAvailable = true;
      console.log('✅ Launch Agent connected');
    } catch (error) {
      this.isAvailable = false;
      console.warn('⚠️ Launch Agent not available:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get service availability status
   */
  public getAvailability(): boolean {
    return this.isAvailable;
  }

  /**
   * Execute a single adapter action
   */
  async executeAdapter(request: ExecuteAdapterRequest): Promise<AdapterResult> {
    if (!this.isAvailable) {
      throw new Error('Launch Agent service is not available');
    }

    try {
      const response = await this.client.post('/api/v1/execute', request);
      return {
        status: 'success',
        data: response.data,
        timestamp: new Date().toISOString(),
        adapter_id: request.adapter_id
      };
    } catch (error) {
      console.error(`Launch Agent adapter ${request.adapter_id} failed:`, error);
      throw new Error(`Adapter execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute risk bundle (continuity + security)
   */
  async executeRiskBundle(request: RiskBundleRequest): Promise<RiskBundleResult> {
    if (!this.isAvailable) {
      throw new Error('Launch Agent service is not available');
    }

    try {
      const response = await this.client.post('/api/v1/risk-bundle/execute', request);
      return response.data;
    } catch (error) {
      console.error('Launch Agent risk bundle failed:', error);
      throw new Error(`Risk bundle execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available adapters
   */
  async getAdapters(): Promise<string[]> {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const response = await this.client.get('/api/v1/adapters');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch adapters:', error);
      return [];
    }
  }

  /**
   * Run continuity audit for a firm
   */
  async runContinuityAudit(firmId: string): Promise<AdapterResult> {
    return this.executeAdapter({
      adapter_id: 'continuity',
      action: 'run_audit',
      params: { firm_id: firmId }
    });
  }

  /**
   * Run security scan for a firm
   */
  async runSecurityScan(firmId: string): Promise<AdapterResult> {
    return this.executeAdapter({
      adapter_id: 'security',
      action: 'run_audit',
      params: { firm_id: firmId }
    });
  }

  /**
   * Get comprehensive risk assessment (continuity + security)
   */
  async getComprehensiveRiskAssessment(firmId: string): Promise<RiskBundleResult> {
    return this.executeRiskBundle({
      firm_id: firmId,
      include_executive_summary: true
    });
  }
}

/**
 * Factory function to create Launch Agent client
 */
export function createLaunchAgentClient(): LaunchAgentClient | null {
  const baseUrl = process.env.LAUNCH_AGENT_URL;
  const apiKey = process.env.LAUNCH_AGENT_API_KEY;

  if (!baseUrl) {
    console.warn('⚠️ LAUNCH_AGENT_URL not configured. Launch Agent features disabled.');
    return null;
  }

  return new LaunchAgentClient({ baseUrl, apiKey });
}
