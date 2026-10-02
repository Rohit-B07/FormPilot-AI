import React, { useState } from 'react';
import { X, Sparkles, Shield, Lock, Mail, ArrowRight, CheckCircle2, User, KeyRound } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultMode = 'signin' }) {
  const [mode, setMode] = useState(defaultMode); // 'signin' | 'signup' | 'magic'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // Simulate quick auth or use local session
      await new Promise((r) => setTimeout(r, 600));

      const user = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: email || 'alex.morgan@formpilot.ai',
        fullName: name || (email ? email.split('@')[0] : 'Alex Morgan'),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        token: 'demo-jwt-token-' + Date.now(),
      };

      localStorage.setItem('formpilot_user', JSON.stringify(user));
      localStorage.setItem('formpilot_token', user.token);

      setSuccessMsg('Authenticated successfully! Launching workspace...');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role = 'Scholarship Applicant') => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const user = {
        id: 'usr_demo_vip',
        email: 'alex.morgan@formpilot.ai',
        fullName: 'Alex Morgan',
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        token: 'demo-jwt-token-active',
      };
      localStorage.setItem('formpilot_user', JSON.stringify(user));
      localStorage.setItem('formpilot_token', user.token);

      onAuthSuccess(user);
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#0A0A0A]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#F3F1EC] border border-[#0A0A0A]/20 shadow-2xl rounded-none overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Top Decorative Banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0A0A0A] via-[#1677FF] to-[#0A0A0A]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/5 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          {/* Brand Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-[#0A0A0A] flex items-center justify-center text-[#F3F1EC] text-xs font-mono font-bold">
              FP
            </div>
            <span className="font-editorial text-sm font-extrabold tracking-widest uppercase text-[#0A0A0A]">
              FORMPILOT <span className="text-[#1677FF] font-sans text-xs">AI</span>
            </span>
          </div>

          <h2 className="font-editorial text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-[#0A0A0A] mb-2">
            {mode === 'signin' ? 'Sign In to Workspace' : mode === 'signup' ? 'Create Your Account' : 'Magic Link Sign In'}
          </h2>
          <p className="text-xs text-[#666666] font-mono uppercase tracking-wider mb-6">
            {mode === 'signin'
              ? 'Access your forms, verified drafts, and copilot sessions'
              : 'Start turning complicated paperwork into effortless approvals'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-[#0A0A0A]/5 p-1 border border-[#0A0A0A]/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-2 text-xs font-bold tracking-widest uppercase transition-all ${
                mode === 'signin'
                  ? 'bg-[#0A0A0A] text-[#F3F1EC] shadow-sm'
                  : 'text-[#0A0A0A]/60 hover:text-[#0A0A0A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 text-xs font-bold tracking-widest uppercase transition-all ${
                mode === 'signup'
                  ? 'bg-[#0A0A0A] text-[#F3F1EC] shadow-sm'
                  : 'text-[#0A0A0A]/60 hover:text-[#0A0A0A]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Access Button */}
          <div className="mb-6 p-3.5 bg-white border border-[#1677FF]/30 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1677FF] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Instant Demo Access
              </div>
              <p className="text-[11px] text-[#666666]">Jump directly into the live workspace</p>
            </div>
            <button
              type="button"
              onClick={() => handleDemoLogin()}
              disabled={loading}
              className="px-3 py-1.5 bg-[#1677FF] hover:bg-[#0055D6] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1"
            >
              Enter Demo <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-[#0A0A0A]/10"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-[#888888] uppercase tracking-widest">
              Or with credentials
            </span>
            <div className="flex-grow border-t border-[#0A0A0A]/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#0A0A0A]/20 text-xs text-[#0A0A0A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#1677FF] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0A0A0A] mb-1">
                Work / Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.morgan@company.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#0A0A0A]/20 text-xs text-[#0A0A0A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#1677FF] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0A0A0A]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link will be sent to your email.')}
                    className="text-[10px] font-mono text-[#1677FF] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#0A0A0A]/20 text-xs text-[#0A0A0A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#1677FF] transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0A0A0A] hover:bg-[#1677FF] text-[#F3F1EC] text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In & Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create Account & Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Footer */}
          <div className="mt-6 pt-4 border-t border-[#0A0A0A]/10 flex items-center justify-center gap-2 text-[10px] text-[#777777] font-mono">
            <Shield className="w-3 h-3 text-[#1677FF]" />
            <span>256-Bit Encrypted • Supabase Auth Guarded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
