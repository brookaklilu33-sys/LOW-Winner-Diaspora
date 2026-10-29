import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Gavel, Wallet, Clock, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentRoute, navigateTo, t } = useApp();

  const destinations = [
    {
      key: 'home',
      label: t('home'),
      icon: Home,
      route: '/',
      isActive: currentRoute === '/'
    },
    {
      key: 'auctions',
      label: t('competitions'),
      icon: Gavel,
      route: '/properties',
      isActive:
        currentRoute.startsWith('/propert') ||
        currentRoute.startsWith('/auction')
    },
    {
      key: 'wallet',
      label: t('wallet'),
      icon: Wallet,
      route: '/wallet',
      isActive:
        currentRoute === '/wallet' ||
        currentRoute === '/deposit' ||
        currentRoute === '/withdraw'
    },
    {
      key: 'history',
      label: t('history'),
      icon: Clock,
      route: '/history',
      isActive:
        currentRoute === '/history' ||
        currentRoute === '/results' ||
        currentRoute === '/my-entries'
    },
    {
      key: 'profile',
      label: t('profile'),
      icon: User,
      route: '/profile',
      isActive:
        currentRoute === '/profile' ||
        currentRoute.startsWith('/legal')
    }
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/75 dark:bg-[#0F172A]/75 backdrop-blur-2xl border-t border-white/60 dark:border-white/10 transition-colors pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_32px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-2xl mx-auto grid grid-cols-5 h-14 sm:h-16 items-center px-2">
        {destinations.map((dest) => {
          const Icon = dest.icon;
          const active = dest.isActive;

          return (
            <button
              key={dest.key}
              onClick={() => navigateTo(dest.route)}
              className="flex flex-col items-center justify-center min-h-[48px] py-1 transition-all active:scale-95 select-none relative group"
              aria-label={dest.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="flex flex-col items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active
                      ? 'text-[#FF7900] dark:text-[#FFA74D] stroke-[2.2]'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-xs mt-1 transition-colors leading-none tracking-tight ${
                    active
                      ? 'text-[#FF7900] dark:text-[#FFA74D] font-bold'
                      : 'text-slate-500 dark:text-slate-400 font-medium'
                  }`}
                >
                  {dest.label}
                </span>

                {/* Reference Under-Dot Indicator */}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900] dark:bg-[#FFA74D] mt-1 shadow-xs" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
