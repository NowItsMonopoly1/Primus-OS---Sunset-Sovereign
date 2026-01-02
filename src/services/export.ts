// src/services/export.ts
// Export functionality for reports and data

import { Relationship } from './supabase/relationships';
import { BaselineReport } from './supabase/baselines';
import { ContinuitySignal } from './supabase/signals';

// CSV Export Functions

export function exportRelationshipsToCSV(relationships: Relationship[]): void {
  const headers = [
    'ID',
    'Name',
    'Role/Segment',
    'Status',
    'Continuity Grade',
    'Continuity Score',
    'Last Interaction',
    'Last Interaction Type',
    'Assigned Agent ID',
    'Founder Dependent',
    'Avg Loan Size',
    'Annual Revenue',
    'Last Contact Days Ago',
    'Created At',
  ];

  const rows = relationships.map(r => [
    r.id,
    r.displayName,
    r.roleOrSegment,
    r.status,
    r.continuityGrade,
    r.continuityScore,
    r.lastInteractionAt || '',
    r.lastInteractionType || '',
    r.assignedAgentId || '',
    r.isFounderDependent ? 'Yes' : 'No',
    r.avgLoanSize || '',
    r.annualRevenue || '',
    r.lastContactDaysAgo || '',
    r.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadCSV(csv, `continuity-ledger-${getDateStamp()}.csv`);
}

export function exportSignalsToCSV(signals: ContinuitySignal[]): void {
  const headers = [
    'ID',
    'Relationship ID',
    'Severity',
    'Signal Type',
    'Title',
    'Description',
    'Metric Value',
    'Assigned To',
    'Resolved At',
    'Triggered At',
  ];

  const rows = signals.map(s => [
    s.id,
    s.relationshipId,
    s.severity,
    s.signalType,
    s.title,
    s.description,
    s.metricValue || '',
    s.assignedTo || '',
    s.resolvedAt || '',
    s.triggeredAt,
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadCSV(csv, `continuity-signals-${getDateStamp()}.csv`);
}

// PDF Export Functions (simplified - in production would use jsPDF or similar)

export function exportBaselineToPDF(baseline: BaselineReport): void {
  // Create a simple HTML representation for now
  // In production, use jsPDF or similar library
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Continuity Baseline Report</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 40px;
          color: #1A1F24;
          background: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #C6A45E;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #1A1F24;
          font-size: 28px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .header p {
          margin: 10px 0 0 0;
          color: #7A828C;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .section {
          margin: 30px 0;
        }
        .section h2 {
          font-size: 16px;
          font-weight: bold;
          color: #1A1F24;
          border-bottom: 1px solid #E6E8EB;
          padding-bottom: 10px;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .metric {
          border: 1px solid #E6E8EB;
          padding: 15px;
          border-radius: 4px;
        }
        .metric-label {
          font-size: 11px;
          color: #7A828C;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #1A1F24;
        }
        .scenario {
          background: #F8F9FA;
          padding: 20px;
          border-radius: 4px;
          margin: 15px 0;
        }
        .scenario h3 {
          font-size: 14px;
          margin: 0 0 15px 0;
          color: #1A1F24;
          font-weight: bold;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #E6E8EB;
          text-align: center;
          font-size: 10px;
          color: #7A828C;
        }
        .highlight {
          background: #C6A45E;
          color: #fff;
          padding: 20px;
          border-radius: 4px;
          margin: 30px 0;
          text-align: center;
        }
        .highlight-value {
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
        }
        @media print {
          body { margin: 0; padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SoloScale</h1>
        <p>Continuity Baseline Report</p>
      </div>

      <div class="section">
        <h2>Report Information</h2>
        <div class="metric-grid">
          <div class="metric">
            <div class="metric-label">Report Name</div>
            <div class="metric-value" style="font-size: 16px;">${baseline.reportName}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Created</div>
            <div class="metric-value" style="font-size: 16px;">${new Date(baseline.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Current Position</h2>
        <div class="metric-grid">
          <div class="metric">
            <div class="metric-label">Total Book Value</div>
            <div class="metric-value">${formatCurrency(baseline.totalBookValue)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Annual Revenue</div>
            <div class="metric-value">${formatCurrency(baseline.currentAnnualRevenue)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Client Count</div>
            <div class="metric-value">${baseline.totalClientCount}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Commission Rate</div>
            <div class="metric-value">${(baseline.avgCommissionRate * 100).toFixed(2)}%</div>
          </div>
        </div>
      </div>

      <div class="highlight">
        <div class="metric-label" style="color: rgba(255,255,255,0.8);">Continuity Infrastructure Value</div>
        <div class="highlight-value">${formatCurrency(baseline.deltaRevenue || 0)}</div>
        <div style="margin-top: 10px; font-size: 14px;">over ${baseline.projectedYears} years</div>
      </div>

      <div class="section">
        <h2>Scenario Analysis</h2>
        
        <div class="scenario">
          <h3>Scenario A: Walk Away (Unmanaged)</h3>
          <div class="metric-grid">
            <div class="metric">
              <div class="metric-label">Annual Decay Rate</div>
              <div class="metric-value">${(baseline.unmanagedDecayRate * 100).toFixed(0)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">Terminal Income</div>
              <div class="metric-value">${formatCurrency(baseline.unmanagedTerminalIncome)}</div>
            </div>
          </div>
        </div>

        <div class="scenario">
          <h3>Scenario B: Primus Protected (Managed Sunset)</h3>
          <div class="metric-grid">
            <div class="metric">
              <div class="metric-label">Annual Decay Rate</div>
              <div class="metric-value">${(baseline.managedDecayRate * 100).toFixed(0)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">Sunset Retention</div>
              <div class="metric-value">${(baseline.sunsetRetentionRate * 100).toFixed(0)}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">Annual Terminal Income</div>
              <div class="metric-value">${formatCurrency(baseline.terminalIncomeAnnual || 0)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Sunset Duration</div>
              <div class="metric-value">${baseline.sunsetDurationYears} years</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p><strong>SOLOSCALE</strong> • POWERED BY PRIMUS OS</p>
        <p>Confidential • For Internal Use Only</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print dialog after load
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Helper Functions

function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

function getDateStamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
