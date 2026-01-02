import React from 'react';
import { Shield, Lock, FileText } from 'lucide-react';

const Vault = () => {
  return (
    <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] pb-20">
      {/* HEADER */}
      <div className="px-8 py-6 border-b border-[#353C45] bg-[#222831] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C6A45E]" />
            SECURE ASSET VAULT
          </h1>
          <p className="text-sm text-[#B4BAC2] mt-1">Protected Document Repository</p>
        </div>
        <div className="text-[10px] font-mono border border-[#4A9E88] text-[#4A9E88] px-2 py-1 rounded bg-[#4A9E88]/10">
          ENCRYPTED STORAGE
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-16">
          <Lock className="w-16 h-16 text-[#C6A45E] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Secure Asset Vault</h2>
          <p className="text-[#B4BAC2] mb-6">Protected document storage and succession planning materials</p>
          <div className="bg-[#222831] border border-[#353C45] p-6 rounded-sm max-w-md mx-auto">
            <p className="text-sm text-[#7A828C]">Vault initialization pending Phase 3 deployment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;