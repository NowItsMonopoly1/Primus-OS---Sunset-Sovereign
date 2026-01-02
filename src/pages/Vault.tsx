import React, { useState } from 'react';
import { Shield, Lock, FileText, Upload, FolderLock, Key, CheckCircle, AlertCircle, FileCheck } from 'lucide-react';

type DocumentCategory = 'succession' | 'compliance' | 'operations' | 'legal';

interface VaultDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadedAt: string;
  size: string;
  status: 'encrypted' | 'pending';
}

const MOCK_DOCUMENTS: VaultDocument[] = [
  {
    id: 'd1',
    name: 'Continuity Plan 2025.pdf',
    category: 'succession',
    uploadedAt: '2025-01-01',
    size: '2.4 MB',
    status: 'encrypted'
  },
  {
    id: 'd2',
    name: 'Successor Agreement - Hamilton Trust.pdf',
    category: 'legal',
    uploadedAt: '2024-12-28',
    size: '890 KB',
    status: 'encrypted'
  },
  {
    id: 'd3',
    name: 'Client Transfer Protocol.docx',
    category: 'operations',
    uploadedAt: '2024-12-15',
    size: '156 KB',
    status: 'encrypted'
  },
  {
    id: 'd4',
    name: 'Compliance Audit 2024.pdf',
    category: 'compliance',
    uploadedAt: '2024-12-10',
    size: '4.2 MB',
    status: 'encrypted'
  }
];

const CATEGORY_CONFIG = {
  succession: { label: 'Succession Planning', color: '#C6A45E', icon: FileCheck },
  compliance: { label: 'Compliance & Audit', color: '#4A9E88', icon: Shield },
  operations: { label: 'Operations Manual', color: '#7A828C', icon: FileText },
  legal: { label: 'Legal Agreements', color: '#B55A4A', icon: Lock }
};

const Vault = () => {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');

  const filteredDocs = activeCategory === 'all'
    ? MOCK_DOCUMENTS
    : MOCK_DOCUMENTS.filter(doc => doc.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#1A1F24] text-[#E6E8EB] p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#C6A45E]" />
            Secure Asset Vault
          </h1>
          <p className="text-[#B4BAC2] text-sm">
            End-to-end encrypted document storage for continuity planning
          </p>
        </div>

        {/* Security Badge */}
        <div className="mb-8 bg-[#222831] border border-[#353C45] p-6 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#4A9E88]/10 border border-[#4A9E88]/30 flex items-center justify-center">
                <Key className="w-6 h-6 text-[#4A9E88]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#E6E8EB]">AES-256 Encryption Active</div>
                <div className="text-xs text-[#7A828C]">Zero-knowledge architecture • SOC 2 Type II certified</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#4A9E88]" />
              <span className="text-xs text-[#4A9E88] font-semibold">SECURED</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`p-4 rounded border transition-all ${
              activeCategory === 'all'
                ? 'bg-[#C6A45E]/10 border-[#C6A45E] shadow-lg'
                : 'bg-[#222831] border-[#353C45] hover:border-[#7A828C]'
            }`}
          >
            <div className="text-left">
              <div className="text-xs uppercase tracking-wide text-[#7A828C] mb-1">All Files</div>
              <div className="text-2xl font-mono font-bold text-[#E6E8EB]">{MOCK_DOCUMENTS.length}</div>
            </div>
          </button>

          {(Object.keys(CATEGORY_CONFIG) as DocumentCategory[]).map((category) => {
            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;
            const count = MOCK_DOCUMENTS.filter(d => d.category === category).length;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`p-4 rounded border transition-all ${
                  activeCategory === category
                    ? 'bg-[#222831] border-[#C6A45E] shadow-lg'
                    : 'bg-[#222831] border-[#353C45] hover:border-[#7A828C]'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div className="text-xs text-[#7A828C] mb-1">{config.label}</div>
                  <div className="text-lg font-mono font-bold text-[#E6E8EB]">{count}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Upload Section */}
        <div className="mb-8 bg-[#222831] border-2 border-dashed border-[#353C45] p-8 rounded text-center hover:border-[#C6A45E]/50 transition-all cursor-pointer">
          <Upload className="w-12 h-12 text-[#7A828C] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#E6E8EB] mb-2">Upload Secure Document</h3>
          <p className="text-sm text-[#B4BAC2] mb-4">
            Drag and drop or click to upload succession planning documents
          </p>
          <button className="px-6 py-2 bg-[#C6A45E] text-[#1A1F24] rounded hover:bg-[#D4AF37] transition-colors text-sm font-medium">
            Select Files
          </button>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#E6E8EB]">
              {activeCategory === 'all' ? 'All Documents' : CATEGORY_CONFIG[activeCategory as DocumentCategory].label}
            </h2>
            <span className="text-sm text-[#7A828C]">{filteredDocs.length} files</span>
          </div>

          {filteredDocs.map((doc) => {
            const config = CATEGORY_CONFIG[doc.category];
            const Icon = config.icon;

            return (
              <div
                key={doc.id}
                className="p-4 sm:p-6 rounded border bg-[#222831] border-[#353C45] hover:border-[#C6A45E]/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.color}15`, border: `1px solid ${config.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-[#E6E8EB] mb-1">{doc.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A828C]">
                        <span>{config.label}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#4A9E88]/10 border border-[#4A9E88]/30">
                      <Lock className="w-3 h-3 text-[#4A9E88]" />
                      <span className="text-xs text-[#4A9E88] font-semibold">ENCRYPTED</span>
                    </div>
                    <button className="px-4 py-2 bg-[#353C45] text-[#E6E8EB] rounded hover:bg-[#2B323B] transition-colors text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDocs.length === 0 && (
          <div className="text-center py-16">
            <FolderLock className="mx-auto text-[#7A828C] mb-4" size={48} />
            <p className="text-[#B4BAC2]">No documents in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;