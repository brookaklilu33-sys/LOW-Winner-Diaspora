import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentOrchestrator } from '../services/paymentOrchestrator';
import { ArrowLeft, CreditCard, ShieldCheck, Zap, AlertCircle, CheckCircle2, Coins } from 'lucide-react';

export const DepositView: React.FC = () => {
  const { navigateTo, currentUser, refreshWallet } = useApp();

  const [amountUSD, setAmountUSD] = useState<number>(100);
  const [paymentCategory, setPaymentCategory] = useState<'CARD_PAYPAL' | 'CRYPTO'>('CARD_PAYPAL');
  const [cryptoToken, setCryptoToken] = useState<'USDC' | 'USDT'>('USDC');
  const [provider, setProvider] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const presets = [20, 50, 100, 250, 500];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (amountUSD <= 0) {
      setErrorMsg('Please enter a deposit amount greater than $0.00');
      return;
    }

    setIsProcessing(true);
    const amountCents = Math.round(amountUSD * 100);

    let res;
    if (paymentCategory === 'CARD_PAYPAL') {
      res = await PaymentOrchestrator.processCardOrPayPalDeposit({
        userId: currentUser.id,
        amountCents,
        provider,
        isDemo: false
      });
    } else {
      res = await PaymentOrchestrator.processCryptoDeposit({
        userId: currentUser.id,
        amountCents,
        token: cryptoToken,
        isDemo: false
      });
    }

    setIsProcessing(false);
    if (!res.success) {
      setErrorMsg(res.errorMessage || 'Deposit request failed.');
    } else {
      setSuccessMsg(
        `Success! Credited $${amountUSD.toFixed(2)} USD to your Lowwin Diaspora account balance.`
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

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF7900]">
              USD Payment Gateway
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#202124] dark:text-white mt-1">
            Fund Diaspora Account
          </h1>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0] mt-0.5">
            Verified payments credited directly to your authoritative integer-cent balance.
          </p>
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

        <form onSubmit={handleDeposit} className="space-y-6">
          {/* Amount Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#202124] dark:text-white block">
              Deposit Amount (USD)
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-2">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountUSD(val)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors tabular-nums ${
                    amountUSD === val
                      ? 'bg-[#FF7900] border-[#FF7900] text-white shadow-xs'
                      : 'bg-white dark:bg-[#202020] border-[#E8E3DE] dark:border-[#333] text-[#202124] dark:text-white hover:border-[#FF7900]'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-[#686868]">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={amountUSD}
                onChange={(e) => setAmountUSD(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-xl text-base font-bold tabular-nums text-[#202124] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
              />
            </div>

            <div className="bg-[#FFF8F3] dark:bg-[#241A12] border border-[#FFD8B8] dark:border-[#4B2E17] rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-[#686868] dark:text-[#A0A0A0]">You will receive:</span>
              <span className="font-extrabold text-[#FF7900] text-sm tabular-nums">
                {amountUSD} Unique Credits
              </span>
            </div>
          </div>

          {/* Payment Method Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#202124] dark:text-white block">
              Payment Method
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentCategory('CARD_PAYPAL')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  paymentCategory === 'CARD_PAYPAL'
                    ? 'border-[#FF7900] bg-[#FFF8F3] dark:bg-[#281B11]'
                    : 'border-[#E8E3DE] dark:border-[#333] bg-white dark:bg-[#202020]'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${paymentCategory === 'CARD_PAYPAL' ? 'text-[#FF7900]' : 'text-[#686868]'}`} />
                <span className="text-xs font-bold text-[#202124] dark:text-white">Card / PayPal</span>
                <span className="text-[10px] text-[#686868] dark:text-[#A0A0A0]">Instant US Checkout</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentCategory('CRYPTO')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                  paymentCategory === 'CRYPTO'
                    ? 'border-[#FF7900] bg-[#FFF8F3] dark:bg-[#281B11]'
                    : 'border-[#E8E3DE] dark:border-[#333] bg-white dark:bg-[#202020]'
                }`}
              >
                <Coins className={`w-5 h-5 ${paymentCategory === 'CRYPTO' ? 'text-[#FF7900]' : 'text-[#686868]'}`} />
                <span className="text-xs font-bold text-[#202124] dark:text-white">Pay with Crypto</span>
                <span className="text-[10px] text-[#686868] dark:text-[#A0A0A0]">USDC Stablecoin</span>
              </button>
            </div>
          </div>

          {/* Sub-options */}
          {paymentCategory === 'CARD_PAYPAL' ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProvider('STRIPE')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  provider === 'STRIPE'
                    ? 'border-[#FF7900] bg-[#FF7900]/10 text-[#FF7900]'
                    : 'border-[#E8E3DE] dark:border-[#333] text-[#686868]'
                }`}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setProvider('PAYPAL')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  provider === 'PAYPAL'
                    ? 'border-[#FF7900] bg-[#FF7900]/10 text-[#FF7900]'
                    : 'border-[#E8E3DE] dark:border-[#333] text-[#686868]'
                }`}
              >
                PayPal
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCryptoToken('USDC')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  cryptoToken === 'USDC'
                    ? 'border-[#FF7900] bg-[#FF7900]/10 text-[#FF7900]'
                    : 'border-[#E8E3DE] dark:border-[#333] text-[#686868]'
                }`}
              >
                USDC (Base / Polygon)
              </button>
              <button
                type="button"
                onClick={() => setCryptoToken('USDT')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  cryptoToken === 'USDT'
                    ? 'border-[#FF7900] bg-[#FF7900]/10 text-[#FF7900]'
                    : 'border-[#E8E3DE] dark:border-[#333] text-[#686868]'
                }`}
              >
                USDT
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full min-h-[44px] py-3 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isProcessing ? 'Processing Transaction...' : `Continue to Pay $${amountUSD.toFixed(2)} USD`}
          </button>
        </form>

        <div className="text-[11px] text-[#686868] dark:text-[#A0A0A0] space-y-1 pt-2 border-t border-[#E8E3DE] dark:border-[#2A2A2A]">
          <p>• All transactions are logged in the authoritative server-side ledger.</p>
          <p>• Never store raw card numbers on LOWwinner servers.</p>
        </div>
      </div>
    </div>
  );
};
