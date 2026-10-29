import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Wallet, User, ChevronDown, Check } from 'lucide-react';
import { LANGUAGE_OPTIONS, SupportedLanguage } from '../services/i18n';
import logoImg from '../assets/images/lowwinner_diaspora_logo.png';

export const Navbar: React.FC = () => {
  const {
    navigateTo,
    isDarkMode,
    toggleDarkMode,
    wallet,
    handleLogoClick,
    language,
    setLanguage,
    t
  } = useApp();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const balanceUSD = (wallet.balanceCents / 100).toFixed(0);
  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 bg-white/75 dark:bg-[#0F172A]/75 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 transition-colors pt-[env(safe-area-inset-top,0px)] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left Side: Official LOWwinner diaspora logo with 5-tap Admin gesture */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-left group focus:outline-none rounded-xl transition-transform active:scale-[0.97]"
            title="LOWwinner Diaspora — Ethiopian Residential Property Competitions (Tap 5 times for Admin)"
            aria-label="LOWwinner Diaspora Home"
          >
            <img
              src={logoImg}
              alt="LOWwinner diaspora"
              className="h-9 sm:h-10 w-auto object-contain filter dark:brightness-105 select-none transition-opacity"
              loading="eager"
              decoding="async"
            />
          </button>

          {/* Subtle vertical divider */}
          <div className="hidden md:block h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Tagline */}
          <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('tagline')}
          </span>
        </div>

        {/* Right Side Controls: Language, Theme Toggle, Wallet, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1. Language Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-white/70 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#FF7900]/50 transition-all active:scale-95 shadow-xs"
              aria-label="Select language"
              aria-expanded={langMenuOpen}
            >
              <span>{currentLang.nativeName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/70 dark:border-white/10 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      language === opt.code
                        ? 'text-[#FF7900] font-bold bg-orange-50/60 dark:bg-orange-950/30'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{opt.flag}</span>
                      <span>{opt.nativeName}</span>
                    </span>
                    {language === opt.code && <Check className="w-3.5 h-3.5 text-[#FF7900]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Light / Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full border border-white/70 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-[#FF7900]/50 transition-all active:scale-90 shadow-xs"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle display theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* 3. Wallet Balance Pill (Exact reference structure with glassmorphism) */}
          <button
            onClick={() => navigateTo('/wallet')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200/80 dark:border-orange-900/50 bg-orange-50/80 dark:bg-orange-950/40 backdrop-blur-md text-[#FF7900] dark:text-[#FFA74D] hover:bg-orange-100/90 dark:hover:bg-orange-950/60 transition-all active:scale-95 text-xs font-bold shadow-xs"
            title="Diaspora Account Balance"
            aria-label="View Diaspora Wallet Balance"
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="tabular-nums">${balanceUSD}</span>
            <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80 font-semibold uppercase">USD</span>
          </button>

          {/* 4. Profile / Account Icon */}
          <button
            onClick={() => navigateTo('/profile')}
            className="w-9 h-9 rounded-full border border-white/70 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-[#FF7900]/50 transition-all active:scale-90 shadow-xs"
            title="Account Profile & Settings"
            aria-label="View Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
