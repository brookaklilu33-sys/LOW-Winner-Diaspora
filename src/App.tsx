import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { AdminAuthModal } from './components/AdminAuthModal';

// Code-split lazy views for optimized initial load
const HomeView = lazy(() => import('./views/HomeView').then((m) => ({ default: m.HomeView })));
const AuctionsView = lazy(() => import('./views/AuctionsView').then((m) => ({ default: m.AuctionsView })));
const AuctionDetailView = lazy(() =>
  import('./views/AuctionDetailView').then((m) => ({ default: m.AuctionDetailView }))
);
const WalletView = lazy(() => import('./views/WalletView').then((m) => ({ default: m.WalletView })));
const DepositView = lazy(() => import('./views/DepositView').then((m) => ({ default: m.DepositView })));
const WithdrawView = lazy(() => import('./views/WithdrawView').then((m) => ({ default: m.WithdrawView })));
const HistoryView = lazy(() => import('./views/HistoryView').then((m) => ({ default: m.HistoryView })));
const ProfileView = lazy(() => import('./views/ProfileView').then((m) => ({ default: m.ProfileView })));
const RulesView = lazy(() => import('./views/RulesView').then((m) => ({ default: m.RulesView })));
const AdminView = lazy(() => import('./views/AdminView').then((m) => ({ default: m.AdminView })));
const AdminCompetitionDetailView = lazy(() =>
  import('./views/AdminCompetitionDetailView').then((m) => ({ default: m.AdminCompetitionDetailView }))
);
const LegalView = lazy(() => import('./views/LegalView').then((m) => ({ default: m.LegalView })));

// Sleek loading fallback for code-split transitions
function RouteLoadingFallback() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center space-y-3 py-16 animate-pulse">
      <div className="w-9 h-9 rounded-full border-2 border-[#FF7900] border-t-transparent animate-spin" />
      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
        Loading...
      </span>
    </div>
  );
}

function MainRouter() {
  const { currentRoute } = useApp();

  let content: React.ReactNode = <HomeView />;

  if (currentRoute === '/') {
    content = <HomeView />;
  } else if (currentRoute === '/properties' || currentRoute === '/auctions') {
    content = <AuctionsView />;
  } else if (currentRoute.startsWith('/property/')) {
    const slug = currentRoute.replace('/property/', '');
    content = <AuctionDetailView idOrSlug={slug} />;
  } else if (currentRoute.startsWith('/auction/')) {
    const slug = currentRoute.replace('/auction/', '');
    content = <AuctionDetailView idOrSlug={slug} />;
  } else if (currentRoute === '/how-it-works' || currentRoute === '/rules') {
    content = <RulesView />;
  } else if (
    currentRoute === '/results' ||
    currentRoute === '/history' ||
    currentRoute === '/my-entries'
  ) {
    content = <HistoryView />;
  } else if (currentRoute === '/wallet') {
    content = <WalletView />;
  } else if (currentRoute === '/deposit') {
    content = <DepositView />;
  } else if (currentRoute === '/withdraw') {
    content = <WithdrawView />;
  } else if (currentRoute === '/profile') {
    content = <ProfileView />;
  } else if (currentRoute === '/admin') {
    content = <AdminView />;
  } else if (currentRoute.startsWith('/admin/competition/')) {
    const competitionId = currentRoute.replace('/admin/competition/', '');
    content = <AdminCompetitionDetailView competitionId={competitionId} />;
  } else if (currentRoute.startsWith('/legal')) {
    const parts = currentRoute.split('/');
    const section = parts[2] || 'TERMS';
    content = <LegalView initialSection={section} />;
  } else {
    content = <HomeView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5">
        <Suspense fallback={<RouteLoadingFallback />}>
          {content}
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      {/* Hidden 5-tap gesture modal */}
      <AdminAuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
