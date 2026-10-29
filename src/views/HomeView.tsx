import React from 'react';
import { useApp } from '../context/AppContext';
import { AuctionCard } from '../components/AuctionCard';
import { ArrowRight } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { auctions, navigateTo, t } = useApp();

  // Show live and upcoming competitions on the homepage
  const displayedCompetitions = auctions.slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6 pt-2 pb-6">
      {/* Top Section Header with Title, Short Subtitle, and View All link (Exact match to screenshot 1 & 3) */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('property_competitions')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('home_subtitle')}
          </p>
        </div>

        <button
          onClick={() => navigateTo('/properties')}
          className="text-xs sm:text-sm font-bold text-[#FF7900] hover:text-[#E85D04] flex items-center gap-1 transition-all active:scale-95 shrink-0 pb-0.5"
        >
          <span>{t('view_all')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Responsive Property Competitions Grid (4 columns on desktop, 2-3 on tablet, 1-2 on mobile) */}
      {displayedCompetitions.length === 0 ? (
        <div className="bg-white dark:bg-[#151C28] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          <p className="text-xs font-semibold">{t('no_competitions_open')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayedCompetitions.map((competition) => (
            <AuctionCard key={competition.id} competition={competition} />
          ))}
        </div>
      )}
    </div>
  );
};
