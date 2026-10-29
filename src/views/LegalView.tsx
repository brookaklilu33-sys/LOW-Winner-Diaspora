import React, { useState } from 'react';
import { AlertCircle, FileText, ArrowLeft, Shield, Building, Award, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LegalView: React.FC<{ initialSection?: string }> = ({ initialSection = 'TERMS' }) => {
  const { navigateTo } = useApp();
  const [section, setSection] = useState<string>(initialSection);

  const sections = [
    { id: 'TERMS', title: 'Terms of Service' },
    { id: 'RULES', title: 'Official Competition Rules' },
    { id: 'ELIGIBILITY', title: 'Diaspora Eligibility' },
    { id: 'CONVEYANCE', title: 'Property Title & Conveyance' },
    { id: 'PAYMENTS', title: 'Payment & Refund Guarantee' },
    { id: 'PRIVACY', title: 'Privacy Policy' },
    { id: 'SUPPORT', title: 'Compliance & Support' }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <button
        onClick={() => navigateTo('/')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#686868] dark:text-[#A0A0A0] hover:text-[#202124] dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Competitions</span>
      </button>

      {/* Statutory Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <strong className="block font-bold">
            DIASPORA COMPETITION LEGAL DISCLOSURE
          </strong>
          <p>
            Lowwin Diaspora property competitions operate under transparent, published rules with deterministic winner evaluation. An entry ticket allows the confidential submission of a single whole number within the competition range. Entry tickets do not constitute purchase or fractional ownership of the real estate unless awarded as the verified lowest unique qualifying participant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                section === s.id
                  ? 'bg-[#FF7900] text-white shadow-xs'
                  : 'text-[#686868] dark:text-[#A0A0A0] hover:bg-slate-100 dark:hover:bg-[#202020]'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="md:col-span-3 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 text-xs text-[#202124] dark:text-[#D5D5D5] space-y-4 leading-relaxed">
          {section === 'TERMS' && (
            <>
              <h2 className="text-lg font-bold text-[#202124] dark:text-white">
                Lowwin Diaspora Terms of Service
              </h2>
              <p className="text-slate-500">Effective Date: October 2026. Version 2.4.</p>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">1. Service Purpose</h3>
              <p>
                Lowwin Diaspora is a diaspora-focused web platform enabling eligible individuals residing outside Ethiopia to participate in verifiable, skill-and-strategy lowest-unique-bid competitions for residential properties (apartments, penthouses, and freestanding homes) located in Addis Ababa, Ethiopia.
              </p>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">2. Fixed Entry Price</h3>
              <p>
                Each unique competition ticket is priced at exactly <strong>$49 USD</strong> (4900 integer cents). One paid ticket grants one confidential whole number submission within the competition's published number range. Multiple entries are subject to the maximum limit published per property listing (typically 5 tickets per participant).
              </p>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">3. Zero Random Drawings</h3>
              <p>
                Lowwin Diaspora does not conduct lotteries, raffles, or random drawings. The outcome is determined solely by the mathematical distribution of numbers submitted by all eligible participants.
              </p>
            </>
          )}

          {section === 'RULES' && (
            <>
              <h2 className="text-lg font-bold text-[#202124] dark:text-white">
                Official Lowest-Unique-Bid Rules
              </h2>
              <p>
                The winning rule is strict and verifiable: The winning participant is the person who submits the <strong>lowest positive whole integer</strong> that was chosen by <strong>exactly ONE</strong> eligible participant during the competition window.
              </p>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">Step-by-Step Winner Determination</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Upon scheduled closing time, all bid submissions are frozen in an immutable cryptographic audit record.</li>
                <li>A frequency tally is computed across the entire integer range (e.g. 1 to 1000).</li>
                <li>Numbers chosen two or more times are declared non-unique and are disqualified from winning.</li>
                <li>From the remaining set of numbers chosen exactly once, the lowest integer is selected as the winning number.</li>
                <li>The participant associated with that entry is verified for diaspora eligibility before award confirmation.</li>
              </ul>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">No-Winner Refund Guarantee</h3>
              <p>
                If all submitted numbers are duplicated and no unique number exists when bidding closes, Lowwin Diaspora enforces a full refund guarantee: 100% of all paid ticket entry fees for that competition are refunded to participants. No substitution drawings or replacement picks are permitted.
              </p>
            </>
          )}

          {section === 'ELIGIBILITY' && (
            <>
              <h2 className="text-lg font-bold text-[#202124] dark:text-white">
                Diaspora Eligibility & Verification
              </h2>
              <p>
                Participation is open exclusively to individuals living outside of Ethiopia who qualify under Ethiopian legal frameworks governing diaspora real estate acquisition and holding.
              </p>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">Required Qualifications</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Must be at least 18 years of age at the time of ticket entry.</li>
                <li>Must hold legal residence outside Ethiopia (e.g., USA, Canada, UK, European Union, UAE, etc.).</li>
                <li>Must possess valid Ethiopian Origin Identification (Yellow Card), Ethiopian passport, or dual nationality documentation recognized by Ethiopian authorities for real estate conveyance.</li>
                <li>Employees of Lowwin Diaspora, affiliated property inspection partners, and immediate family members are barred from participation.</li>
              </ul>
            </>
          )}

          {section === 'CONVEYANCE' && (
            <>
              <h2 className="text-lg font-bold text-[#202124] dark:text-white">
                Property Title Deed & Award Conveyance
              </h2>
              <p>
                Every property featured on Lowwin Diaspora undergoes rigorous legal and physical due diligence prior to competition launch.
              </p>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">Due Diligence Protocol</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Title Verification:</strong> Clean title deed authenticated through the Addis Ababa Land Holding Registration and Information Agency.</li>
                <li><strong>Encumbrance Check:</strong> Absence of mortgages, liens, tax arrears, or municipal disputes certified by licensed Ethiopian counsel.</li>
                <li><strong>Developer Warranty:</strong> Transfer warranties and condominium subdivision certificates held in escrow.</li>
                <li><strong>Conveyance Closing:</strong> Formal deed transfer to the verified winner is administered by legal counsel with all municipal registration fees covered as specified in the competition documentation.</li>
              </ul>
            </>
          )}

          {section === 'PAYMENTS' && (
            <>
              <h2 className="text-lg font-bold text-[#202124] dark:text-white">
                Payment Verification & Refund Policy
              </h2>
              <p>
                Lowwin Diaspora uses provider-independent financial accounting with exact integer-cent ledger tracking. Ticket checkouts are processed through authorized payment gateways (Stripe, PayPal, or verified bank wire).
              </p>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">Fail-Closed Security Gates</h3>
              <p>
                A button click or client redirect is never treated as proof of payment. Entries are generated only after authoritative server-side webhook signature verification. In the event of competition cancellation or absence of a unique winner, full refunds are issued to the original payment source.
              </p>
            </>
          )}

          {section === 'PRIVACY' && (
            <>
              <h2 className="text-lg font-bold text-[#202124] dark:text-white">
                Privacy & Bid Confidentiality
              </h2>
              <p>
                We protect the privacy and strategic competitive choices of every participant.
              </p>

              <h3 className="font-bold text-sm pt-2 text-[#202124] dark:text-white">Bid Number Confidentiality</h3>
              <p>
                During an active competition, your submitted bid numbers are confidential and encrypted. Public feeds display anonymized aggregate numbers without participant identities, and your personal numbers are excluded from your feed view to prevent bid-copying.
              </p>
            </>
          )}

          {section === 'SUPPORT' && (
            <>
              <h2 className="text-lg font-bold text-[#202124] dark:text-white">
                Compliance & Customer Support
              </h2>
              <p>
                For questions regarding competition rules, property title inspection, or payment inquiries, reach our administrative operations team:
              </p>
              <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2 mt-2">
                <div><strong>Inquiries:</strong> support@lowwin-diaspora.com</div>
                <div><strong>Legal & Title Review:</strong> compliance@lowwin-diaspora.com</div>
                <div><strong>Headquarters:</strong> Addis Ababa, Ethiopia & International Diaspora Operations</div>
                <div><strong>Response SLA:</strong> Within 1 business day (East Africa Time)</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
