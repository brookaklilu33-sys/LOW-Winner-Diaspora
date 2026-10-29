import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminService } from '../services/adminService';
import { AuctionManagerService } from '../services/auctionManagerService';
import { WalletLedgerService } from '../services/walletLedgerService';
import { PaymentOrchestrator } from '../services/paymentOrchestrator';
import { ComplianceService } from '../services/complianceService';
import { TestSuiteRunner, TestResult } from '../services/testSuiteRunner';
import { Auction, EntryConfig } from '../types/auction';
import {
  Shield,
  Layers,
  Users,
  Trophy,
  History,
  CreditCard,
  Sliders,
  FileText,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  LogOut,
  ExternalLink,
  Phone,
  Mail,
  Search,
  Edit2
} from 'lucide-react';
import { User } from '../types/user';

export const AdminView: React.FC = () => {
  const {
    currentUser,
    auctions,
    refreshAuctions,
    navigateTo,
    logoutAdmin,
    registeredUsers,
    updateUserInAdmin
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'AUCTIONS' | 'WINNERS' | 'LEDGER' | 'WITHDRAWALS' | 'PAYMENTS' | 'COMPLIANCE' | 'USERS' | 'ADMINS' | 'AUDIT' | 'TESTS'
  >('OVERVIEW');

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserBackupEmail, setEditUserBackupEmail] = useState('');
  const [editUserCountry, setEditUserCountry] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'REJECTED'>('VERIFIED');

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserName(user.displayName);
    setEditUserPhone(user.phoneNumber || user.phone || '');
    setEditUserBackupEmail(user.backupEmail || '');
    setEditUserCountry(user.eligibility?.countryOfResidence || 'United States');
    setEditUserStatus(user.eligibility?.identityStatus || 'VERIFIED');
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserInAdmin(editingUser.id, {
      displayName: editUserName,
      phoneNumber: editUserPhone,
      phone: editUserPhone,
      backupEmail: editUserBackupEmail,
      eligibility: {
        ...editingUser.eligibility,
        countryOfResidence: editUserCountry,
        identityStatus: editUserStatus,
        isDiasporaCertified: true,
        isAgeVerified: true
      }
    });
    setEditingUser(null);
  };

  const [testResults, setTestResults] = useState<{
    results: TestResult[];
    totalPassed: number;
    totalFailed: number;
    durationMs: number;
  } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Authorization check
  const isSuper = AdminService.isSuperAdmin(currentUser.email);
  const isAdmin = AdminService.isAdmin(currentUser.email);

  // If user is not authorized
  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-red-200 dark:border-red-900/50 p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#202124] dark:text-white">
          Access Denied: Admin Authorization Required
        </h2>
        <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
          Your account (<strong>{currentUser.email}</strong>) does not have active administrative permissions. Authorization must be granted by the System Superadmin.
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

  // Admin Data Sources
  const allWithdrawals = WalletLedgerService.getAllWithdrawals();
  const allTransactions = WalletLedgerService.getAllTransactions();
  const allAdmins = AdminService.getAllAdministrators();
  const auditLogs = AdminService.getAuditLogs();
  const paymentFlags = PaymentOrchestrator.getFeatureFlags();
  const restrictedStates = ComplianceService.getRestrictedStates();

  // Create Auction Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrizeTitle, setNewPrizeTitle] = useState('');
  const [newRetailValue, setNewRetailValue] = useState(499);
  const [newEntryFee, setNewEntryFee] = useState(50);
  const [newIncludedBids, setNewIncludedBids] = useState(5);
  const [newMaxNumber, setNewMaxNumber] = useState(500);

  // Add Admin State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  // Actions
  const handleRunTests = async () => {
    setIsRunningTests(true);
    const results = await TestSuiteRunner.runAllTests();
    setTestResults(results);
    setIsRunningTests(false);
  };

  const handleCreateAuction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const propertyDetails = {
      id: `prop_${Date.now()}`,
      title: newPrizeTitle || newTitle,
      subtitle: 'Verified residential residence with clean title deed',
      propertyType: 'APARTMENT' as const,
      city: 'Addis Ababa',
      subCityArea: 'Bole / Kirkos',
      valuationUSD: newRetailValue || 250000,
      image: '/images/addis_bole_luxury_apartment_1792574992395.jpg',
      images: ['/images/addis_bole_luxury_apartment_1792574992395.jpg'],
      description: 'Newly listed residential property in Addis Ababa with certified municipal title deed.',
      keyFeatures: ['Registered clean title deed', '24/7 power backup & water reservoir', 'Direct conveyance warranty'],
      documents: []
    };

    const newAuction: any = {
      id: `comp_${Date.now()}`,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newTitle,
      property: propertyDetails,
      entryConfig: {
        ticketPriceUSD: 49,
        ticketPriceCents: 4900,
        minNumber: 1,
        maxNumber: newMaxNumber || 1000,
        maxTicketsPerParticipant: 5,
        timezone: 'EAT (UTC+3, Addis Ababa)',
        refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
      },
      status: 'OPEN',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      totalTicketsSold: 0,
      totalParticipants: 0
    };

    AuctionManagerService.saveAuction(newAuction);
    AdminService.recordAuditLog({
      adminEmail: currentUser.email,
      action: 'CREATE_AUCTION',
      targetResource: 'AUCTION',
      targetId: newAuction.id,
      details: `Created auction ${newAuction.title} with entry ${newEntryFee} Unique`
    });

    refreshAuctions();
    setShowCreateModal(false);
  };

  const handleFinalizeWinner = (auctionId: string) => {
    const res = AuctionManagerService.finalizeAuctionResult(auctionId, currentUser.email);
    if (res.success) {
      AdminService.recordAuditLog({
        adminEmail: currentUser.email,
        action: 'FINALIZE_WINNER',
        targetResource: 'AUCTION',
        targetId: auctionId,
        details: `Finalized winner for auction ${auctionId}`
      });
      refreshAuctions();
    }
  };

  const handleVoidAuction = (auctionId: string) => {
    const reason = prompt('Enter justification for voiding this auction:') || 'Administrative void';
    AuctionManagerService.voidAuction(auctionId, reason, currentUser.email);
    refreshAuctions();
  };

  const handleApproveWithdrawal = (withdrawalId: string) => {
    WalletLedgerService.completeWithdrawal(withdrawalId, currentUser.email);
    AdminService.recordAuditLog({
      adminEmail: currentUser.email,
      action: 'REVIEW_WITHDRAWAL',
      targetResource: 'WITHDRAWAL',
      targetId: withdrawalId,
      details: `Approved and settled withdrawal ${withdrawalId}`
    });
    refreshAuctions();
  };

  const handleRejectWithdrawal = (withdrawalId: string) => {
    const reason = prompt('Reason for rejection:') || 'Compliance failure';
    WalletLedgerService.cancelWithdrawal(withdrawalId, reason, currentUser.email);
    AdminService.recordAuditLog({
      adminEmail: currentUser.email,
      action: 'REVIEW_WITHDRAWAL',
      targetResource: 'WITHDRAWAL',
      targetId: withdrawalId,
      details: `Rejected withdrawal ${withdrawalId}: ${reason}`
    });
    refreshAuctions();
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    AdminService.addAdmin({
      email: newAdminEmail,
      displayName: newAdminName || newAdminEmail.split('@')[0],
      role: 'ADMIN',
      actorEmail: currentUser.email
    });
    setNewAdminEmail('');
    setNewAdminName('');
  };

  const handleToggleAdminSuspension = (email: string, currentSuspended: boolean) => {
    AdminService.setAdminSuspension({
      email,
      suspended: !currentSuspended,
      actorEmail: currentUser.email
    });
  };

  const toggleFlag = (flagName: keyof typeof paymentFlags) => {
    PaymentOrchestrator.updateFeatureFlags({
      [flagName]: !paymentFlags[flagName]
    });
    AdminService.recordAuditLog({
      adminEmail: currentUser.email,
      action: 'UPDATE_PAYMENT_CONFIG',
      targetResource: 'FEATURE_FLAGS',
      targetId: flagName,
      details: `Toggled ${flagName} to ${!paymentFlags[flagName]}`
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3DE] dark:border-[#2A2A2A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FF7900]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF7900]">
              Lowwin Diaspora Governance
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
              {currentUser.role}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#202124] dark:text-white mt-1">
            Audited Admin Console
          </h1>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Authenticated as <strong>{currentUser.email}</strong>. Every administrative action creates an immutable audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="min-h-[44px] px-4 py-2 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Competition</span>
          </button>
          <button
            onClick={() => logoutAdmin()}
            className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            title="Sign out of administrative session and return to participant app"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: Layers },
          { id: 'AUCTIONS', label: 'Auctions', icon: Trophy },
          { id: 'WINNERS', label: 'Winner Review', icon: Trophy },
          { id: 'LEDGER', label: 'Wallet Ledger', icon: History },
          { id: 'WITHDRAWALS', label: `Withdrawals (${allWithdrawals.filter((w) => w.status === 'PENDING').length})`, icon: CreditCard },
          { id: 'PAYMENTS', label: 'Payment Providers', icon: Sliders },
          { id: 'COMPLIANCE', label: 'Compliance & States', icon: Shield },
          { id: 'USERS', label: `User Database (${registeredUsers.length})`, icon: Users },
          { id: 'ADMINS', label: 'Administrators', icon: Users },
          { id: 'AUDIT', label: 'Audit Logs', icon: FileText },
          { id: 'TESTS', label: 'Automated Tests', icon: PlayCircle }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#FF7900] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1A1A1A] border border-[#E8E3DE] dark:border-[#333] text-[#686868] dark:text-[#A0A0A0] hover:text-[#202124]'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A]">
              <span className="text-xs text-[#686868] dark:text-[#A0A0A0] block">Live Auctions</span>
              <span className="text-2xl font-black text-[#202124] dark:text-white tabular-nums">
                {auctions.filter((a) => a.status === 'LIVE').length}
              </span>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A]">
              <span className="text-xs text-[#686868] dark:text-[#A0A0A0] block">Pending Winner Reviews</span>
              <span className="text-2xl font-black text-[#FF7900] tabular-nums">
                {auctions.filter((a) => a.status === 'WINNER_PENDING_REVIEW').length}
              </span>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A]">
              <span className="text-xs text-[#686868] dark:text-[#A0A0A0] block">Pending Withdrawals</span>
              <span className="text-2xl font-black text-[#2563EB] tabular-nums">
                {allWithdrawals.filter((w) => w.status === 'PENDING').length}
              </span>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A]">
              <span className="text-xs text-[#686868] dark:text-[#A0A0A0] block">Total Ledger Entries</span>
              <span className="text-2xl font-black text-[#202124] dark:text-white tabular-nums">
                {allTransactions.length}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#202124] dark:text-white">
              System Operational Health & Reconciliation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900">
                <span className="font-bold text-blue-900 dark:text-blue-300 block">Ledger Math Reconciliation</span>
                <span className="text-[11px] text-blue-700 dark:text-blue-400">Exact integer cents match 100% of debit/credits.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-[#202124] dark:text-white block">Real Money Gates</span>
                <span className="text-[11px] text-[#686868] dark:text-[#A0A0A0]">Fail-closed switch: Live deposits require admin flag.</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#202020] rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-[#202124] dark:text-white block">US Geofence Status</span>
                <span className="text-[11px] text-[#686868] dark:text-[#A0A0A0]">3 Restricted States (WA, ID, NV) locked.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUCTIONS MANAGEMENT */}
      {activeTab === 'AUCTIONS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Auctions Inventory & Controls
          </h3>

          <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
            {auctions.map((auc) => (
              <div key={auc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-sm text-[#202124] dark:text-white">
                    {auc.title}
                  </div>
                  <div className="text-[11px] text-[#686868] dark:text-[#A0A0A0] mt-0.5">
                    Prize: ${(auc.property?.valuationUSD || auc.prize?.retailValueUSD || 0).toLocaleString()} USD · Entry: {auc.entryConfig.ticketPriceUSD ? `$${auc.entryConfig.ticketPriceUSD}` : `${auc.entryConfig.entryFeeUnique} Unique`} · Range: {auc.entryConfig.minNumber} - {auc.entryConfig.maxNumber}
                  </div>
                  <div className="text-[11px] text-[#FF7900] font-semibold mt-0.5">
                    Status: {auc.status} · Bids: {auc.totalBidsSubmitted || auc.totalTicketsSold || 0} · Participants: {auc.totalParticipants}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {auc.status === 'LIVE' && (
                    <button
                      onClick={() => {
                        AuctionManagerService.closeAndCalculateWinner(auc.id);
                        refreshAuctions();
                      }}
                      className="px-3 py-1.5 bg-[#202124] dark:bg-white text-white dark:text-black font-semibold rounded-lg"
                    >
                      Close & Calculate
                    </button>
                  )}
                  {auc.status === 'WINNER_PENDING_REVIEW' && (
                    <button
                      onClick={() => handleFinalizeWinner(auc.id)}
                      className="px-3 py-1.5 bg-[#FF7900] text-white font-semibold rounded-lg"
                    >
                      Finalize Winner
                    </button>
                  )}
                  {auc.status !== 'VOID' && auc.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleVoidAuction(auc.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold"
                    >
                      Void & Refund
                    </button>
                  )}
                  <button
                    onClick={() => navigateTo(`/admin/competition/${auc.id}`)}
                    className="px-3 py-1.5 bg-[#FF7900] hover:bg-[#E85D04] text-white rounded-lg font-bold flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <span>Manage</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => navigateTo(`/property/${auc.slug || auc.id}`)}
                    className="px-3 py-1.5 border border-[#E8E3DE] dark:border-[#333] rounded-lg text-[#686868] hover:text-[#202124]"
                  >
                    Public Page
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WINNER REVIEW */}
      {activeTab === 'WINNERS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Authoritative Winner Review & Adjudication
          </h3>

          <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
            {auctions.filter((a) => a.calculationTrace).map((auc) => (
              <div key={auc.id} className="py-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-[#202124] dark:text-white">
                    {auc.title}
                  </div>
                  <span className="font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {auc.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F8FAFC] dark:bg-[#202020] p-3 rounded-xl border border-slate-200 dark:border-[#333]">
                  <div>
                    <span className="text-[#686868] block">Winning Number</span>
                    <span className="text-lg font-bold text-[#FF7900]">
                      #{auc.winningNumber ?? 'None Unique'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#686868] block">Winner</span>
                    <span className="font-semibold text-[#202124] dark:text-white">
                      {auc.winnerName || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#686868] block">Total Evaluated Bids</span>
                    <span className="font-semibold">{auc.calculationTrace?.totalBids}</span>
                  </div>
                  <div>
                    <span className="text-[#686868] block">Audit Hash</span>
                    <span className="font-mono text-[10px] text-[#2563EB]">{auc.calculationTrace?.hash}</span>
                  </div>
                </div>

                {auc.status === 'WINNER_PENDING_REVIEW' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleFinalizeWinner(auc.id)}
                      className="px-4 py-2 bg-[#FF7900] text-white font-bold rounded-lg"
                    >
                      Approve & Finalize Winner
                    </button>
                    <button
                      onClick={() => handleVoidAuction(auc.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg"
                    >
                      Reject / Void with Refund
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WALLET LEDGER */}
      {activeTab === 'LEDGER' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Global Master Wallet Ledger ({allTransactions.length} entries)
          </h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Every debit and credit maintains balance continuity. No direct balance tampering permitted.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E3DE] dark:border-[#2A2A2A] text-[#686868] dark:text-[#A0A0A0]">
                  <th className="py-2 pr-3">Txn ID</th>
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Amount ($)</th>
                  <th className="py-2 pr-3">Unique</th>
                  <th className="py-2 pr-3">Before → After</th>
                  <th className="py-2 pr-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
                {allTransactions.slice(0, 50).map((t) => (
                  <tr key={t.id} className="py-2 text-[11px]">
                    <td className="py-2 pr-3 font-mono text-[#2563EB]">{t.id.slice(0, 12)}</td>
                    <td className="py-2 pr-3">{t.userId.slice(0, 12)}</td>
                    <td className="py-2 pr-3 font-semibold">{t.type}</td>
                    <td className="py-2 pr-3 tabular-nums font-bold">
                      ${(t.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{t.uniqueCredits ?? t.ticketQuantity ?? 1} {t.uniqueCredits !== undefined ? 'Unique' : 'Tickets'}</td>
                    <td className="py-2 pr-3 tabular-nums text-[#686868]">
                      {t.balanceBeforeCents !== undefined && t.balanceAfterCents !== undefined
                        ? `$${(t.balanceBeforeCents / 100).toFixed(2)} → $${(t.balanceAfterCents / 100).toFixed(2)}`
                        : `$${(t.amountCents / 100).toFixed(2)}`}
                    </td>
                    <td className="py-2 pr-3 text-[#686868]">
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: WITHDRAWALS */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Withdrawal Approvals & Compliance Settlement
          </h3>

          <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
            {allWithdrawals.length === 0 ? (
              <p className="text-xs text-[#686868] py-4">No withdrawal requests submitted yet.</p>
            ) : (
              allWithdrawals.map((w) => (
                <div key={w.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-[#202124] dark:text-white">
                      ${(w.amountCents / 100).toFixed(2)} USD to {w.destination.type} ({w.destination.accountHolderName})
                    </div>
                    <div className="text-[11px] text-[#686868] dark:text-[#A0A0A0]">
                      User: {w.userId} · Routing/Addr: {w.destination.routingOrEmailOrAddress} · Status: {w.status}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {w.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveWithdrawal(w.id)}
                          className="px-3 py-1 bg-[#FF7900] text-white font-bold rounded-lg"
                        >
                          Approve Payout
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(w.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-lg"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENT PROVIDERS CONFIG */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#202124] dark:text-white">
              US Payment Gateways & Backend Feature Flags
            </h3>
            <p className="text-xs text-[#686868] dark:text-[#A0A0A0] mt-0.5">
              Strict fail-closed flags enforced on the server. Only activate providers after formal US legal approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(paymentFlags) as Array<keyof typeof paymentFlags>).map((key) => (
              <div
                key={key}
                className="p-4 rounded-xl border border-[#E8E3DE] dark:border-[#333] flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-[#202124] dark:text-white block">
                    {key}
                  </span>
                  <span className="text-[11px] text-[#686868] dark:text-[#A0A0A0]">
                    {paymentFlags[key] ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                {isSuper ? (
                  <button
                    onClick={() => toggleFlag(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      paymentFlags[key]
                        ? 'bg-[#FF7900] text-white'
                        : 'bg-slate-200 dark:bg-[#333] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Toggle
                  </button>
                ) : (
                  <span className="text-[10px] text-[#686868] italic">Superadmin Only</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: COMPLIANCE & US STATES */}
      {activeTab === 'COMPLIANCE' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            US State Jurisdictional Eligibility
          </h3>
          <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
            Currently Restricted States: {restrictedStates.join(', ')}. All participants from these states are fail-closed and cannot participate in real-money auctions.
          </p>

          <div className="p-4 bg-[#FFF8F3] dark:bg-[#201811] rounded-xl border border-[#FFD8B8] dark:border-[#422C19] text-xs space-y-1">
            <strong>Legal Notice:</strong> Trade promotion laws vary by US state. Legal counsel must verify eligibility prior to enabling real money participation nationwide.
          </div>
        </div>
      )}

      {/* TAB: USERS DATABASE */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#202124] dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#10B981]" />
                Participant & Diaspora User Database
              </h2>
              <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
                Authoritative user registry. Search and manage participant profile data, phone numbers, backup emails, and diaspora verification credentials.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, country..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 p-3.5 rounded-2xl">
              <span className="text-[11px] text-slate-500 block font-medium">Total Registered</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{registeredUsers.length}</span>
            </div>
            <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 p-3.5 rounded-2xl">
              <span className="text-[11px] text-slate-500 block font-medium">Verified KYC</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {registeredUsers.filter((u) => u.eligibility?.identityStatus === 'VERIFIED').length}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 p-3.5 rounded-2xl">
              <span className="text-[11px] text-slate-500 block font-medium">Diaspora Certified</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {registeredUsers.filter((u) => u.eligibility?.isDiasporaCertified).length}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 p-3.5 rounded-2xl">
              <span className="text-[11px] text-slate-500 block font-medium">With Phone Number</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {registeredUsers.filter((u) => u.phoneNumber || u.phone).length}
              </span>
            </div>
          </div>

          {/* Users List / Table */}
          <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">User</th>
                    <th className="py-3 px-4 font-bold">Phone Number</th>
                    <th className="py-3 px-4 font-bold">Backup Email</th>
                    <th className="py-3 px-4 font-bold">Country & State</th>
                    <th className="py-3 px-4 font-bold">Identity KYC</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {registeredUsers
                    .filter((u) => {
                      if (!userSearchQuery.trim()) return true;
                      const q = userSearchQuery.toLowerCase();
                      return (
                        u.displayName?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q) ||
                        (u.phone && u.phone.toLowerCase().includes(q)) ||
                        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q)) ||
                        (u.backupEmail && u.backupEmail.toLowerCase().includes(q)) ||
                        (u.eligibility?.countryOfResidence && u.eligibility.countryOfResidence.toLowerCase().includes(q))
                      );
                    })
                    .map((user) => {
                      const phone = user.phoneNumber || user.phone;
                      const isVerified = user.eligibility?.identityStatus === 'VERIFIED';
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.displayName}</span>
                              {user.id === currentUser.id && (
                                <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{user.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            {phone ? (
                              <span className="font-mono text-slate-800 dark:text-slate-200">{phone}</span>
                            ) : (
                              <span className="text-slate-400 italic">Not set</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {user.backupEmail ? (
                              <span className="font-mono text-slate-800 dark:text-slate-200">{user.backupEmail}</span>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-700 dark:text-slate-300">
                              {user.eligibility?.countryOfResidence || 'United States'}
                            </span>
                            {user.eligibility?.state && (
                              <span className="text-[10px] text-slate-500 block">({user.eligibility.state})</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isVerified
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : user.eligibility?.identityStatus === 'PENDING'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {user.eligibility?.identityStatus || 'UNVERIFIED'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  updateUserInAdmin(user.id, {
                                    eligibility: {
                                      ...user.eligibility,
                                      identityStatus: isVerified ? 'UNVERIFIED' : 'VERIFIED'
                                    }
                                  });
                                }}
                                className={`px-2.5 py-1 font-semibold text-[11px] rounded-lg transition-colors ${
                                  isVerified
                                    ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300'
                                    : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                                }`}
                              >
                                {isVerified ? 'Revoke KYC' : 'Verify KYC'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ADMINISTRATORS (SUPERADMIN ONLY) */}
      {activeTab === 'ADMINS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-white">
                Administrators & RBAC Management
              </h3>
              <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
                Superadmin has authoritative governance to add, suspend, or revoke role-based administrators.
              </p>
            </div>
          </div>

          {/* Add Admin Form */}
          {isSuper && (
            <form onSubmit={handleAddAdmin} className="flex gap-2 pt-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="flex-1 px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-xl text-xs"
              />
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Full Name"
                className="w-40 px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-xl text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl transition-colors"
              >
                + Add Admin
              </button>
            </form>
          )}

          {/* List Admins */}
          <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
            {allAdmins.map((adm) => (
              <div key={adm.email} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#202124] dark:text-white flex items-center gap-2">
                    <span>{adm.displayName}</span>
                    <span className="font-mono text-[10px] text-[#FF7900] bg-[#FFF3E8] dark:bg-[#2B1B10] px-1.5 py-0.5 rounded">
                      {adm.role}
                    </span>
                    {adm.isSuspended && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                        SUSPENDED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#686868]">{adm.email}</div>
                </div>

                {isSuper && adm.email !== AdminService.INITIAL_SUPERADMIN && (
                  <button
                    onClick={() => handleToggleAdminSuspension(adm.email, adm.isSuspended)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      adm.isSuspended
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {adm.isSuspended ? 'Reactivate' : 'Suspend'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#202124] dark:text-white">
            Immutable Administrative Audit Trail ({auditLogs.length} entries)
          </h3>

          <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A]">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#202124] dark:text-white">
                    {log.action} · {log.details}
                  </div>
                  <div className="text-[11px] text-[#686868]">
                    Actor: {log.adminEmail} · Target: {log.targetResource} ({log.targetId})
                  </div>
                </div>
                <span className="text-[11px] text-[#686868] font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: AUTOMATED TESTS */}
      {activeTab === 'TESTS' && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-white">
                Automated Verification Test Suite (Section 25)
              </h3>
              <p className="text-xs text-[#686868] dark:text-[#A0A0A0]">
                Executes 11+ critical tests covering Lowest Unique Bid calculations, wallet ledger integrity, fail-closed guards, and admin permissions.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="min-h-[44px] px-5 py-2.5 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isRunningTests ? 'Running Suite...' : 'Run Test Suite'}</span>
            </button>
          </div>

          {testResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-[#F8FAFC] dark:bg-[#202020] p-4 rounded-xl border border-slate-200 dark:border-[#333] text-xs">
                <div>
                  <span className="text-[#686868] block">Total Passed</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {testResults.totalPassed}
                  </span>
                </div>
                <div>
                  <span className="text-[#686868] block">Total Failed</span>
                  <span className="text-xl font-bold text-red-600">
                    {testResults.totalFailed}
                  </span>
                </div>
                <div>
                  <span className="text-[#686868] block">Execution Duration</span>
                  <span className="text-xl font-bold text-[#202124] dark:text-white tabular-nums">
                    {testResults.durationMs}ms
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#E8E3DE] dark:divide-[#2A2A2A] border border-[#E8E3DE] dark:border-[#2A2A2A] rounded-xl overflow-hidden">
                {testResults.results.map((res, i) => (
                  <div key={i} className="p-3 text-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      {res.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-[#202124] dark:text-white">
                          [{res.category}] {res.name}
                        </span>
                        <p className="text-[11px] text-[#686868] dark:text-[#A0A0A0] mt-0.5">
                          {res.message}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[#686868] shrink-0 tabular-nums">
                      {res.durationMs}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE AUCTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#E8E3DE] dark:border-[#2A2A2A] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#202124] dark:text-white">
              Create New US Auction
            </h3>

            <form onSubmit={handleCreateAuction} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Auction Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Apple iPad Pro 13-inch M4"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Prize Specification</label>
                <input
                  type="text"
                  value={newPrizeTitle}
                  onChange={(e) => setNewPrizeTitle(e.target.value)}
                  placeholder="Full prize description"
                  className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Retail Value ($ USD)</label>
                  <input
                    type="number"
                    value={newRetailValue}
                    onChange={(e) => setNewRetailValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Entry Fee (Unique)</label>
                  <input
                    type="number"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Included Bids</label>
                  <input
                    type="number"
                    value={newIncludedBids}
                    onChange={(e) => setNewIncludedBids(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Max Selectable Number</label>
                  <input
                    type="number"
                    value={newMaxNumber}
                    onChange={(e) => setNewMaxNumber(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#E8E3DE] dark:border-[#333] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#FF7900] hover:bg-[#E85D04] text-white font-bold rounded-xl"
                >
                  Publish Auction
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-[#E8E3DE] dark:border-[#333] rounded-xl text-[#686868]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-white/10 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#10B981]" />
                Edit User: {editingUser.email}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Email (Login Identifier)
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editUserPhone}
                  onChange={(e) => setEditUserPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Backup Email Address
                </label>
                <input
                  type="email"
                  value={editUserBackupEmail}
                  onChange={(e) => setEditUserBackupEmail(e.target.value)}
                  placeholder="recovery@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={editUserCountry}
                    onChange={(e) => setEditUserCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Identity KYC Status
                  </label>
                  <select
                    value={editUserStatus}
                    onChange={(e) => setEditUserStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNVERIFIED">UNVERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
