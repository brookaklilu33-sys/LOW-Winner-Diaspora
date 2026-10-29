import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ShieldAlert, X, ShieldCheck } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { isAdminAuthModalOpen, closeAdminAuthModal, loginAsAdmin } = useApp();
  const [googleEmail, setGoogleEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isAdminAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const res = loginAsAdmin(googleEmail);
      setIsAuthenticating(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Access denied.');
      }
    }, 400);
  };

  const handleSimulatedGoogleClick = (email: string) => {
    setGoogleEmail(email);
    setErrorMsg(null);
    setIsAuthenticating(true);
    setTimeout(() => {
      const res = loginAsAdmin(email);
      setIsAuthenticating(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Access denied.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={closeAdminAuthModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Administrator Google Sign-In
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lowwin Diaspora Governance & Operations Console
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Authorized Google Administrator Email
            </label>
            <input
              type="email"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              placeholder="admin@lowwin-diaspora.com"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full min-h-[44px] py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAuthenticating ? 'Verifying Credentials...' : 'Authenticate with Google'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
            Authorized Testing Accounts (Role-Based Authorization):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleSimulatedGoogleClick('brookaklilu33@gmail.com')}
              className="p-2.5 text-left rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 hover:border-[#FF7900] transition-colors col-span-1 sm:col-span-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Brook Aklilu (Authorized Superadmin)</span>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FF7900] text-white">Full Access</span>
              </div>
              <span className="text-[11px] text-[#FF7900] dark:text-[#FFA74D] font-mono block mt-0.5">brookaklilu33@gmail.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleSimulatedGoogleClick('admin@lowwin-diaspora.com')}
              className="p-2 text-left rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-600 transition-colors"
            >
              <span className="font-bold block text-slate-800 dark:text-slate-200 truncate">System Superadmin</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">admin@lowwin-diaspora.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleSimulatedGoogleClick('property.reviewer@lowwin-diaspora.com')}
              className="p-2 text-left rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-600 transition-colors"
            >
              <span className="font-bold block text-slate-800 dark:text-slate-200 truncate">Property Reviewer</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400">Title & Deed Review</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-normal">
          Non-administrative Google accounts will be rejected by the server authorization layer. Access attempts are audited.
        </p>
      </div>
    </div>
  );
};
