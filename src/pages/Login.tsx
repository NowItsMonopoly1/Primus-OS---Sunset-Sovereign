import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Invalid credentials');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F24] flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md">
        
        {/* Security Theatre Container */}
        <div className="bg-[#222831] border border-[#353C45] rounded-sm p-12">
          
          {/* Logo/Shield */}
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20 border-2 border-[#C6A45E]/40 flex items-center justify-center bg-[#C6A45E]/5 rounded-sm">
              <Shield className="w-10 h-10 text-[#C6A45E]" />
            </div>
          </div>

          {/* Brand Hierarchy */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black tracking-[0.25em] text-white leading-none uppercase mb-2 font-['Inter']">
              SOLOSCALE
            </h1>
            <p className="text-xs font-mono text-[#C6A45E]/60 tracking-[0.15em] uppercase">
              POWERED BY PRIMUS OS
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-3 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-mono text-[#B4BAC2] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#1A1F24] border border-[#353C45] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#C6A45E] transition-colors disabled:opacity-50"
                placeholder="founder@westapprovedlending.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono text-[#B4BAC2] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#1A1F24] border border-[#353C45] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#C6A45E] transition-colors disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C6A45E] hover:bg-[#D4B36A] text-[#1A1F24] font-semibold py-3 rounded-sm transition-colors uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Access System'}
            </button>
          </form>

          {/* Security Footer */}
          <div className="mt-8 pt-6 border-t border-[#353C45]">
            <div className="flex items-center justify-center space-x-2 text-xs text-[#7A828C]">
              <span className="font-mono uppercase tracking-wider">256-BIT ENCRYPTED SESSION</span>
            </div>
          </div>

        </div>

        {/* Compliance Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-[#7A828C] font-mono uppercase tracking-wider">
            SOC 2 TYPE II CERTIFIED • FINRA COMPLIANT
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
    </div>
  );
};
      `}</style>
    </div>
  );
};

export default Login;
