import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGE_OPTIONS } from '../services/i18n';
import {
  User,
  Wallet,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Sun,
  Moon,
  FileText,
  HelpCircle,
  LogOut,
  BadgeCheck,
  Phone,
  Mail,
  Edit3,
  LogIn
} from 'lucide-react';

import { OtpVerificationModal } from '../components/OtpVerificationModal';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    wallet,
    isDarkMode,
    toggleDarkMode,
    navigateTo,
    logoutAdmin,
    language,
    setLanguage,
    updateUserProfile,
    signInWithEmail,
    t
  } = useApp();

  const [activeSection, setActiveSection] = useState<'MAIN' | 'EDIT_INFO' | 'VERIFICATION'>('MAIN');

  // Form states for personal info
  const [emailValue, setEmailValue] = useState(currentUser.email || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || currentUser.phone || '+1 (571) 482-9012');
  const [backupEmail, setBackupEmail] = useState(currentUser.backupEmail || 'participant.backup@gmail.com');
  const [displayName, setDisplayName] = useState(currentUser.displayName || 'Diaspora Participant');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Form state for switching/creating account
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');

  // Diaspora verification states
  const [countryOfResidence, setCountryOfResidence] = useState(
    currentUser.eligibility?.countryOfResidence || 'United States'
  );
  const [diasporaCardNumber, setDiasporaCardNumber] = useState('ETH-ORIGIN-77821-AA');
  const [isAgeVerified, setIsAgeVerified] = useState(
    currentUser.eligibility?.isAgeVerified ?? true
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Germany',
    'United Arab Emirates',
    'Sweden',
    'Australia',
    'Netherlands',
    'Italy',
    'Saudi Arabia'
  ];

  const executeProfileSave = (emailToSave: string) => {
    updateUserProfile({
      email: emailToSave,
      displayName,
      phone: phoneNumber,
      phoneNumber,
      backupEmail
    });
    setSaveMessage('Personal information updated successfully.');
    setActiveSection('MAIN');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  // Save personal info (requires OTP if primary email changed)
  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNewEmail = emailValue.trim().toLowerCase();
    const currentEmailClean = (currentUser.email || '').toLowerCase().trim();

    if (cleanNewEmail && cleanNewEmail !== currentEmailClean) {
      setPendingEmail(cleanNewEmail);
      setShowOtpModal(true);
      return;
    }

    executeProfileSave(currentEmailClean);
  };

  // Handle email sign-in / auto account creation
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    const res = signInWithEmail(loginEmail, loginPhone);
    if (res.success) {
      setPhoneNumber(res.user.phoneNumber || res.user.phone || '');
      setBackupEmail(res.user.backupEmail || '');
      setDisplayName(res.user.displayName || '');
      setShowSignInModal(false);
      setSaveMessage(`Signed in as ${res.user.email}. Account active!`);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Save diaspora compliance
  const handleSaveCompliance = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      eligibility: {
        ...currentUser.eligibility,
        countryOfResidence,
        isAgeVerified,
        isDiasporaCertified: true,
        identityStatus: 'VERIFIED' as const
      }
    });
    setSaveMessage('Diaspora verification profile saved successfully.');
    setActiveSection('MAIN');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const balanceUSD = (wallet.balanceCents / 100).toFixed(0);

  return (
    <div className="space-y-5 pt-2 pb-12 max-w-2xl mx-auto">
      {/* Title matching Screenshot 1 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Profile
        </h1>
        <button
          onClick={() => setShowSignInModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-xs font-bold text-[#FF7900] hover:bg-orange-50 transition-all active:scale-95 shadow-xs"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In / Switch</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 1. Participant Identity Card (Glassmorphic) */}
      <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-5 sm:p-6 shadow-xs flex items-center gap-4">
        {/* Large Rounded Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7900] to-[#E85D04] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm shadow-[#FF7900]/25">
          {currentUser.displayName ? currentUser.displayName.slice(0, 1).toUpperCase() : 'P'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {currentUser.displayName || 'Participant'}
            </h2>
            <button
              onClick={() => setActiveSection(activeSection === 'EDIT_INFO' ? 'MAIN' : 'EDIT_INFO')}
              className="text-xs text-[#FF7900] font-bold flex items-center gap-1 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('edit_details')}</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
            {currentUser.email}
          </p>

          {/* Phone Number Display */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
            <Phone className="w-3 h-3 text-[#FF7900]" />
            <span>{currentUser.phoneNumber || currentUser.phone || 'No phone added'}</span>
            {currentUser.backupEmail && (
              <span className="text-[11px] text-slate-400 truncate">
                · Backup: {currentUser.backupEmail}
              </span>
            )}
          </div>

          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{t('verified_diaspora')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Grouped Destinations Card (Screenshot 1 Layout) */}
      <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs">
        {/* Row 1: Account / Personal Info */}
        <button
          onClick={() => setActiveSection(activeSection === 'EDIT_INFO' ? 'MAIN' : 'EDIT_INFO')}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-[#FF7900] transition-colors shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('profile')}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                {t('personal_info_sub')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
        </button>

        {/* Row 2: Wallet */}
        <button
          onClick={() => navigateTo('/wallet')}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-[#FF7900] transition-colors shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Wallet
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Balance: ${balanceUSD} USD
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ${balanceUSD}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
          </div>
        </button>

        {/* Row 3: History */}
        <button
          onClick={() => navigateTo('/history')}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-[#FF7900] transition-colors shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                History
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Auction bids & transactions
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Edit Personal Information (Email, Phone, Backup Email) */}
      {activeSection === 'EDIT_INFO' && (
        <div className="bg-white/80 dark:bg-[#151C28]/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-5 sm:p-6 space-y-4 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#FF7900]" />
              <span>Personal Information & Contacts</span>
            </h3>
            <button
              onClick={() => setActiveSection('MAIN')}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSavePersonalInfo} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-white block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-white block mb-1">
                Primary Account Email (Requires OTP Verification if changed)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Changing your primary email requires passing a 6-digit OTP code sent to the new address.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-white block mb-1">
                Primary Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-white block mb-1">
                Backup Recovery Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={backupEmail}
                  onChange={(e) => setBackupEmail(e.target.value)}
                  placeholder="recovery.email@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Used to recover credentials or receive title deed conveyance notifications.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Save Personal Information
            </button>
          </form>
        </div>
      )}

      {/* Expanded Diaspora Verification Sub-panel */}
      {activeSection === 'VERIFICATION' && (
        <div className="bg-white/80 dark:bg-[#151C28]/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-5 sm:p-6 space-y-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#FF7900]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Ethiopian Diaspora Certification & Eligibility
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Participation in Lowwin Diaspora residential competitions requires residency outside Ethiopia and certified diaspora/origin eligibility.
          </p>

          <form onSubmit={handleSaveCompliance} className="space-y-3.5 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-white block mb-1">
                Country of Permanent Residence
              </label>
              <select
                value={countryOfResidence}
                onChange={(e) => setCountryOfResidence(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-900 dark:text-white block mb-1">
                Yellow Card / Ethiopian Origin Identification ID
              </label>
              <input
                type="text"
                value={diasporaCardNumber}
                onChange={(e) => setDiasporaCardNumber(e.target.value)}
                placeholder="ETH-ORIGIN-XXXXX-AA"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="ageVerificationCheck"
                checked={isAgeVerified}
                onChange={(e) => setIsAgeVerified(e.target.checked)}
                className="w-4 h-4 text-[#FF7900] rounded focus:ring-[#FF7900]"
              />
              <label htmlFor="ageVerificationCheck" className="text-xs text-slate-700 dark:text-slate-300">
                I certify that I am at least 18 years of age and legally eligible to hold real property in Ethiopia.
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Save Verification Profile
            </button>
          </form>
        </div>
      )}

      {/* 3. Language & Display Theme Preferences */}
      <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Preferences & Language
        </h3>

        {/* Language selector chips */}
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
            Application Language
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLanguage(opt.code)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  language === opt.code
                    ? 'border-[#FF7900] bg-orange-50/60 dark:bg-orange-950/30 text-[#FF7900]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{opt.flag}</span>
                  <span>{opt.nativeName}</span>
                </span>
                {language === opt.code && <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7900]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme mode toggle row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
              Display Mode
            </span>
            <span className="text-[11px] text-slate-400">
              {isDarkMode ? 'Dark theme active' : 'Light theme active'}
            </span>
          </div>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:border-[#FF7900] transition-colors"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-[#FF7900]" /> : <Moon className="w-3.5 h-3.5 text-[#FF7900]" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* 4. Policies & Rules */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => navigateTo('/rules')}
          className="p-3 bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#FF7900] transition-colors flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4 text-[#FF7900] shrink-0" />
          <span>Rules & Mechanics</span>
        </button>
        <button
          onClick={() => navigateTo('/legal/TERMS')}
          className="p-3 bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#FF7900] transition-colors flex items-center gap-2"
        >
          <FileText className="w-4 h-4 text-[#FF7900] shrink-0" />
          <span>Terms & Privacy</span>
        </button>
      </div>

      {/* 5. Sign Out */}
      <button
        onClick={logoutAdmin}
        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200/80 dark:border-slate-700"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out Session</span>
      </button>

      {/* Sign In / Switch Account Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <LogIn className="w-5 h-5 text-[#FF7900]" />
                <span>Sign In with Email</span>
              </h3>
              <button
                onClick={() => setShowSignInModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Enter your email address to sign in. If your account is new, it will be automatically created and registered.
            </p>

            <form onSubmit={handleSignInSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Sign In / Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Email Change OTP Passcode Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        targetEmail={pendingEmail}
        onVerified={() => executeProfileSave(pendingEmail)}
        purpose="update your primary account email"
      />
    </div>
  );
};
