import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { navigateTo, t } = useApp();

  return (
    <footer className="border-t border-[#E8E3DE] dark:border-[#2A2A2A] bg-white dark:bg-[#151515] text-[#686868] dark:text-[#A0A0A0] text-xs py-5 md:py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="space-y-1">
          <div className="font-bold text-[#202124] dark:text-white flex items-center justify-center md:justify-start gap-2">
            <span>Lowwin <span className="text-[#FF7900]">Diaspora</span></span>
            <span className="text-[10px] bg-[#FFF3E8] dark:bg-[#2F1E12] text-[#FF7900] px-2 py-0.5 rounded-full font-bold border border-[#FFD8B8] dark:border-[#4E2D17]">
              $49 USD / Ticket
            </span>
          </div>
          <p className="text-[11px] text-[#686868] dark:text-[#A0A0A0]">
            Transparent lowest-unique-bid competitions for verified Ethiopian residential properties.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
          <button onClick={() => navigateTo('/rules')} className="hover:text-[#202124] dark:hover:text-white">
            {t('rules_link')}
          </button>
          <button onClick={() => navigateTo('/legal/TERMS')} className="hover:text-[#202124] dark:hover:text-white">
            {t('terms_link')}
          </button>
          <button onClick={() => navigateTo('/legal/PRIVACY')} className="hover:text-[#202124] dark:hover:text-white">
            {t('privacy_link')}
          </button>
          <button onClick={() => navigateTo('/legal/ELIGIBILITY')} className="hover:text-[#202124] dark:hover:text-white">
            {t('eligibility_link')}
          </button>
          <button onClick={() => navigateTo('/legal/SUPPORT')} className="hover:text-[#202124] dark:hover:text-white">
            {t('support_link')}
          </button>
        </div>
      </div>
    </footer>
  );
};
