import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { AdminAuthModal } from './components/AdminAuthModal';

// Views
import { HomeView } from './views/HomeView';
import { AuctionsView } from './views/AuctionsView';
import { AuctionDetailView } from './views/AuctionDetailView';
import { WalletView } from './views/WalletView';
import { DepositView } from './views/DepositView';
import { WithdrawView } from './views/WithdrawView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';
import { RulesView } from './views/RulesView';
import { AdminView } from './views/AdminView';
import { AdminCompetitionDetailView } from './views/AdminCompetitionDetailView';
import { LegalView } from './views/LegalView';

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
        {content}
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
