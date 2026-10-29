import React, { useState } from 'react';
import { Competition } from '../types/auction';
import { useApp } from '../context/AppContext';
import { Clock, ArrowRight, Building, Calendar, Video, Maximize2 } from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal';
import { ImagePreloader } from '../utils/imagePreloader';

interface CompetitionCardProps {
  competition?: Competition;
  auction?: Competition; // Alias
}

export const AuctionCard: React.FC<CompetitionCardProps> = ({ competition, auction }) => {
  const comp = competition || auction;
  const { navigateTo, t } = useApp();
  const [imageLoaded, setImageLoaded] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!comp) return null;

  const isLive = comp.status === 'LIVE' || comp.status === 'OPEN';
  const isUpcoming = comp.status === 'SCHEDULED';
  const hasVideo = !!(comp.property.videoUrl || (comp.property.videos && comp.property.videos.length > 0));

  // Format countdown or start time
  const getTimeDisplay = () => {
    if (isUpcoming) {
      const start = new Date(comp.startTime);
      return start.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const end = new Date(comp.endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const primaryImage = comp.property.images?.[0];

  const handleWarmUp = () => {
    if (comp.property.images && comp.property.images.length > 0) {
      ImagePreloader.warmGallery(comp.property.images);
    }
  };

  const handleCardClick = () => {
    handleWarmUp();
    navigateTo(`/property/${comp.slug || comp.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={handleWarmUp}
      onTouchStart={handleWarmUp}
      className="bg-white/75 dark:bg-[#151C28]/75 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-white/10 overflow-hidden flex flex-col hover:border-[#FF7900]/50 hover:shadow-[0_12px_36px_rgba(255,121,0,0.12)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 group active:scale-[0.99] cursor-pointer select-none"
    >
      {/* Property Image Section with compact Status Badge */}
      <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-center">
        {imageLoaded && primaryImage ? (
          <img
            src={primaryImage}
            alt={comp.property.title}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageLoaded(false)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Building className="w-10 h-10 text-[#FF7900] mb-2" />
            <span className="text-xs font-semibold">{comp.property.title}</span>
          </div>
        )}

        {/* Compact Status Badges in Upper-Left Corner (Minimalist & Sleek) */}
        <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none z-10">
          {isLive ? (
            <div className="bg-emerald-500/85 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{t('status_active')}</span>
            </div>
          ) : isUpcoming ? (
            <div className="bg-sky-500/85 backdrop-blur-md text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-white/20">
              <Calendar className="w-2.5 h-2.5 text-white" />
              <span>{t('status_upcoming')}</span>
            </div>
          ) : (
            <div className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-xs border border-white/10">
              <span>{t('status_completed')}</span>
            </div>
          )}

          {/* Video Indicator Chip */}
          {hasVideo && (
            <div className="bg-black/60 backdrop-blur-md text-white/95 px-1.5 py-0.5 rounded-full text-[8.5px] font-bold flex items-center gap-0.5 border border-white/15">
              <Video className="w-2.5 h-2.5 text-[#FF7900]" />
              <span>{t('video_chip')}</span>
            </div>
          )}
        </div>

        {/* Quick Photo Lightbox Button (Compact) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/85 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 border border-white/20 shadow-xs transition-all active:scale-95 z-10"
          title="View full-resolution photos"
        >
          <Maximize2 className="w-2.5 h-2.5 text-[#FF7900]" />
          <span>Photos</span>
        </button>
      </div>

      {/* Property Card Details */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 space-y-2.5">
        <div>
          {/* Title: 1 line with ellipsis */}
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate group-hover:text-[#FF7900] transition-colors">
            {comp.title}
          </h3>

          {/* Location & Specs Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 gap-2">
            <span className="truncate">{comp.property.subCityArea || comp.property.city || 'Addis Ababa'}</span>
            {comp.property.bedrooms && (
              <span className="shrink-0 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {comp.property.bedrooms} Bed · {comp.property.bathrooms || 2} Bath
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Timing aligned key-value pairs */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('entry_label')}</span>
            <div className="flex items-center gap-1">
              <span className="font-black text-[#FF7900] dark:text-[#FFA74D] text-sm tabular-nums">
                {t('entry_val')}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">USD</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isUpcoming ? t('starts_label') : t('ends_label')}
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums flex items-center gap-1 text-[11px]">
              {!isUpcoming && <Clock className="w-3 h-3 text-slate-400" />}
              <span>{getTimeDisplay()}</span>
            </span>
          </div>
        </div>

        {/* Full-width Wide Primary Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="w-full min-h-[38px] py-2 bg-gradient-to-r from-[#FF7900] to-[#E85D04] hover:from-[#E85D04] hover:to-[#C44E00] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(255,121,0,0.22)] active:scale-[0.98]"
        >
          <span>{t('view_btn')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Direct Full-Screen Image Lightbox */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={comp.property.images && comp.property.images.length > 0 ? comp.property.images : (primaryImage ? [primaryImage] : [])}
        title={comp.property.title}
        subtitle={`${comp.property.subCityArea || comp.property.city || 'Addis Ababa'}, Ethiopia`}
      />
    </article>
  );
};
