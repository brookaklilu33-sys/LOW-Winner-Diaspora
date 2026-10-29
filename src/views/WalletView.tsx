import React from 'react';
import { useApp } from '../context/AppContext';
import { WalletLedgerService } from '../services/walletLedgerService';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { wallet, currentUser, navigateTo, t } = useApp();

  const transactions = WalletLedgerService.getTransactionsForUser(currentUser.id);

  const balanceCents = wallet.balanceCents;
  const balanceUSD = (balanceCents / 100).toFixed(2);
  const reservedUSD = (wallet.reservedCents / 100).toFixed(2);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Wallet Header Card (Minimalist: Selector 2 badge and Selector 3 notice removed) */}
      <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7900]">
                {t('diaspora_account')}
              </span>
            </div>
            <div className="mt-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#202124] dark:text-white tabular-nums">
                ${balanceUSD} USD
              </div>
              <div className="text-sm font-semibold text-[#686868] dark:text-[#A0A0A0] tabular-nums mt-0.5">
                {t('exact_cents')}: {balanceCents} cents
              </div>
            </div>
            {wallet.reservedCents > 0 && (
              <div className="text-xs text-[#E85D04] font-medium mt-1">
                ${reservedUSD} {t('reserved_funds')}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('/deposit')}
              className="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{t('fund_wallet')}</span>
            </button>
            <button
              onClick={() => navigateTo('/withdraw')}
              className="flex-1 sm:flex-none min-h-[44px] px-5 py-2.5 bg-white dark:bg-[#222] border border-[#E8E3DE] dark:border-[#333] hover:border-[#FF7900] text-[#202124] dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{t('withdraw')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Authoritative Ledger Section (Minimalist: Selector 1 filter bar removed) */}
      <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#FF7900]" />
            <h3 className="text-base font-bold text-[#202124] dark:text-white">
              {t('ledger_history')}
            </h3>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#686868] dark:text-[#A0A0A0]">
            {t('no_transactions')}
          </div>
        ) : (
          <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
            {transactions.map((txn) => {
              const isCredit = txn.type === 'DEPOSIT' || txn.type === 'REFUND' || txn.type === 'PRIZE_CREDIT';
              return (
                <div key={txn.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#202124] dark:text-white">
                      {txn.description}
                    </div>
                    <div className="text-[11px] text-[#686868] dark:text-[#A0A0A0] flex items-center gap-2">
                      <span>{new Date(txn.timestamp).toLocaleString()}</span>
                      <span>·</span>
                      <span className="font-mono">{txn.id.slice(0, 14)}</span>
                      {txn.auditMetadata.isDemo && (
                        <>
                          <span>·</span>
                          <span className="text-[#FF7900] font-semibold">Demo</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        isCredit
                          ? 'text-[#2563EB] dark:text-[#60A5FA]'
                          : 'text-[#202124] dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : '-'}${ (txn.amountCents / 100).toFixed(2) }
                    </div>
                    <div className="text-[11px] text-[#686868] dark:text-[#A0A0A0] tabular-nums">
                      {isCredit ? '+' : '-'}{txn.uniqueCredits} Unique
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
