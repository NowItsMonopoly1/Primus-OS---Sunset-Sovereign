import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, FileSpreadsheet, Server, Shield, ChevronRight, Activity, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

type OnboardingStep = 'select' | 'processing' | 'success';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('select');
  const [selected, setSelected] = useState<string>('crm');
  const [processingStage, setProcessingStage] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  const options = [
    {
      id: 'crm',
      label: 'CRM Platform (Salesforce, Surefire, Shape)',
      sub: 'Seamless ledger continuity from CRM standards.',
      icon: Database,
      color: '#C6A45E'
    },
    {
      id: 'los',
      label: 'Loan Origination System (Encompass, Floify, Arive)',
      sub: 'Connect continuity signals to your existing LOS.',
      icon: Server,
      color: '#4A9E88'
    },
    {
      id: 'sheets',
      label: 'Internal Spreadsheets (Excel, Google Sheets)',
      sub: 'Standardize your current ledger into firm-wide structure.',
      icon: FileSpreadsheet,
      color: '#7A828C'
    },
    {
      id: 'admin',
      label: 'Administrator Setup Required',
      sub: 'Route this step to Operations or IT.',
      icon: Shield,
      color: '#B55A4A'
    },
  ];

  const processingStages = [
    { label: 'Establishing Secure Connection', duration: 1200 },
    { label: 'Authenticating Ledger Source', duration: 1000 },
    { label: 'Mapping Data Fields', duration: 1500 },
    { label: 'Synchronizing Records', duration: 1800 },
    { label: 'Validating Continuity Metrics', duration: 1000 },
  ];

  // Handle processing sequence
  useEffect(() => {
    if (step === 'processing') {
      let currentStage = 0;

      const advanceStage = () => {
        if (currentStage < processingStages.length - 1) {
          currentStage++;
          setProcessingStage(currentStage);
          setTimeout(advanceStage, processingStages[currentStage].duration);
        } else {
          // All stages complete - move to success screen
          setTimeout(() => setStep('success'), 800);
        }
      };

      // Start the sequence
      setTimeout(advanceStage, processingStages[0].duration);
    }
  }, [step]);

  // Animate success screen count-up
  useEffect(() => {
    if (step === 'success') {
      let count = 0;
      const interval = setInterval(() => {
        count += Math.floor(Math.random() * 3) + 1;
        if (count >= 47) {
          count = 47; // Final count for demo
          clearInterval(interval);
        }
        setSuccessCount(count);
      }, 50);

      return () => clearInterval(interval);
    }
  }, [step]);

  const handleContinue = () => {
    console.log('🎯 Continue button clicked! Step:', step, 'Selected:', selected);
    setStep('processing');
    setProcessingStage(0);
  };

  const handleGoToDashboard = () => {
    console.log('🚀 Navigating to dashboard');
    navigate('/dashboard');
  };

  // STEP 1: Selection Screen
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-xl sm:text-2xl font-semibold mb-2 tracking-wide text-white">
              Confirm Current Ledger Source
            </h1>
            <p className="text-[#B4BAC2] text-sm">
              We'll align your existing ledger to firm continuity standards.
            </p>
          </div>

          {/* Selection Cards */}
          <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selected === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    console.log('📝 Selected option:', opt.id);
                    setSelected(opt.id);
                  }}
                  className={`p-4 sm:p-5 rounded border cursor-pointer transition-all flex items-start space-x-4 group ${
                    isSelected
                      ? 'bg-[#222831] border-[#C6A45E] shadow-[0_0_15px_rgba(198,164,94,0.1)]'
                      : 'bg-[#1A1F24] border-[#353C45] hover:border-[#7A828C]'
                  }`}
                >
                  {/* Radio Button */}
                  <div
                    className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected ? 'border-[#C6A45E]' : 'border-[#7A828C] group-hover:border-[#B4BAC2]'
                    }`}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#C6A45E]" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-sm sm:text-base mb-1 ${
                        isSelected ? 'text-[#C6A45E]' : 'text-[#E6E8EB]'
                      }`}
                    >
                      {opt.label}
                    </h3>
                    <p className="text-xs text-[#7A828C]">{opt.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#353C45] pt-6 sm:pt-8">
            <button
              type="button"
              className="text-xs text-[#7A828C] hover:text-[#E6E8EB] transition-colors"
            >
              Need assistance with integration?
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="bg-[#C6A45E] text-[#1A1F24] px-6 sm:px-8 py-3 rounded hover:bg-[#D4AF37] transition-all font-bold text-xs uppercase tracking-widest flex items-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Processing Screen (Security Theatre)
  if (step === 'processing') {
    const progress = ((processingStage + 1) / processingStages.length) * 100;

    return (
      <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C6A45E]/10 flex items-center justify-center border border-[#C6A45E]/30">
            <Loader2 className="w-8 h-8 text-[#C6A45E] animate-spin" />
          </div>

          {/* Current Stage */}
          <h2 className="text-lg sm:text-xl font-semibold text-center mb-2 text-white">
            {processingStages[processingStage].label}
          </h2>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#353C45] rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-[#C6A45E] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stage List */}
          <div className="space-y-3 mb-8">
            {processingStages.map((stage, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 text-sm transition-all ${
                  index < processingStage
                    ? 'text-[#4A9E88]'
                    : index === processingStage
                    ? 'text-[#C6A45E]'
                    : 'text-[#7A828C]'
                }`}
              >
                {index < processingStage ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : index === processingStage ? (
                  <Activity className="w-4 h-4 flex-shrink-0 animate-pulse" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#353C45] flex-shrink-0" />
                )}
                <span className={index === processingStage ? 'font-medium' : ''}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>

          {/* Security Badge */}
          <div className="text-center text-[10px] uppercase tracking-widest text-[#7A828C]">
            256-BIT ENCRYPTED SESSION • SOC 2 TYPE II CERTIFIED
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Success Screen
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#4A9E88]/10 flex items-center justify-center border border-[#4A9E88]/30">
            <CheckCircle className="w-10 h-10 text-[#4A9E88]" />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Ledger Synchronized
          </h2>
          <p className="text-[#B4BAC2] text-sm mb-10">
            Your continuity ledger has been successfully initialized and is ready for governance.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-[#222831] border border-[#353C45] rounded p-4">
              <div className="text-3xl font-mono font-bold text-[#C6A45E] mb-1">
                {successCount}
              </div>
              <div className="text-xs text-[#7A828C] uppercase tracking-wide">
                Records Imported
              </div>
            </div>
            <div className="bg-[#222831] border border-[#353C45] rounded p-4">
              <div className="text-3xl font-mono font-bold text-[#4A9E88] mb-1">
                100%
              </div>
              <div className="text-xs text-[#7A828C] uppercase tracking-wide">
                Data Validated
              </div>
            </div>
            <div className="bg-[#222831] border border-[#353C45] rounded p-4">
              <div className="text-3xl font-mono font-bold text-[#7A828C] mb-1">
                4
              </div>
              <div className="text-xs text-[#7A828C] uppercase tracking-wide">
                Risk Flags Detected
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleGoToDashboard}
            className="bg-[#C6A45E] text-[#1A1F24] px-10 py-4 rounded hover:bg-[#D4AF37] transition-all font-bold text-sm uppercase tracking-wider flex items-center space-x-3 mx-auto"
          >
            <span>View Continuity Ledger</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Footer Note */}
          <p className="text-xs text-[#7A828C] mt-6">
            Real-time monitoring active • Governor notifications enabled
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default Onboarding;
