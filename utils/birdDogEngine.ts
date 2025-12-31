import { VoiceProfile, DEFAULT_PROFILE } from './dnaSynthesizer';

export interface ThinkingStep {
  step: string;
  status: 'scanning' | 'match' | 'calculating' | 'blocked' | 'approved';
  detail: string;
  timestamp: string;
}

export interface BirdDogAnalysis {
  clientName: string;
  score: number;
  classification: 'HOT' | 'WARM' | 'NURTURE' | 'COLD';
  reasoningChain: ThinkingStep[];
  generatedNote: string;
  complianceFlag: boolean;
}

export const analyzeLead = (
  client: any, 
  currentMarketRate: number, 
  voiceDNA: VoiceProfile = DEFAULT_PROFILE
): BirdDogAnalysis => {
  const steps: ThinkingStep[] = [];
  
  // Robust Data Parsing
  const parseRate = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    return 4.5; 
  };

  const currentRate = parseRate(client.currentRate);
  const ltv = parseRate(client.ltv) || 80;

  // 1. THE TRAP CHECK (The Nuance Automator)
  // If their current rate is < 4%, a standard Refi is toxic to the relationship.
  const isRateTrap = currentRate < 4.0;
  
  steps.push({
    step: "Rate Trap Analysis",
    status: isRateTrap ? 'blocked' : 'scanning',
    detail: isRateTrap 
      ? `Client locked at ${currentRate}%. REFI IS TOXIC. Pivoting logic.` 
      : `Rate is ${currentRate}%. Standard Refi path open.`,
    timestamp: new Date().toLocaleTimeString()
  });

  // 2. Equity & Life Event Scan
  const estimatedEquity = 100 - ltv;
  const lifeEventMatch = (client.notes || "").match(/(divorce|marriage|baby|college|remodel|debt|cash|boat|tuition|stock)/i);
  
  if (lifeEventMatch) {
      steps.push({
          step: "Life Event Trigger",
          status: 'match',
          detail: `Detected urgent keyword: "${lifeEventMatch[0]}".`,
          timestamp: new Date().toLocaleTimeString()
      });
  }

  // 3. Decision Matrix (The Strategy Engine)
  let classification: BirdDogAnalysis['classification'] = 'NURTURE';
  let strategy = "Monitor";
  let icon = "💤";

  // SCENARIO A: The "Rate Trap" Pivot (HELOC/Second)
  if (isRateTrap) {
    // If they are trapped but have equity + need cash -> PIVOT
    if (estimatedEquity > 30 && lifeEventMatch) {
      classification = 'HOT';
      strategy = "HELOC_PIVOT";
      icon = "💡";
      steps.push({
        step: "Strategy Pivot",
        status: 'approved',
        detail: "High Equity + Cash Need detected. Recommended: Fixed-Rate HELOC to preserve 1st Mtg.",
        timestamp: new Date().toLocaleTimeString()
      });
    }
  } 
  // SCENARIO B: The Standard Refi
  else if ((currentRate - currentMarketRate) > 0.75) {
      classification = 'HOT';
      strategy = "REFI_STANDARD";
      icon = "🔥";
      steps.push({
          step: "Rate Spread Validation",
          status: 'approved',
          detail: `Spread is ${(currentRate - currentMarketRate).toFixed(2)}%. Profitable for client.`,
          timestamp: new Date().toLocaleTimeString()
      });
  }

  // 4. Generating the "Junior Partner" Note (The Glance Test)
  let note = "";
  
  if (strategy === "HELOC_PIVOT") {
    note = `⛔ **DO NOT REFI.** Locked at ${currentRate}%. \n💡 **The Play:** Pitch a **HELOC** for "${lifeEventMatch?.[0]}". Keeps the 1st safe, gets you the deal.`;
  } 
  else if (strategy === "REFI_STANDARD") {
    note = `${icon} **Green Light.** Spread is ${(currentRate - currentMarketRate).toFixed(2)}%. \n💰 **The Play:** Save them ~$${Math.round((currentRate - currentMarketRate) * 400)}/mo.`;
  } 
  else {
    note = `Monitoring. Rate is ${currentRate}%. Equity is ${estimatedEquity}%. No high-conviction moves yet.`;
  }

  return {
    clientName: client.name,
    score: classification === 'HOT' ? 95 : 40,
    classification,
    reasoningChain: steps,
    generatedNote: note,
    complianceFlag: false
  };
};