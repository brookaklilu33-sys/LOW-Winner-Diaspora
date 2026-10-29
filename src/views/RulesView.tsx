import React, { useState } from 'react';
import { LowestUniqueBidService } from '../services/LowestUniqueBidService';
import { Bid, EntryConfig } from '../types/auction';
import { Trophy, CheckCircle2, XCircle, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

export const RulesView: React.FC = () => {
  // Interactive simulator state initialized with the benchmark from prompt section 6
  const [bidsInput, setBidsInput] = useState<Array<{ name: string; number: number }>>([
    { name: 'User A', number: 10 },
    { name: 'User B', number: 10 },
    { name: 'User C', number: 15 },
    { name: 'User D', number: 20 },
    { name: 'User E', number: 20 },
    { name: 'User F', number: 25 }
  ]);

  const [newParticipant, setNewParticipant] = useState<string>('User G');
  const [newNumber, setNewNumber] = useState<number>(12);

  const testConfig: EntryConfig = {
    ticketPriceUSD: 49,
    ticketPriceCents: 4900,
    entryFeeUnique: 60,
    includedBids: 5,
    costPerAdditionalBidUnique: 10,
    minNumber: 1,
    maxNumber: 100,
    maxTicketsPerParticipant: 5,
    maxEntriesPerUser: 5,
    refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
  };

  // Convert to Bid format and evaluate
  const bidsList: Bid[] = bidsInput.map((b, idx) => ({
    id: `sim_bid_${idx}`,
    auctionId: 'sim_auction',
    entryId: `ent_${idx}`,
    userId: `usr_${idx}`,
    userName: b.name,
    number: b.number,
    submittedAt: new Date().toISOString()
  }));

  const trace = LowestUniqueBidService.calculateWinner('sim_auction', bidsList, testConfig);

  const addBid = () => {
    if (!newParticipant || !newNumber) return;
    setBidsInput([...bidsInput, { name: newParticipant, number: Number(newNumber) }]);
    setNewParticipant(`User ${String.fromCharCode(65 + bidsInput.length + 1)}`);
    setNewNumber(Math.floor(Math.random() * 30) + 1);
  };

  const resetToBenchmark = () => {
    setBidsInput([
      { name: 'User A', number: 10 },
      { name: 'User B', number: 10 },
      { name: 'User C', number: 15 },
      { name: 'User D', number: 20 },
      { name: 'User E', number: 20 },
      { name: 'User F', number: 25 }
    ]);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF7900]">
          Core Auction Mechanic
        </span>
        <h1 className="text-3xl font-extrabold text-[#202124] dark:text-white mt-1">
          How Lowest Unique Bid Auctions Work
        </h1>
        <p className="text-xs sm:text-sm text-[#686868] dark:text-[#A0A0A0] mt-1 max-w-2xl">
          LOWwinner is not a highest-bid auction. The winner is the participant whose valid submitted number is the lowest number selected by exactly ONE participant.
        </p>
      </div>

      {/* The 3 Golden Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl p-5 rounded-2xl border border-white/60 dark:border-white/10 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FFF3E8] dark:bg-[#2F1E12] text-[#FF7900] flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">Whole Numbers</h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Each bid is a secret whole number within the published range (e.g., 1 to 500).
          </p>
        </div>

        <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl p-5 rounded-2xl border border-white/60 dark:border-white/10 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FFF3E8] dark:bg-[#2F1E12] text-[#FF7900] flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">Uniqueness Filter</h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            If two or more people submit the same number, that number is duplicated and eliminated.
          </p>
        </div>

        <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl p-5 rounded-2xl border border-white/60 dark:border-white/10 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FFF3E8] dark:bg-[#2F1E12] text-[#FF7900] flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">Lowest Wins</h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Out of all numbers chosen by only one person, the smallest one takes the prize!
          </p>
        </div>
      </div>

      {/* Interactive Visual Simulator */}
      <div className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#202124] dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF7900]" />
              Interactive Mechanic Simulator
            </h2>
            <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
              Test any combination of numbers and see the server-side engine group, count, and select the winner in real time.
            </p>
          </div>

          <button
            onClick={resetToBenchmark}
            className="text-xs font-semibold px-3 py-1.5 bg-[#F4EFEA] dark:bg-[#222] hover:bg-[#E8E3DE] rounded-lg transition-colors self-start sm:self-auto"
          >
            Reset to Standard Example
          </button>
        </div>

        {/* Input Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
              Submitted Bids in Simulation ({bidsInput.length})
            </h4>

            <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A] border border-[#E8E3DE] dark:border-[#2A2A2A] rounded-xl overflow-hidden bg-[#FAF8F5] dark:bg-[#151515]">
              {bidsInput.map((b, i) => {
                const count = trace.frequencyMap[b.number] || 0;
                const isUnique = count === 1;
                const isWinning = b.number === trace.lowestUniqueNumber;

                return (
                  <div key={i} className="px-3.5 py-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#202124] dark:text-white">{b.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm tabular-nums text-[#FF7900]">
                        #{b.number}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isWinning
                            ? 'bg-[#FF7900] text-white'
                            : isUnique
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {isWinning ? 'WINNER' : isUnique ? 'Unique' : `Duplicate (x${count})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Bid Form */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                placeholder="Participant Name"
                className="flex-1 px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg text-xs"
              />
              <input
                type="number"
                min="1"
                max="100"
                value={newNumber}
                onChange={(e) => setNewNumber(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg text-xs font-mono font-bold"
              />
              <button
                onClick={addBid}
                className="px-3 py-2 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-lg transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Engine Resolution Summary */}
          <div className="space-y-4 bg-[#FFF8F3] dark:bg-[#201811] p-5 rounded-2xl border border-[#FFD8B8] dark:border-[#4B2F18]">
            <h4 className="text-xs font-bold text-[#FF7900] uppercase tracking-wider">
              Server-Side Resolution Steps
            </h4>

            {/* Step 1: Group & Count */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#202124] dark:text-white block">
                1. Group Bids by Number:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(trace.frequencyMap).map(([num, count]) => (
                  <span
                    key={num}
                    className={`px-2 py-1 rounded text-xs font-mono ${
                      count === 1
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold'
                        : 'bg-slate-200 dark:bg-[#333] text-slate-500 line-through'
                    }`}
                  >
                    #{num} ({count}x)
                  </span>
                ))}
              </div>
            </div>

            {/* Step 2: Unique Numbers */}
            <div className="text-xs space-y-1 pt-2">
              <span className="font-bold text-[#202124] dark:text-white block">
                2. Filter Unique Numbers (Count == 1):
              </span>
              <div className="text-xs text-[#686868] dark:text-[#A0A0A0]">
                {trace.uniqueNumbers.length > 0
                  ? `[ ${trace.uniqueNumbers.join(', ')} ]`
                  : 'None. All submitted numbers had duplicates!'}
              </div>
            </div>

            {/* Step 3: Lowest Winner Outcome */}
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-[#FFD8B8] dark:border-[#422A17] space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FF7900]" />
                <span className="font-bold text-sm text-[#202124] dark:text-white">
                  Calculated Outcome
                </span>
              </div>

              {trace.lowestUniqueNumber !== null ? (
                <div>
                  <div className="text-2xl font-black text-[#FF7900] tabular-nums">
                    #{trace.lowestUniqueNumber}
                  </div>
                  <div className="text-xs font-semibold text-[#202124] dark:text-white mt-0.5">
                    Winner: {trace.winnerUserName}
                  </div>
                  <div className="text-[11px] text-[#686868] dark:text-[#A0A0A0] mt-1 font-mono">
                    Deterministic Hash: {trace.hash}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#E85D04]">
                  No unique numbers exist. Under policy ({testConfig.refundPolicy}), all entries are refunded in full.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
