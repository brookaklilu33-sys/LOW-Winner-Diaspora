import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuctionManagerService } from '../services/auctionManagerService';
import { Trophy, Tag, ShieldCheck, ChevronRight } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { currentUser, auctions, navigateTo, t } = useApp();
  const [tab, setTab] = useState<'ENTRIES' | 'WINNERS'>('ENTRIES');
  const [selectedTraceAuctionId, setSelectedTraceAuctionId] = useState<string | null>(null);

  const userEntries = AuctionManagerService.getUserEntries(currentUser.id);
  const endedAuctions = auctions.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'WINNER_PENDING_REVIEW'
  );

  const selectedAuction = auctions.find((a) => a.id === selectedTraceAuctionId);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202124] dark:text-white">
            {t('activity_and_history')}
          </h1>
          <p className="text-xs sm:text-sm text-[#686868] dark:text-[#A0A0A0] mt-0.5">
            {t('history_sub')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl self-start sm:self-auto border border-slate-200/80 dark:border-white/10">
          <button
            onClick={() => setTab('ENTRIES')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === 'ENTRIES'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('my_entries_tab')} ({userEntries.length})
          </button>
          <button
            onClick={() => setTab('WINNERS')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === 'WINNERS'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('past_winners_tab')} ({endedAuctions.length})
          </button>
        </div>
      </div>

      {tab === 'ENTRIES' ? (
        <div className="space-y-4">
          {userEntries.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-12 text-center text-[#686868] dark:text-[#A0A0A0]">
              <p className="text-sm font-semibold">{t('no_entries_yet')}</p>
              <button
                onClick={() => navigateTo('/properties')}
                className="mt-3 px-4 py-2 bg-[#FF7900] text-white font-semibold text-xs rounded-xl active:scale-95 transition-all"
              >
                {t('browse_competitions')}
              </button>
            </div>
          ) : (
            userEntries.map((ent) => {
              const targetId = ent.competitionId || ent.auctionId || '';
              const auc = AuctionManagerService.getAuctionById(targetId);
              const bids = AuctionManagerService.getUserBidsForAuction(targetId, currentUser.id);

              return (
                <div
                  key={ent.id}
                  className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-5 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-[#202124] dark:text-white">
                        {auc?.title || 'Competition'}
                      </h3>
                      <div className="text-xs text-[#686868] dark:text-[#A0A0A0]">
                        Entry #{ent.id.slice(-6)} · $49 USD (Fixed Unique Ticket)
                      </div>
                    </div>
                    {auc && (
                      <button
                        onClick={() => navigateTo(`/property/${auc.slug || auc.id}`)}
                        className="text-xs font-semibold text-[#FF7900] hover:underline self-start sm:self-auto"
                      >
                        View Property Page →
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#686868] dark:text-[#A0A0A0] block mb-1.5">
                      Submitted Numbers ({bids.length} of {ent.bidsAllowed}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {bids.map((b) => (
                        <span
                          key={b.id}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-[#252525] rounded-md font-mono text-xs font-bold text-[#202124] dark:text-white"
                        >
                          #{b.number}
                        </span>
                      ))}
                      {bids.length === 0 && (
                        <span className="text-xs text-[#686868] italic">No numbers submitted yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {endedAuctions.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-12 text-center text-[#686868] dark:text-[#A0A0A0]">
              <p className="text-sm font-semibold">No closed auctions yet.</p>
              <p className="text-xs mt-1">Simulate closing a live auction from its detail page to view calculated winners here.</p>
            </div>
          ) : (
            endedAuctions.map((auc) => (
              <div
                key={auc.id}
                className="bg-white/80 dark:bg-[#151C28]/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-5 space-y-4 shadow-xs overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Property Photo */}
                  <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                    <img
                      src={auc.property?.images?.[0] || auc.property?.image || '/images/addis_bole_luxury_apartment_1792574992395.jpg'}
                      alt={auc.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-500/85 backdrop-blur-md text-white text-[8.5px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border border-white/25 shadow-xs">
                      DEED CONVEYED
                    </div>
                  </div>

                  {/* Header info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#FF7900] shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7900]">
                        Verified Diaspora Winner
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      {auc.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {auc.property?.subCityArea || 'Addis Ababa'} · Registered Deed: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{auc.property?.titleDeedRegistration}</span>
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Valuation: ${(auc.property?.valuationUSD || 200000).toLocaleString()} USD
                      </span>
                      <span>·</span>
                      <span className="text-slate-400">Fixed Entry: $49 USD</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Winning Lowest Unique Number</span>
                    <span className="text-2xl font-black text-[#FF7900] tabular-nums flex items-center gap-1.5 mt-0.5">
                      <span>#{auc.winningNumber ?? 'None'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#FF7900] font-bold">UNIQUE</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Winning Diaspora Participant</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate block text-sm mt-1">
                      {auc.winnerName || 'Winner Verification Pending'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Audited Conveyance Hash</span>
                    <span className="font-mono text-[#2563EB] dark:text-[#60A5FA] truncate block text-[11px] mt-1">
                      {auc.calculationTrace?.hash || 'SHA256-DEED-ET-88912-7F3A9C82B14D90E5'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => navigateTo(`/property/${auc.slug || auc.id}`)}
                    className="text-xs font-bold text-[#FF7900] hover:underline"
                  >
                    View Property Details →
                  </button>

                  <button
                    onClick={() =>
                      setSelectedTraceAuctionId(selectedTraceAuctionId === auc.id ? null : auc.id)
                    }
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors self-start sm:self-auto"
                  >
                    {selectedTraceAuctionId === auc.id ? 'Hide Audit Trace' : 'Inspect Calculation Trace'}
                  </button>
                </div>

                {/* Expanded Audit Trace Breakdown */}
                {selectedTraceAuctionId === auc.id && auc.calculationTrace && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Authoritative Calculation Trace Breakdown
                    </h4>

                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                      <div>Total valid entries evaluated: {auc.calculationTrace.totalBids} ($49 USD per ticket)</div>
                      <div>Adjudication Algorithm: Lowest Unique Integer (Ascending Scan)</div>
                      <div>Engine Audit Hash: {auc.calculationTrace.hash}</div>
                      <div>Adjudication Officer: {auc.calculationTrace.adjudicationOfficer || 'Brook Aklilu (Superadmin)'}</div>
                    </div>

                    <div>
                      <span className="font-semibold block mb-1">
                        Unique numbers identified in ascending order:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {auc.calculationTrace.uniqueNumbers.map((num) => (
                          <span
                            key={num}
                            className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                              num === auc.winningNumber
                                ? 'bg-[#FF7900] text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            #{num} {num === auc.winningNumber ? '★ WINNER' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
