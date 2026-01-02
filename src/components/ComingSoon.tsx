import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-screen bg-primus-bg text-primus-text flex items-center justify-center p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-primus-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-primus-gold" />
        </div>
        <h1 className="text-2xl font-bold text-primus-text mb-4">Coming Soon</h1>
        <p className="text-primus-slate mb-6">
          This feature is currently under development and will be available in an upcoming release.
        </p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primus-gold text-black rounded-lg hover:bg-primus-gold/90 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;