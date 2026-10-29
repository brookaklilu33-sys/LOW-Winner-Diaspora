import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AuctionCard } from '../components/AuctionCard';
import { Search } from 'lucide-react';

export const AuctionsView: React.FC = () => {
  const { auctions, t } = useApp();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and search logic operating on real competition records
  const filteredAuctions = useMemo(() => {
    return auctions.filter((comp) => {
      // 1. Status Filter
      if (statusFilter === 'ACTIVE') {
        const isActive = comp.status === 'LIVE' || comp.status === 'OPEN';
        if (!isActive) return false;
      } else if (statusFilter === 'UPCOMING') {
        if (comp.status !== 'SCHEDULED') return false;
      } else if (statusFilter === 'COMPLETED') {
        const isEnded =
          comp.status === 'COMPLETED' ||
          comp.status === 'RESULT_FINALIZED' ||
          comp.status === 'AWARDED' ||
          comp.status === 'CLOSED';
        if (!isEnded) return false;
      }

      // 2. Search Query Filter (Title, Sub-city Area, Address, Property Type)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = comp.title.toLowerCase().includes(q);
        const propTitleMatch = comp.property.title.toLowerCase().includes(q);
        const areaMatch = (comp.property.subCityArea || '').toLowerCase().includes(q);
        const addressMatch = (comp.property.address || '').toLowerCase().includes(q);
        const typeMatch = (comp.property.propertyType || '').toLowerCase().includes(q);

        if (!titleMatch && !propTitleMatch && !areaMatch && !addressMatch && !typeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [auctions, statusFilter, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-5 pt-2 pb-6">
      {/* Top Header Row with Title, Instruction, and Compact Status Filter (Exact match to screenshot 2) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('competitions_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('competitions_subtitle')}
          </p>
        </div>

        {/* Compact Status Filter in Rounded Container */}
        <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-white/10 self-start sm:self-auto shrink-0 shadow-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 text-[11px] rounded-lg transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('filter_all')}
          </button>
          <button
            onClick={() => setStatusFilter('UPCOMING')}
            className={`px-2.5 py-1 text-[11px] rounded-lg transition-all ${
              statusFilter === 'UPCOMING'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('filter_upcoming')}
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-2.5 py-1 text-[11px] rounded-lg transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('filter_active')}
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-2.5 py-1 text-[11px] rounded-lg transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('filter_completed')}
          </button>
        </div>
      </div>

      {/* Full-width Search Input with Search Icon (Exact match to screenshot 2) */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#151C28] border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/40 focus:border-[#FF7900] shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {t('clear')}
          </button>
        )}
      </div>

      {/* Responsive Property Cards Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="bg-white dark:bg-[#151C28] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          <p className="text-xs sm:text-sm font-semibold">{t('no_competitions_found')}</p>
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 bg-[#FF7900] text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
          >
            {t('reset_filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredAuctions.map((competition) => (
            <AuctionCard key={competition.id} competition={competition} />
          ))}
        </div>
      )}
    </div>
  );
};
