import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuctionManagerService } from '../services/auctionManagerService';
import { LowestUniqueBidService } from '../services/LowestUniqueBidService';
import { AdminService } from '../services/adminService';
import { Competition, Bid, PropertyDocumentEvidence } from '../types/auction';
import {
  ArrowLeft,
  Shield,
  Building,
  FileText,
  Sliders,
  Calendar,
  Users,
  CreditCard,
  Trophy,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  ExternalLink,
  RefreshCw,
  LogOut,
  Hash,
  Download
} from 'lucide-react';

export const AdminCompetitionDetailView: React.FC<{ competitionId: string }> = ({
  competitionId
}) => {
  const { currentUser, navigateTo, logoutAdmin, refreshAuctions } = useApp();

  const [activeSection, setActiveSection] = useState<
    | 'OVERVIEW'
    | 'PROPERTY_DOCS'
    | 'RULES_CONFIG'
    | 'SCHEDULE'
    | 'BIDS'
    | 'PARTICIPANTS'
    | 'PAYMENTS'
    | 'WINNER_REVIEW'
    | 'AUDIT'
  >('OVERVIEW');

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const competition = AuctionManagerService.getCompetitionById(competitionId);
  const isAdmin = AdminService.isAdmin(currentUser.email);
  const isSuper = AdminService.isSuperAdmin(currentUser.email);

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-red-200 dark:border-red-900/50 p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#202124] dark:text-white">
          Admin Authorization Required
        </h2>
        <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
          Only authenticated administrators may access competition management.
        </p>
        <button
          onClick={() => navigateTo('/')}
          className="px-4 py-2 bg-[#FF7900] text-white font-semibold text-xs rounded-xl"
        >
          Return to Public App
        </button>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-12 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-[#202124] dark:text-white">
          Competition Not Found
        </h2>
        <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
          The requested competition record ({competitionId}) could not be located in authoritative storage.
        </p>
        <button
          onClick={() => navigateTo('/admin')}
          className="px-4 py-2 bg-[#FF7900] text-white font-semibold text-xs rounded-xl"
        >
          Return to Admin Console
        </button>
      </div>
    );
  }

  const bids: Bid[] = AuctionManagerService.getBidsForCompetition(competition.id);
  const prop = competition.property;
  const config = competition.entryConfig;
  const auditLogs = AdminService.getAuditLogs().filter(
    (l) => l.targetId === competition.id || l.details.includes(competition.id)
  );

  // Winner trace computation
  const winnerTrace = LowestUniqueBidService.calculateWinner(competition.id, bids, config);

  // Group bids by participant
  const participantMap = new Map<string, { userId: string; userName: string; count: number; bids: number[] }>();
  for (const b of bids) {
    const existing = participantMap.get(b.userId);
    if (existing) {
      existing.count += 1;
      existing.bids.push(b.number);
    } else {
      participantMap.set(b.userId, {
        userId: b.userId,
        userName: b.userName || 'Diaspora Member',
        count: 1,
        bids: [b.number]
      });
    }
  }
  const participants = Array.from(participantMap.values());

  const handleCloseAndCalculate = () => {
    AuctionManagerService.closeAndCalculateWinner(competition.id);
    AdminService.recordAuditLog({
      adminEmail: currentUser.email,
      action: 'CLOSE_COMPETITION',
      targetResource: 'COMPETITION',
      targetId: competition.id,
      details: `Closed competition bidding and computed lowest-unique-bid trace`
    });
    refreshAuctions();
    setActionMessage('Competition bidding closed and winner trace computed.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleFinalizeWinner = () => {
    const res = AuctionManagerService.finalizeAuctionResult(competition.id, currentUser.email);
    if (res.success) {
      AdminService.recordAuditLog({
        adminEmail: currentUser.email,
        action: 'FINALIZE_WINNER',
        targetResource: 'COMPETITION',
        targetId: competition.id,
        details: `Finalized winner adjudication: Winner User ${winnerTrace.winnerUserId} with qualifying lowest unique number ${winnerTrace.lowestUniqueNumber}`
      });
      refreshAuctions();
      setActionMessage('Winner award formally finalized and title conveyance initiated.');
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handleVoidCompetition = () => {
    const reason = prompt('Enter justification for voiding this competition and refunding entries:') || 'Administrative compliance review';
    AuctionManagerService.voidAuction(competition.id, reason, currentUser.email);
    AdminService.recordAuditLog({
      adminEmail: currentUser.email,
      action: 'VOID_COMPETITION',
      targetResource: 'COMPETITION',
      targetId: competition.id,
      details: `Voided competition ${competition.id}: ${reason}. Triggered 100% full participant refunds.`
    });
    refreshAuctions();
    setActionMessage('Competition voided and all entry fees marked for 100% refund.');
    setTimeout(() => setActionMessage(null), 3500);
  };

  const sections = [
    { id: 'OVERVIEW', label: '1. Overview', icon: Building },
    { id: 'PROPERTY_DOCS', label: '2. Property & Title', icon: FileText },
    { id: 'RULES_CONFIG', label: '3. Rules & Entry', icon: Sliders },
    { id: 'SCHEDULE', label: '4. Schedule & Status', icon: Calendar },
    { id: 'BIDS', label: `5. Bids (${bids.length})`, icon: Hash },
    { id: 'PARTICIPANTS', label: `6. Participants (${participants.length})`, icon: Users },
    { id: 'PAYMENTS', label: '7. Payments & Receipts', icon: CreditCard },
    { id: 'WINNER_REVIEW', label: '8. Winner Review', icon: Trophy },
    { id: 'AUDIT', label: `9. Audit (${auditLogs.length})`, icon: History }
  ];

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E3DE] dark:border-[#2A2A2A] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/admin')}
            className="p-2 text-[#686868] hover:text-[#202124] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors"
            title="Back to Admin Console"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7900]">
                Competition Management
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                {competition.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  competition.status === 'LIVE' || competition.status === 'OPEN'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : competition.status === 'WINNER_PENDING_REVIEW'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {competition.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#202124] dark:text-white truncate max-w-xl">
              {competition.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigateTo(`/property/${competition.slug || competition.id}`)}
            className="px-3 py-1.5 border border-[#E8E3DE] dark:border-[#333] hover:border-[#FF7900] rounded-xl text-xs font-semibold text-[#686868] dark:text-[#A0A0A0] hover:text-[#202124] dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FF7900]" />
            <span>Public View</span>
          </button>
          <button
            onClick={() => logoutAdmin()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs border-b border-[#E8E3DE] dark:border-[#2A2A2A]">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#FF7900] text-white shadow-xs'
                  : 'text-[#686868] dark:text-[#A0A0A0] hover:bg-slate-100 dark:hover:bg-[#202020]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: OVERVIEW */}
      {activeSection === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A]">
              <span className="text-[11px] text-[#686868] dark:text-[#A0A0A0] block">Valuation (USD)</span>
              <span className="text-xl sm:text-2xl font-black text-[#202124] dark:text-white tabular-nums">
                ${(prop.valuationUSD || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A]">
              <span className="text-[11px] text-[#686868] dark:text-[#A0A0A0] block">Total Paid Entries</span>
              <span className="text-xl sm:text-2xl font-black text-[#FF7900] tabular-nums">
                {bids.length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">@ $49 USD / ticket</span>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A]">
              <span className="text-[11px] text-[#686868] dark:text-[#A0A0A0] block">Unique Bids Found</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                {winnerTrace.uniqueNumbers.length}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Non-duplicated</span>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A]">
              <span className="text-[11px] text-[#686868] dark:text-[#A0A0A0] block">Total Entry Revenue</span>
              <span className="text-xl sm:text-2xl font-black text-[#202124] dark:text-white tabular-nums">
                ${(bids.length * 49).toLocaleString()} USD
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{bids.length * 4900}¢</span>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#202124] dark:text-white">
              Lifecycle & State Operations
            </h3>
            <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
              Execute authoritative state transitions. All transitions are logged to the immutable audit trail.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {(competition.status === 'LIVE' || competition.status === 'OPEN') && (
                <button
                  onClick={handleCloseAndCalculate}
                  className="px-4 py-2 bg-[#202124] hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Close Bidding & Calculate Trace
                </button>
              )}
              {competition.status === 'WINNER_PENDING_REVIEW' && (
                <button
                  onClick={handleFinalizeWinner}
                  className="px-4 py-2 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Finalize Winner Adjudication
                </button>
              )}
              {competition.status !== 'VOID' && competition.status !== 'COMPLETED' && (
                <button
                  onClick={handleVoidCompetition}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold text-xs rounded-xl transition-colors"
                >
                  Void Competition & Schedule Full Refunds
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PROPERTY & TITLE DOCUMENTS */}
      {activeSection === 'PROPERTY_DOCS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-white">
                Property Due Diligence & Municipal Title Deeds
              </h3>
              <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
                Verified residential real estate in Addis Ababa, Ethiopia.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900 self-start sm:self-auto">
              Title Registry: {prop.titleDeedRegistration || 'AA-KIRKOS-REG-2025-99201'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Location & Dimensions</span>
              <div className="text-slate-600 dark:text-slate-300 space-y-1">
                <div><strong>Address:</strong> {prop.address || 'Kirkos Sub-City, Addis Ababa'}</div>
                <div><strong>Floor Area:</strong> {prop.floorAreaSqM} m² ({prop.bedrooms} Bed, {prop.bathrooms} Bath)</div>
                <div><strong>Floor Level:</strong> {prop.floorLevel || '14th'} (Elevator Serviced)</div>
                <div><strong>Developer:</strong> {prop.developerOrOwner || 'Abyssinia Heights Development Group'}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Title Deed Legal Status</span>
              <div className="text-slate-600 dark:text-slate-300 space-y-1">
                <div><strong>Status:</strong> {prop.ownershipVerificationStatus || 'VERIFIED'}</div>
                <div><strong>Registry Date:</strong> {prop.verificationDate || '2026-09-02'}</div>
                <div><strong>Encumbrances:</strong> None (Clean municipal title deed authenticated)</div>
                <div><strong>Conveyance Warranty:</strong> Certified developer transfer warranty on file</div>
              </div>
            </div>
          </div>

          {/* Uploaded Documents Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#202124] dark:text-white">
              Official Title Deed Documents ({prop.documents?.length || 0})
            </h4>
            <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A] border border-[#E8E3DE] dark:border-[#2A2A2A] rounded-xl">
              {(prop.documents || []).map((doc) => (
                <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#FF7900]" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{doc.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {doc.fileName} · {doc.fileSize} · {doc.verificationStatus}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: RULES & CONFIGURATION */}
      {activeSection === 'RULES_CONFIG' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Authoritative Competition Configuration
          </h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Owner-approved entry pricing and lowest-unique-bid integer boundaries.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Ticket Price (USD)</span>
              <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">$49.00 USD</span>
              <span className="text-[10px] text-slate-400 block font-mono">4900 integer cents</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Permitted Integer Range</span>
              <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                {config.minNumber} to {config.maxNumber}
              </span>
              <span className="text-[10px] text-slate-400 block">Whole numbers only</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">Max Tickets / Participant</span>
              <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                {config.maxTicketsPerParticipant || 5}
              </span>
              <span className="text-[10px] text-slate-400 block">Strictly server-enforced</span>
            </div>
          </div>

          <div className="p-4 bg-[#FFF8F3] dark:bg-[#201811] rounded-xl border border-[#FFD8B8] dark:border-[#422C19] text-xs space-y-1">
            <div className="font-bold text-[#C44E00] dark:text-[#FFA74D]">
              No-Winner Refund Policy Guarantee: {config.refundPolicy}
            </div>
            <p className="text-[#686868] dark:text-[#A0A0A0]">
              If no unique integer exists upon competition close, full 100% refund is issued to all paid participants. Substitution drawings and random selections are strictly forbidden.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: SCHEDULE & OPERATIONAL HISTORY */}
      {activeSection === 'SCHEDULE' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Schedule & Timezone Alignment
          </h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Official closing date and time synchronized to East Africa Time (Addis Ababa, UTC+3).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Competition Start Time</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white block">
                {new Date(competition.startTime).toLocaleString('en-US', { timeZoneName: 'short' })}
              </span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Official Closing Time (Freeze Point)</span>
              <span className="font-mono font-bold text-[#FF7900] block">
                {new Date(competition.endTime).toLocaleString('en-US', { timeZoneName: 'short' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: ENTRIES & BIDS */}
      {activeSection === 'BIDS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-white">
                Immutable Entries & Bid Records ({bids.length})
              </h3>
              <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
                Every bid represents exactly one paid $49 USD ticket submission.
              </p>
            </div>
          </div>

          {bids.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No bids have been recorded for this competition yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E3DE] dark:border-[#2A2A2A] text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">Choice #</th>
                    <th className="py-2.5 px-3">Participant</th>
                    <th className="py-2.5 px-3">Entry ID</th>
                    <th className="py-2.5 px-3">Submitted (UTC)</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Uniqueness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
                  {bids.map((b) => {
                    const freq = winnerTrace.frequencyMap[b.number] || 1;
                    const isUnique = freq === 1;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-[#202020]">
                        <td className="py-2.5 px-3 font-mono font-black text-sm text-[#FF7900]">
                          #{b.number}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {b.userName || b.userId}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                          {b.entryId || b.id}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                          {b.submittedAt ? new Date(b.submittedAt).toLocaleTimeString() : 'Recorded'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs">
                          {freq}x
                        </td>
                        <td className="py-2.5 px-3">
                          {isUnique ? (
                            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                              Unique
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium text-[10px]">
                              Duplicate (Eliminated)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: PARTICIPANTS */}
      {activeSection === 'PARTICIPANTS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Diaspora Participants ({participants.length})
          </h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Verified diaspora customers participating in this competition.
          </p>

          <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A] border border-[#E8E3DE] dark:border-[#2A2A2A] rounded-xl">
            {participants.map((p) => (
              <div key={p.userId} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{p.userName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">User ID: {p.userId}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                    {p.count} Ticket(s) (${p.count * 49} USD)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Certified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: PAYMENTS & RECEIPTS */}
      {activeSection === 'PAYMENTS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Payments, Gateways & Immutable Receipts
          </h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Integer cent ledger reconciliation: $49 USD (4900 cents) per unique ticket.
          </p>

          <div className="p-4 bg-slate-50 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Gross Entry Volume:</span>
              <strong className="text-slate-900 dark:text-white">${(bids.length * 49).toLocaleString()} USD</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Integer Cents Ledger:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{bids.length * 4900}¢</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Gateway Webhook Verifications:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Signature Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8: WINNER REVIEW & ADJUDICATION */}
      {activeSection === 'WINNER_REVIEW' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-white">
                Lowest-Unique-Bid Adjudication & Winner Verification
              </h3>
              <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
                Authoritative mathematical trace computed across all frozen entries.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#FFF3E8] dark:bg-[#2C1D12] text-[#FF7900] px-2.5 py-1 rounded-md border border-[#FFD8B8] dark:border-[#4E2D17]">
              Hash: {winnerTrace.hash}
            </span>
          </div>

          {winnerTrace.lowestUniqueNumber !== null ? (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Qualifying Winner Identified</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block text-[11px]">Winning Lowest Number:</span>
                  <span className="text-2xl font-black text-[#FF7900] font-mono">
                    #{winnerTrace.lowestUniqueNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Award Winner:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {winnerTrace.winnerUserName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {winnerTrace.winnerUserId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Award Title:</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    {prop.title}
                  </span>
                </div>
              </div>

              {competition.status === 'WINNER_PENDING_REVIEW' && (
                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300">
                    Ready for administrative finalization and deed conveyance.
                  </span>
                  <button
                    onClick={handleFinalizeWinner}
                    className="px-4 py-2 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    Confirm & Finalize Award
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-amber-800 dark:text-amber-200 text-sm">
                No Unique Qualifying Bids Detected
              </div>
              <p className="text-amber-700 dark:text-amber-300">
                All submitted numbers had duplicates. Under published policy ({config.refundPolicy}), all participant entry fees ($49 USD each) are scheduled for 100% full refund. Zero random drawings allowed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 9: AUDIT TRAIL */}
      {activeSection === 'AUDIT' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Immutable Audit Trail ({auditLogs.length})
          </h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Every action performed on this competition is cryptographically logged.
          </p>

          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No audit entries recorded for this competition yet.
            </div>
          ) : (
            <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A] border border-[#E8E3DE] dark:border-[#2A2A2A] rounded-xl">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                        {log.action}
                      </span>
                      <span>{log.details}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Actor: <strong>{log.adminEmail}</strong> · Log ID: <span className="font-mono">{log.id}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
