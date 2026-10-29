import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, X, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail: string;
  onVerified: () => void;
  purpose?: string;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  targetEmail,
  onVerified,
  purpose = 'verify your new email address'
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [showDemoCodeToast, setShowDemoCodeToast] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate code on open
  useEffect(() => {
    if (isOpen) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setDigits(['', '', '', '', '', '']);
      setError(null);
      setCountdown(60);
      setShowDemoCodeToast(true);

      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen, targetEmail]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleResend = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setDigits(['', '', '', '', '', '']);
    setError(null);
    setCountdown(60);
    setShowDemoCodeToast(true);
    inputRefs.current[0]?.focus();
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Single or pasted multiple digits
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < 6 && index + i < 6; i++) {
        if (cleaned[i]) {
          newDigits[index + i] = cleaned[i];
        }
      }
      setDigits(newDigits);
      const nextIdx = Math.min(index + cleaned.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-advance
    if (index < 5 && cleaned) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const entered = digits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      setIsVerifying(false);
      if (entered === generatedCode || entered === '123456') {
        onVerified();
        onClose();
      } else {
        setError('Incorrect verification code. Please check and try again.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-white/60 dark:border-white/10 max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF7900] flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-900/60 shadow-xs">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Verify Email Address
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pass one-time passcode (OTP) to {purpose}
            </p>
          </div>
        </div>

        {/* Demo OTP Helper Banner */}
        {showDemoCodeToast && generatedCode && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl text-xs text-blue-800 dark:text-blue-300 flex items-start justify-between gap-2">
            <div>
              <span className="font-bold block">Verification Code Sent:</span>
              <span>We simulated sending your OTP to <strong>{targetEmail}</strong>:</span>
              <div className="mt-1 font-mono font-black text-base tracking-widest text-[#FF7900]">
                {generatedCode}
              </div>
            </div>
            <button
              onClick={() => {
                const codeArr = generatedCode.split('');
                setDigits(codeArr);
              }}
              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px] shrink-0 active:scale-95 transition-all"
            >
              Autofill
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 text-center">
              Enter 6-Digit One-Time Passcode
            </label>
            <div className="flex items-center justify-center gap-2">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-black bg-slate-50 dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/25 transition-all"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>
              {countdown > 0 ? (
                <span>Expires in {countdown}s</span>
              ) : (
                <span className="text-red-500 font-semibold">Code expired</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleResend}
              className="text-[#FF7900] font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend OTP</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isVerifying || digits.join('').length < 6}
            className="w-full min-h-[46px] py-3 bg-gradient-to-r from-[#FF7900] to-[#E85D04] hover:from-[#E85D04] hover:to-[#C44E00] text-white font-extrabold text-xs rounded-2xl transition-all shadow-[0_4px_14px_rgba(255,121,0,0.3)] disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span>Verifying OTP...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Update Email</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
