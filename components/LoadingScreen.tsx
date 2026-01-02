import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020202]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
        <p className="text-gold text-lg">Loading PRIMUS OS...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;