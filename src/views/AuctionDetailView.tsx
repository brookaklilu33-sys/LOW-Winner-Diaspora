import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AuctionManagerService } from '../services/auctionManagerService';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { SocialAuthModal } from '../components/SocialAuthModal';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Bed,
  Bath,
  Maximize2,
  Building,
  Video,
  Upload,
  Play,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AuctionDetailViewProps {
  idOrSlug: string;
}

export const AuctionDetailView: React.FC<AuctionDetailViewProps> = ({ idOrSlug }) => {
  const { navigateTo, currentUser, refreshWallet, t, updateListingProperty } = useApp();

  const competition = AuctionManagerService.getCompetitionById(idOrSlug);

  const [activeMediaTab, setActiveMediaTab] = useState<'PHOTO' | 'VIDEO'>('PHOTO');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'RULES'>('OVERVIEW');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [chosenNumber, setChosenNumber] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showSocialAuthModal, setShowSocialAuthModal] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  if (!competition) {
    return (
      <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Property Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The property competition with identifier '{idOrSlug}' does not exist or has been archived.
        </p>
        <button
          onClick={() => navigateTo('/properties')}
          className="px-4 py-2 bg-[#FF7900] text-white font-semibold text-xs rounded-xl"
        >
          Return to Competitions
        </button>
      </div>
    );
  }

  const prop = competition.property;
  const propImages =
    prop.images && prop.images.length > 0
      ? prop.images
      : prop.image
      ? [prop.image]
      : ['/images/addis_bole_luxury_apartment_1792574992395.jpg'];
  const propDocs = prop.documents || [];
  const valuation = prop.valuationUSD ?? prop.retailValueUSD ?? 0;
  const config = competition.entryConfig;

  // Active video (if configured or sample walkthrough)
  const activeVideoUrl =
    prop.videoUrl ||
    (prop.videos && prop.videos[0]) ||
    'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-with-living-room-and-terrace-41315-large.mp4';

  // User's own secret bids on this competition
  const userBids = AuctionManagerService.getUserBidsForCompetition(competition.id, currentUser.id);

  // Time remaining calculation
  const calculateTimeLeft = () => {
    const end = new Date(competition.endTime).getTime();
    const diff = end - Date.now();
    if (diff <= 0) return 'Competition Closed';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      return `${Math.floor(hours / 24)} days ${hours % 24} hours left`;
    }
    return `${hours}h ${minutes}m left`;
  };

  // Video file upload handler
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    updateListingProperty(competition.id, {
      videoUrl: objectUrl,
      videos: [objectUrl, ...(prop.videos || [])]
    });
    setActiveMediaTab('VIDEO');
    setShowVideoUploadModal(false);
  };

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) return;

    updateListingProperty(competition.id, {
      videoUrl: videoUrlInput.trim(),
      videos: [videoUrlInput.trim(), ...(prop.videos || [])]
    });
    setActiveMediaTab('VIDEO');
    setShowVideoUploadModal(false);
    setVideoUrlInput('');
  };

  // Internal execution of entry
  const submitEntryWithNumber = (parsedNumber: number) => {
    setIsSubmitting(true);
    const res = AuctionManagerService.enterWithNumber({
      competitionId: competition.id,
      userId: currentUser.id,
      userName: currentUser.displayName || currentUser.email,
      number: parsedNumber,
      quantity: ticketQuantity
    });

    setIsSubmitting(false);

    if (!res.success) {
      setSubmitError(res.error || 'Failed to submit entry.');
    } else {
      refreshWallet();
      setSubmitSuccess(
        `Success! Your choice #${parsedNumber} is registered. Lowest unique positive integer wins the deed when time expires!`
      );
      setChosenNumber('');
    }
  };

  // Instant minimal enter & pay handler with first-time buyer social auth check
  const handleDirectEnterAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const parsedNumber = parseInt(chosenNumber.trim(), 10);
    if (isNaN(parsedNumber) || parsedNumber < 1) {
      setSubmitError('Please enter a valid positive whole number (e.g. 19, 42).');
      return;
    }

    // Check if user is first-time buyer on this device
    const isFirstTimeGuest = !currentUser || currentUser.id === 'usr_participant_default';
    if (isFirstTimeGuest) {
      setShowSocialAuthModal(true);
      return;
    }

    submitEntryWithNumber(parsedNumber);
  };

  return (
    <div className="space-y-5 pb-20 max-w-5xl mx-auto">
      {/* Top Breadcrumb (Clean & Minimalist: Selectors 1 & 2 removed) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('/properties')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF7900]" />
          <span>{t('back_to_properties')}</span>
        </button>

        {/* Video Upload trigger in gallery toolbar */}
        <button
          onClick={() => setShowVideoUploadModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-xs font-bold text-[#FF7900] hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all active:scale-95 shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Video Tour</span>
        </button>
      </div>

      {/* Main Property Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Media Gallery & Clean Tabs */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Media Showcase (Clickable for full screen photo viewer) */}
          <div className="bg-white/75 dark:bg-[#0F172A]/75 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 overflow-hidden shadow-xs">
            {activeMediaTab === 'PHOTO' ? (
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative aspect-[16/10] bg-slate-900 overflow-hidden cursor-pointer group"
                title="Tap to view full resolution photos"
              >
                <img
                  src={propImages[selectedPhotoIndex] || propImages[0]}
                  alt={prop.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/20 shadow-sm">
                  <Maximize2 className="w-2.5 h-2.5 text-[#FF7900]" />
                  <span>Photos ({propImages.length})</span>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/10] bg-black overflow-hidden flex items-center justify-center">
                <video
                  src={activeVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Gallery Media Switcher & Thumbnails */}
            <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2">
                {/* Photo thumbnails */}
                {propImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPhotoIndex(idx);
                      setActiveMediaTab('PHOTO');
                    }}
                    className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeMediaTab === 'PHOTO' && selectedPhotoIndex === idx
                        ? 'border-[#FF7900] ring-2 ring-[#FF7900]/25'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* Video Tour thumbnail button */}
                <button
                  onClick={() => setActiveMediaTab('VIDEO')}
                  className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 flex flex-col items-center justify-center bg-slate-900 text-white ${
                    activeMediaTab === 'VIDEO'
                      ? 'border-[#FF7900] ring-2 ring-[#FF7900]/25'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  title="Watch Video Tour"
                >
                  <Play className="w-4 h-4 text-[#FF7900]" />
                  <span className="text-[9px] font-bold">Video</span>
                </button>
              </div>

              {/* Toggle switch between Photo and Video */}
              <div className="inline-flex items-center p-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                <button
                  onClick={() => setActiveMediaTab('PHOTO')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    activeMediaTab === 'PHOTO'
                      ? 'bg-[#FF7900] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setActiveMediaTab('VIDEO')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    activeMediaTab === 'VIDEO'
                      ? 'bg-[#FF7900] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  <span>Video</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex gap-4 sm:gap-6 text-xs font-bold overflow-x-auto no-scrollbar">
            {[
              { id: 'OVERVIEW', label: t('property_facts') },
              { id: 'DOCUMENTS', label: `${t('documents_tab')} (${propDocs.length})` },
              { id: 'RULES', label: t('rules_tab') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#FF7900] text-[#FF7900] dark:text-[#FFA74D]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview & Specs */}
          {activeTab === 'OVERVIEW' && (
            <div className="bg-white/75 dark:bg-[#0F172A]/75 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 p-6 space-y-5 shadow-xs">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {competition.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {prop.subCityArea || 'Addis Ababa'}, {prop.city || 'Ethiopia'} · Registered Title:{' '}
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{prop.titleDeedRegistration}</span>
                </p>
              </div>

              {/* Spec Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('living_area')}</span>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-[#FF7900]" />
                    <span>{prop.floorAreaSqM} m²</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('master_beds')}</span>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-[#FF7900]" />
                    <span>{prop.bedrooms}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('fitted_baths')}</span>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-[#FF7900]" />
                    <span>{prop.bathrooms}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">{t('parking_reserved')}</span>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#FF7900]" />
                    <span>{prop.parkingSpaces}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('property_overview')}</h3>
                <p>{prop.description}</p>
              </div>

              {/* Key Features */}
              {prop.keyFeatures && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('key_features')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {prop.keyFeatures.map((feat: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Title & Due Diligence */}
          {activeTab === 'DOCUMENTS' && (
            <div className="bg-white/75 dark:bg-[#0F172A]/75 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Verified Land Registry Records
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official certificates verified against the Addis Ababa Land Management & Title Archive.
              </p>

              <div className="space-y-2.5">
                {propDocs.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400">{doc.fileName} · {doc.fileSize}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Rules & Transparency */}
          {activeTab === 'RULES' && (
            <div className="bg-white/75 dark:bg-[#0F172A]/75 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 p-6 space-y-3 text-xs text-slate-600 dark:text-slate-300 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Lowest Unique Number Mechanic
              </h3>
              <p>• Every participant selects a positive whole integer (e.g. 19, 42, 107).</p>
              <p>• Exactly one participant must submit that number for it to qualify as unique.</p>
              <p>• The qualified unique number with the lowest numerical value wins residential title.</p>
              <p>• Zero random draws. 100% full refund policy if no unique number exists.</p>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Minimalist Ticket Purchase & Direct Bid Entry (Selector 7 removed) */}
        <div className="lg:col-span-4 space-y-6">
          <div
            id="ticket-order-box"
            className="bg-white/75 dark:bg-[#0F172A]/75 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-white/10 p-6 space-y-4 shadow-xs sticky top-20"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7900] dark:text-[#FFA74D] block">
                {t('competition_entry')}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  $49
                </span>
                <span className="text-xs font-semibold text-slate-500">{t('usd_per_ticket')}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>{t('closing_in')}: {calculateTimeLeft()}</span>
              </p>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {/* Direct Minimalist Entry & Payment Form */}
            <form onSubmit={handleDirectEnterAndPay} className="space-y-4">
              {/* 1. Insert Lowest Unique Number Choice */}
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                  {t('your_secret_number')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                    #
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={chosenNumber}
                    onChange={(e) => setChosenNumber(e.target.value)}
                    placeholder={t('enter_number_placeholder')}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900] shadow-xs"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {t('number_hint')}
                </span>
              </div>

              {/* 2. Select Ticket Quantity */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Ticket Quantity (Max {config.maxTicketsPerParticipant || 5})
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setTicketQuantity(q)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        ticketQuantity === q
                          ? 'border-[#FF7900] bg-[#FF7900] text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#FF7900]/40'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{t('total_charge')}</span>
                <span className="font-black text-slate-900 dark:text-white tabular-nums text-sm">
                  ${(ticketQuantity * 49).toFixed(2)} USD
                </span>
              </div>

              {/* Pay & Enter Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] py-3 bg-gradient-to-r from-[#FF7900] to-[#E85D04] hover:from-[#E85D04] hover:to-[#C44E00] text-white font-extrabold text-xs rounded-full transition-all shadow-[0_4px_14px_rgba(255,121,0,0.3)] disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <span>{isSubmitting ? t('processing_entry') : `${t('pay_and_enter')} ($${ticketQuantity * 49} USD)`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* User's Own Submitted Numbers */}
            {userBids.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Your Entered Numbers ({userBids.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {userBids.map((b: any) => (
                    <span
                      key={b.id}
                      className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FF7900] dark:text-[#FFA74D] rounded-xl font-mono font-bold text-xs"
                    >
                      #{b.number}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Upload Modal */}
      {showVideoUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-[#FF7900]" />
                <span>Upload Video Tour</span>
              </h3>
              <button
                onClick={() => setShowVideoUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Upload a walkthrough video file (MP4/WebM) or provide an external video stream URL to embed in the listing gallery.
            </p>

            {/* File Upload Option */}
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                Upload Video File
              </label>
              <input
                type="file"
                ref={videoFileInputRef}
                accept="video/*"
                onChange={handleVideoFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FF7900] file:text-white hover:file:bg-[#E85D04] cursor-pointer"
              />
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-[#0F172A] px-2 text-[10px] text-slate-400 uppercase font-bold">
                OR
              </span>
            </div>

            {/* Video URL Option */}
            <form onSubmit={handleSaveVideoUrl} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                  Paste Video Stream URL
                </label>
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://.../video.mp4"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Save Video to Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sticky Quick Enter Bar (Fixed above bottom nav on phones) */}
      <div className="md:hidden fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/70 dark:border-white/10 p-2.5 px-4 rounded-2xl flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div>
          <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 block leading-none">
            {t('entry_ticket')}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              $49
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">USD</span>
          </div>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById('ticket-order-box');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="min-h-[42px] px-5 py-2 bg-gradient-to-r from-[#FF7900] to-[#E85D04] hover:from-[#E85D04] hover:to-[#C44E00] text-white font-bold text-xs rounded-full shadow-[0_4px_14px_rgba(255,121,0,0.35)] active:scale-95 flex items-center gap-1.5 transition-all"
        >
          <span>Select Number & Enter</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Full-Screen Photo Viewer Lightbox */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={propImages}
        initialIndex={selectedPhotoIndex}
        title={prop.title}
        subtitle={`${prop.subCityArea || 'Addis Ababa'}, Ethiopia`}
      />

      {/* Google and Apple First-Time Buyer Social Auth Modal */}
      <SocialAuthModal
        isOpen={showSocialAuthModal}
        onClose={() => setShowSocialAuthModal(false)}
        onSuccess={() => {
          const parsed = parseInt(chosenNumber.trim(), 10);
          if (!isNaN(parsed) && parsed >= 1) {
            submitEntryWithNumber(parsed);
          }
        }}
        actionTitle="Sign in with Google or Apple to secure your $49 USD ticket"
      />
    </div>
  );
};
