import React, { useState } from 'react';
import { TrendingDown, Shield, DollarSign, Users, Clock, AlertTriangle } from 'lucide-react';

type Scenario = 'unmanaged' | 'protected';

const Outcomes = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>('unmanaged');
  const [timeHorizon, setTimeHorizon] = useState(5); // years

  // Demo data - in production, this would come from actual relationship data
  const currentBookValue = 29200000; // $29.2M total from Dashboard relationships
  const avgCommissionRate = 0.01; // 100 bps
  const currentAnnualRevenue = currentBookValue * avgCommissionRate; // $292K

  // SCENARIO A: Walk Away (Unmanaged)
  const calculateUnmanaged = () => {
    const decayRate = 0.20; // 20% annual decay
    let remainingBook = currentBookValue;
    let totalRevenue = 0;
    const yearlyBreakdown = [];

    for (let year = 1; year <= timeHorizon; year++) {
      remainingBook = remainingBook * (1 - decayRate);
      const yearRevenue = remainingBook * avgCommissionRate;
      totalRevenue += yearRevenue;

      yearlyBreakdown.push({
        year,
        bookValue: remainingBook,
        revenue: yearRevenue,
        clientsLost: Math.floor((currentBookValue - remainingBook) / (currentBookValue / 47)) // 47 = total mock clients
      });
    }

    return {
      totalRevenue,
      finalBookValue: remainingBook,
      totalDecay: currentBookValue - remainingBook,
      decayPercentage: ((currentBookValue - remainingBook) / currentBookValue) * 100,
      yearlyBreakdown,
      terminalIncome: 0 // Walk away = $0 ongoing
    };
  };

  // SCENARIO B: Primus Protected (Managed Sunset)
  const calculateProtected = () => {
    const decayRate = 0.05; // 5% annual decay with continuity
    const sunsetRetention = 0.30; // 30% of book becomes retained sunset income
    let remainingBook = currentBookValue;
    let totalRevenue = 0;
    const yearlyBreakdown = [];

    for (let year = 1; year <= timeHorizon; year++) {
      remainingBook = remainingBook * (1 - decayRate);
      const yearRevenue = remainingBook * avgCommissionRate;
      totalRevenue += yearRevenue;

      yearlyBreakdown.push({
        year,
        bookValue: remainingBook,
        revenue: yearRevenue,
        retainedIncome: (currentBookValue * sunsetRetention * avgCommissionRate) / 12 // Monthly
      });
    }

    const terminalIncome = currentBookValue * sunsetRetention * avgCommissionRate;

    return {
      totalRevenue,
      finalBookValue: remainingBook,
      totalDecay: currentBookValue - remainingBook,
      decayPercentage: ((currentBookValue - remainingBook) / currentBookValue) * 100,
      yearlyBreakdown,
      terminalIncome, // Ongoing monthly income after exit
      sunsetDuration: 10 // years of retained income
    };
  };

  const unmanaged = calculateUnmanaged();
  const primusProtected = calculateProtected();
  const delta = primusProtected.totalRevenue - unmanaged.totalRevenue;

  const format = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const formatMonthly = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n / 12);

  return (
    <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-[#C6A45E]" />
            Continuity Outcome Engine
          </h1>
          <p className="text-[#B4BAC2] text-sm">
            What happens to your life's work if you do nothing?
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="mb-8 bg-[#222831] border border-[#353C45] p-6 rounded">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold text-[#E6E8EB]">
              Projection Timeframe
            </label>
            <span className="text-[#C6A45E] font-mono font-bold text-lg">
              {timeHorizon} Years
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="10"
            step="1"
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(Number(e.target.value))}
            className="w-full h-3 accent-[#C6A45E] cursor-pointer"
            style={{ touchAction: 'none' }}
          />
          <div className="flex justify-between text-xs text-[#7A828C] mt-2">
            <span>3 years</span>
            <span>10 years</span>
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* SCENARIO A: Walk Away */}
          <div
            className={`border-2 rounded-lg transition-all cursor-pointer ${
              activeScenario === 'unmanaged'
                ? 'border-[#B55A4A] bg-[#B55A4A]/5'
                : 'border-[#353C45] bg-[#222831] opacity-60 hover:opacity-100'
            }`}
            onClick={() => setActiveScenario('unmanaged')}
          >
            <div className="p-6 border-b border-[#353C45]">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-[#B55A4A]" />
                <h2 className="text-xl font-bold text-[#E6E8EB]">Scenario A: Walk Away</h2>
              </div>
              <p className="text-sm text-[#B4BAC2]">
                Unmanaged retirement with no continuity plan
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Total Revenue */}
              <div>
                <div className="text-xs text-[#7A828C] uppercase mb-1">Total Revenue ({timeHorizon}-Year)</div>
                <div className="text-3xl font-mono font-bold text-[#B55A4A]">
                  {format(unmanaged.totalRevenue)}
                </div>
              </div>

              {/* Book Decay */}
              <div>
                <div className="text-xs text-[#7A828C] uppercase mb-1">Book Value Decay</div>
                <div className="text-2xl font-mono font-bold text-[#7A828C] mb-1">
                  -{format(unmanaged.totalDecay)}
                </div>
                <div className="text-xs text-[#B55A4A]">
                  {unmanaged.decayPercentage.toFixed(0)}% of book lost
                </div>
              </div>

              {/* Terminal Income */}
              <div className="bg-[#1A1F24] border border-[#353C45] p-4 rounded">
                <div className="text-xs text-[#7A828C] uppercase mb-1">Terminal Income (After Exit)</div>
                <div className="text-2xl font-mono font-bold text-[#7A828C]">
                  $0 / month
                </div>
                <div className="text-xs text-[#B55A4A] mt-2">
                  Career ends, income stops
                </div>
              </div>

              {/* Key Losses */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[#7A828C]" />
                  <span className="text-[#B4BAC2]">
                    ~{unmanaged.yearlyBreakdown[timeHorizon - 1]?.clientsLost || 0} clients lost to competitors
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[#7A828C]" />
                  <span className="text-[#B4BAC2]">
                    {(currentBookValue / (currentAnnualRevenue / 12 / 4000)).toFixed(0)} years of work → $0 residual
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SCENARIO B: Protected */}
          <div
            className={`border-2 rounded-lg transition-all cursor-pointer ${
              activeScenario === 'protected'
                ? 'border-[#C6A45E] bg-[#C6A45E]/5 shadow-lg'
                : 'border-[#353C45] bg-[#222831] opacity-60 hover:opacity-100'
            }`}
            onClick={() => setActiveScenario('protected')}
          >
            <div className="p-6 border-b border-[#353C45]">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-[#C6A45E]" />
                <h2 className="text-xl font-bold text-[#E6E8EB]">Scenario B: Primus Protected</h2>
              </div>
              <p className="text-sm text-[#B4BAC2]">
                Managed sunset with continuity infrastructure
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Total Revenue */}
              <div>
                <div className="text-xs text-[#7A828C] uppercase mb-1">Total Revenue ({timeHorizon}-Year)</div>
                <div className="text-3xl font-mono font-bold text-[#4A9E88]">
                  {format(primusProtected.totalRevenue)}
                </div>
              </div>

              {/* Book Decay */}
              <div>
                <div className="text-xs text-[#7A828C] uppercase mb-1">Book Value Decay</div>
                <div className="text-2xl font-mono font-bold text-[#E6E8EB] mb-1">
                  -{format(primusProtected.totalDecay)}
                </div>
                <div className="text-xs text-[#4A9E88]">
                  Only {primusProtected.decayPercentage.toFixed(0)}% decay with continuity
                </div>
              </div>

              {/* Terminal Income */}
              <div className="bg-[#C6A45E]/10 border-2 border-[#C6A45E] p-4 rounded">
                <div className="text-xs text-[#C6A45E] uppercase mb-1 font-bold">Terminal Income (After Exit)</div>
                <div className="text-2xl font-mono font-bold text-[#C6A45E]">
                  {formatMonthly(primusProtected.terminalIncome)} / month
                </div>
                <div className="text-xs text-[#4A9E88] mt-2">
                  {format(primusProtected.terminalIncome)}/yr for {primusProtected.sunsetDuration} years
                </div>
              </div>

              {/* Key Gains */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-[#4A9E88]" />
                  <span className="text-[#E6E8EB]">
                    30% of book becomes retained sunset income
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-[#4A9E88]" />
                  <span className="text-[#E6E8EB]">
                    Relationships transfer to designated successors
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delta Summary */}
        <div className="bg-gradient-to-r from-[#C6A45E]/10 to-[#4A9E88]/10 border-2 border-[#C6A45E] rounded-lg p-6 sm:p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-xs text-[#C6A45E] uppercase tracking-widest mb-2 font-bold">
              The Cost of Doing Nothing
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[#C6A45E] mb-2">
              {format(delta)}
            </div>
            <div className="text-sm text-[#B4BAC2]">
              Revenue lost over {timeHorizon} years without continuity infrastructure
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1A1F24] border border-[#353C45] rounded p-4 text-center">
              <div className="text-xs text-[#7A828C] uppercase mb-1">Monthly Sunset Income</div>
              <div className="text-xl font-mono font-bold text-[#4A9E88]">
                  {formatMonthly(primusProtected.terminalIncome)}
                </div>
                <div className="text-xs text-[#B4BAC2] mt-1">for {primusProtected.sunsetDuration} years after exit</div>
            </div>
            <div className="bg-[#1A1F24] border border-[#353C45] rounded p-4 text-center">
              <div className="text-xs text-[#7A828C] uppercase mb-1">Book Preservation</div>
              <div className="text-xl font-mono font-bold text-[#4A9E88]">
                  {(100 - primusProtected.decayPercentage).toFixed(0)}%
              </div>
              <div className="text-xs text-[#B4BAC2] mt-1">vs {(100 - unmanaged.decayPercentage).toFixed(0)}% unmanaged</div>
            </div>
            <div className="bg-[#1A1F24] border border-[#353C45] rounded p-4 text-center">
              <div className="text-xs text-[#7A828C] uppercase mb-1">Career Legacy Value</div>
              <div className="text-xl font-mono font-bold text-[#4A9E88]">
                  {format(primusProtected.terminalIncome * primusProtected.sunsetDuration)}
              </div>
              <div className="text-xs text-[#B4BAC2] mt-1">total sunset earnings</div>
            </div>
          </div>
        </div>

        {/* The Truth */}
        <div className="bg-[#222831] border border-[#353C45] rounded-lg p-6 sm:p-8">
          <h3 className="text-lg font-bold text-[#E6E8EB] mb-4">What This Means</h3>
          <div className="space-y-4 text-sm text-[#B4BAC2] leading-relaxed">
            <p>
              You've spent <span className="text-[#C6A45E] font-semibold">{(currentBookValue / (currentAnnualRevenue / 12 / 4000)).toFixed(0)} years</span> building {format(currentBookValue)} in managed relationships.
            </p>
            <p>
              <span className="text-[#B55A4A] font-semibold">Without continuity infrastructure:</span> That book decays at 20% annually. Your income ends when you stop working. Your relationships scatter. Your referral network dies.
            </p>
            <p>
              <span className="text-[#4A9E88] font-semibold">With Primus Protection:</span> Decay drops to 5%. Relationships transfer to designated successors. You retain {formatMonthly(primusProtected.terminalIncome)}/month for {primusProtected.sunsetDuration} years after exit. Your life's work survives your retirement.
            </p>
            <p className="text-[#E6E8EB] font-semibold border-l-4 border-[#C6A45E] pl-4 mt-6">
              The difference isn't software. It's {format(delta)} and the certainty that your career means something after you're done.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Outcomes;
