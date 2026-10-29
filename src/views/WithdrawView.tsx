import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WalletLedgerService } from '../services/walletLedgerService';
import { WithdrawalDestination } from '../types/wallet';
import { ArrowLeft, Building2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const WithdrawView: React.FC = () => {
  const { navigateTo, currentUser, wallet, refreshWallet } = useApp();

  const balanceCents = wallet.balanceCents;
  const availableCents = balanceCents - wallet.reservedCents;
  const availableUSD = (availableCents / 100).toFixed(2);

  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState<number>(50);
  const [destType, setDestType] = useState<WithdrawalDestination['type']>('ACH_BANK');
  const [accountHolderName, setAccountHolderName] = useState<string>(currentUser.displayName);
  const [routingOrEmail, setRoutingOrEmail] = useState<string>('021000021'); // US routing placeholder
  const [accountNumber, setAccountNumber] = useState<string>('9876543210');
  const [bankName, setBankName] = useState<string>('JPMorgan Chase');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const pendingWithdrawals = WalletLedgerService.getWithdrawalsForUser(currentUser.id);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const amountCents = Math.round(withdrawAmountUSD * 100);

    if (amountCents <= 0) {
      setErrorMsg('Withdrawal amount must be greater than $0.00');
      return;
    }

    if (amountCents > availableCents) {
      setErrorMsg(`Amount exceeds available funds ($${availableUSD})`);
      return;
    }

    setIsSubmitting(true);

    const res = WalletLedgerService.requestWithdrawal({
      userId: currentUser.id,
      amountCents,
      destination: {
        type: destType,
        accountHolderName,
        routingOrEmailOrAddress: routingOrEmail,
        accountNumberMasked: accountNumber ? `***${accountNumber.slice(-4)}` : undefined,
        bankName
      },
      isDemo: false
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to request withdrawal');
    } else {
      setSuccessMsg(
        `Withdrawal of $${withdrawAmountUSD.toFixed(2)} USD submitted. Funds reserved and queued for compliance review.`
      );
      refreshWallet();
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-xl mx-auto">
      {/* Top back navigation */}
      <button
        onClick={() => navigateTo('/wallet')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#686868] dark:text-[#A0A0A0] hover:text-[#202124] dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Wallet</span>
      </button>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF7900]">
            Prizes & Settlements
          </span>
          <h1 className="text-2xl font-extrabold text-[#202124] dark:text-white mt-1">
            Request Withdrawal
          </h1>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0] mt-0.5">
            Subject to provider approval, KYC verification, and legal jurisdiction eligibility.
          </p>
        </div>

        {/* Balance Snapshot */}
        <div className="bg-[#FFF8F3] dark:bg-[#221A12] border border-[#FFD8B8] dark:border-[#4B2F17] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#686868] dark:text-[#A0A0A0] block">Available to Withdraw</span>
            <span className="text-xl font-bold text-[#FF7900] tabular-nums">
              ${availableUSD} USD
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#686868] dark:text-[#A0A0A0] block">Equivalent USD</span>
            <span className="text-xl font-bold text-[#202124] dark:text-white tabular-nums">
              ${availableUSD}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-5">
          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#202124] dark:text-white block">
              Withdrawal Amount ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-[#686868]">$</span>
              <input
                type="number"
                min="10"
                max={Math.floor(availableCents / 100)}
                value={withdrawAmountUSD}
                onChange={(e) => setWithdrawAmountUSD(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-xl text-base font-bold tabular-nums text-[#202124] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
              />
            </div>
            <span className="text-[11px] text-[#686868] dark:text-[#A0A0A0]">
              Minimum withdrawal: $10.00 USD (10 Unique)
            </span>
          </div>

          {/* Payout Destination Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#202124] dark:text-white block">
              Payout Route
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'ACH_BANK', label: 'US Bank ACH' },
                { type: 'PAYPAL', label: 'PayPal' },
                { type: 'USDC_POLYGON', label: 'USDC Payout' }
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setDestType(opt.type as any)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    destType === opt.type
                      ? 'border-[#FF7900] bg-[#FFF8F3] dark:bg-[#281A10] text-[#FF7900]'
                      : 'border-[#E8E3DE] dark:border-[#333] text-[#686868] hover:border-[#FF7900]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Form Fields */}
          <div className="space-y-3 bg-[#F8FAFC] dark:bg-[#202020] p-4 rounded-xl border border-slate-200 dark:border-[#333]">
            <div>
              <label className="text-xs font-medium text-[#686868] dark:text-[#A0A0A0] block mb-1">
                Account Holder Full Name
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg text-xs"
              />
            </div>

            {destType === 'ACH_BANK' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-[#686868] dark:text-[#A0A0A0] block mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#686868] dark:text-[#A0A0A0] block mb-1">
                      9-Digit Routing Number
                    </label>
                    <input
                      type="text"
                      value={routingOrEmail}
                      onChange={(e) => setRoutingOrEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#686868] dark:text-[#A0A0A0] block mb-1">
                    Account Number
                  </label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg text-xs"
                  />
                </div>
              </>
            )}

            {destType === 'PAYPAL' && (
              <div>
                <label className="text-xs font-medium text-[#686868] dark:text-[#A0A0A0] block mb-1">
                  PayPal Registered Email
                </label>
                <input
                  type="email"
                  value={routingOrEmail}
                  onChange={(e) => setRoutingOrEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg text-xs"
                />
              </div>
            )}

            {destType.startsWith('USDC') && (
              <div>
                <label className="text-xs font-medium text-[#686868] dark:text-[#A0A0A0] block mb-1">
                  Recipient EVM Wallet Address (0x...)
                </label>
                <input
                  type="text"
                  value={routingOrEmail}
                  onChange={(e) => setRoutingOrEmail(e.target.value)}
                  required
                  placeholder="0x71C...39"
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg text-xs font-mono"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || availableCents <= 0}
            className="w-full min-h-[44px] py-3 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Request...' : `Confirm Withdrawal ($${withdrawAmountUSD.toFixed(2)} USD)`}
          </button>
        </form>
      </div>

      {/* Pending / Active Withdrawals Tracker */}
      {pendingWithdrawals.length > 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF7900]" />
            Your Withdrawal Requests ({pendingWithdrawals.length})
          </h3>

          <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
            {pendingWithdrawals.map((w) => (
              <div key={w.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-[#202124] dark:text-white">
                    ${(w.amountCents / 100).toFixed(2)} USD to {w.destination.type}
                  </div>
                  <div className="text-[11px] text-[#686868] dark:text-[#A0A0A0]">
                    {new Date(w.createdAt).toLocaleDateString('en-US')} · Ref: {w.id.slice(0, 10)}
                  </div>
                </div>
                <span className="font-semibold text-[11px] px-2.5 py-1 rounded bg-[#FFF3E8] dark:bg-[#2C1D12] text-[#FF7900]">
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
