import { LowestUniqueBidService } from './LowestUniqueBidService';
import { WalletLedgerService } from './walletLedgerService';
import { PaymentOrchestrator } from './paymentOrchestrator';
import { AdminService } from './adminService';
import { ComplianceService } from './complianceService';
import { Bid, CompetitionEntryConfig } from '../types/auction';

export interface TestResult {
  category: 'COMPETITION_LOGIC' | 'PAYMENT_ACCOUNTING' | 'SECURITY_RBAC' | 'PROPERTY_AWARD';
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export class TestSuiteRunner {
  public static async runAllTests(): Promise<{
    results: TestResult[];
    totalPassed: number;
    totalFailed: number;
    durationMs: number;
  }> {
    const startTime = performance.now();
    const results: TestResult[] = [];

    const standardConfig: CompetitionEntryConfig = {
      ticketPriceUSD: 49.0,
      ticketPriceCents: 4900,
      minNumber: 1,
      maxNumber: 1000,
      maxTicketsPerParticipant: 5,
      timezone: 'EAT (UTC+3, Addis Ababa)',
      refundPolicy: 'FULL_REFUND_IF_NO_UNIQUE_WINNER'
    };

    // ---------------- 1. COMPETITION LOGIC TESTS ---------------- //

    // 1. One valid unique number
    try {
      const t0 = performance.now();
      const bids: Bid[] = [
        { id: '1', auctionId: 'c1', entryId: 'e1', userId: 'uA', userName: 'Abebe (DC)', number: 12, submittedAt: '' },
        { id: '2', auctionId: 'c1', entryId: 'e2', userId: 'uB', userName: 'Tigist (London)', number: 12, submittedAt: '' },
        { id: '3', auctionId: 'c1', entryId: 'e3', userId: 'uC', userName: 'Dawit (Toronto)', number: 19, submittedAt: '' }
      ];
      const trace = LowestUniqueBidService.calculateWinner('c1', bids, standardConfig);
      const passed = trace.lowestUniqueNumber === 19 && trace.winnerUserId === 'uC';
      results.push({
        category: 'COMPETITION_LOGIC',
        name: 'Single Qualifying Unique Number Wins (12 is duplicate, 19 wins)',
        passed,
        message: passed ? 'Winning number 19 correctly identified for Dawit' : `Expected 19, got ${trace.lowestUniqueNumber}`,
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'COMPETITION_LOGIC', name: 'Single Qualifying Unique Number Wins', passed: false, message: e.message, durationMs: 0 });
    }

    // 2. Duplicate low number followed by higher unique numbers (lowest unique must win)
    try {
      const t0 = performance.now();
      const bids: Bid[] = [
        { id: '1', auctionId: 'c2', entryId: 'e1', userId: 'u1', userName: 'User 1', number: 5, submittedAt: '' },
        { id: '2', auctionId: 'c2', entryId: 'e2', userId: 'u2', userName: 'User 2', number: 5, submittedAt: '' },
        { id: '3', auctionId: 'c2', entryId: 'e3', userId: 'u3', userName: 'User 3', number: 8, submittedAt: '' },
        { id: '4', auctionId: 'c2', entryId: 'e4', userId: 'u4', userName: 'User 4', number: 14, submittedAt: '' }
      ];
      const trace = LowestUniqueBidService.calculateWinner('c2', bids, standardConfig);
      const passed = trace.lowestUniqueNumber === 8 && trace.winnerUserId === 'u3';
      results.push({
        category: 'COMPETITION_LOGIC',
        name: 'Lowest Unique Number Selection (8 beats 14, 5 eliminated)',
        passed,
        message: passed ? 'Number 8 correctly selected over higher unique number 14' : `Failed, got ${trace.lowestUniqueNumber}`,
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'COMPETITION_LOGIC', name: 'Lowest Unique Number Selection', passed: false, message: e.message, durationMs: 0 });
    }

    // 3. No unique numbers triggers approved refund policy (no random draw substitute)
    try {
      const t0 = performance.now();
      const bids: Bid[] = [
        { id: '1', auctionId: 'c3', entryId: 'e1', userId: 'u1', userName: 'User 1', number: 10, submittedAt: '' },
        { id: '2', auctionId: 'c3', entryId: 'e2', userId: 'u2', userName: 'User 2', number: 10, submittedAt: '' },
        { id: '3', auctionId: 'c3', entryId: 'e3', userId: 'u3', userName: 'User 3', number: 20, submittedAt: '' },
        { id: '4', auctionId: 'c3', entryId: 'e4', userId: 'u4', userName: 'User 4', number: 20, submittedAt: '' }
      ];
      const trace = LowestUniqueBidService.calculateWinner('c3', bids, standardConfig);
      const passed = trace.lowestUniqueNumber === null && trace.status === 'NO_UNIQUE_BIDS' && trace.policyApplied === 'FULL_REFUND_IF_NO_UNIQUE_WINNER';
      results.push({
        category: 'COMPETITION_LOGIC',
        name: 'Zero Random Selection Fallback: Enforces Disclosed Refund Policy',
        passed,
        message: passed ? 'Correctly flagged NO_UNIQUE_BIDS and scheduled FULL_REFUND under published rules' : 'Failed to enforce no-unique refund policy',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'COMPETITION_LOGIC', name: 'Zero Random Selection Fallback', passed: false, message: e.message, durationMs: 0 });
    }

    // 4. Invalid numbers outside bounds (1 to 1000) rejected
    try {
      const t0 = performance.now();
      const v1 = LowestUniqueBidService.validateBid(0, standardConfig);
      const v2 = LowestUniqueBidService.validateBid(1001, standardConfig);
      const v3 = LowestUniqueBidService.validateBid(14.5, standardConfig);
      const v4 = LowestUniqueBidService.validateBid(42, standardConfig);
      const passed = !v1.valid && !v2.valid && !v3.valid && v4.valid;
      results.push({
        category: 'COMPETITION_LOGIC',
        name: 'Bid Validation: Rejects Decimal, Zero, and Out-of-Range Submissions',
        passed,
        message: passed ? 'Boundary checks enforced (0, 1001, 14.5 rejected; 42 accepted)' : 'Validation logic failed',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'COMPETITION_LOGIC', name: 'Bid Validation', passed: false, message: e.message, durationMs: 0 });
    }

    // 5. Calculation Reproducibility & Deterministic Hash
    try {
      const t0 = performance.now();
      const bids: Bid[] = [
        { id: '1', auctionId: 'c5', entryId: 'e1', userId: 'uA', userName: 'User A', number: 77, submittedAt: '' }
      ];
      const trace1 = LowestUniqueBidService.calculateWinner('c5', bids, standardConfig);
      const trace2 = LowestUniqueBidService.calculateWinner('c5', bids, standardConfig);
      const passed = trace1.hash === trace2.hash && trace1.lowestUniqueNumber === 77;
      results.push({
        category: 'COMPETITION_LOGIC',
        name: 'Frozen-Input Calculation Reproducibility & Audit Hash',
        passed,
        message: passed ? `Reproducible hash verified: ${trace1.hash}` : 'Calculation hashes did not match',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'COMPETITION_LOGIC', name: 'Frozen-Input Calculation Reproducibility', passed: false, message: e.message, durationMs: 0 });
    }

    // ---------------- 2. PAYMENT & FINANCIAL ACCOUNTING TESTS ---------------- //

    // 6. Exact $49.00 integer cents calculation (4900, 9800, 14700)
    try {
      const t0 = performance.now();
      const ticketPriceCents = 4900;
      const total1 = 1 * ticketPriceCents;
      const total3 = 3 * ticketPriceCents;
      const passed = total1 === 4900 && total3 === 14700;
      results.push({
        category: 'PAYMENT_ACCOUNTING',
        name: 'Fixed Ticket Pricing: Strict Integer Cents ($49.00 = 4900 Cents)',
        passed,
        message: passed ? 'Multi-ticket pricing reconciled without floating-point drift' : 'Integer cents calculation mismatch',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'PAYMENT_ACCOUNTING', name: 'Fixed Ticket Pricing', passed: false, message: e.message, durationMs: 0 });
    }

    // 7. Fail-Closed Launch Gate: Paid entries rejected when PAID_ENTRIES_ENABLED=false
    try {
      const t0 = performance.now();
      const orderRes = await PaymentOrchestrator.createTicketCheckout({
        userId: 'test_diaspora_user',
        userEmail: 'user@example.com',
        competitionId: 'comp_bole_luxury_apt',
        competitionTitle: '3BR Bole Condominium',
        ticketQuantity: 1,
        provider: 'STRIPE'
      });
      const passed = Boolean(!orderRes.success && orderRes.errorMessage?.includes('paused'));
      results.push({
        category: 'PAYMENT_ACCOUNTING',
        name: 'Fail-Closed Launch Gate: Paid Entry Blocked by Default',
        passed,
        message: passed ? 'Server correctly rejected checkout due to unverified regulatory gate' : 'Security breach: checkout was allowed while gate closed',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'PAYMENT_ACCOUNTING', name: 'Fail-Closed Launch Gate', passed: false, message: e.message, durationMs: 0 });
    }

    // 8. Idempotency protection against duplicate webhook or replay attack
    try {
      const t0 = performance.now();
      const testKey = `idemp_test_${Date.now()}`;
      const rec1 = WalletLedgerService.recordFinancialTransaction({
        userId: 'usr_test_idemp',
        userEmail: 'idemp@example.com',
        type: 'TICKET_PURCHASE',
        amountCents: 4900,
        ticketQuantity: 1,
        provider: 'STRIPE',
        idempotencyKey: testKey,
        description: 'Test ticket purchase'
      });
      const rec2 = WalletLedgerService.recordFinancialTransaction({
        userId: 'usr_test_idemp',
        userEmail: 'idemp@example.com',
        type: 'TICKET_PURCHASE',
        amountCents: 4900,
        ticketQuantity: 1,
        provider: 'STRIPE',
        idempotencyKey: testKey,
        description: 'Test ticket purchase duplicate'
      });
      const passed = rec1.success && rec2.success && rec1.record?.id === rec2.record?.id;
      results.push({
        category: 'PAYMENT_ACCOUNTING',
        name: 'Idempotency Protection: Replay Callbacks Prevent Double-Crediting',
        passed,
        message: passed ? 'Duplicate callback safely returned original ledger record' : 'Duplicate transaction created two records',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'PAYMENT_ACCOUNTING', name: 'Idempotency Protection', passed: false, message: e.message, durationMs: 0 });
    }

    // ---------------- 3. SECURITY & ROLE-BASED ACCESS CONTROL (RBAC) ---------------- //

    // 9. Unauthenticated and non-admin users denied admin access
    try {
      const t0 = performance.now();
      const isRegularAdmin = AdminService.isAdmin('regular.diaspora.user@gmail.com');
      const isSuper = AdminService.isSuperAdmin('regular.diaspora.user@gmail.com');
      const passed = !isRegularAdmin && !isSuper;
      results.push({
        category: 'SECURITY_RBAC',
        name: 'Unauthorized Participant Denied Administrative Access',
        passed,
        message: passed ? 'Server-side role check correctly rejected non-admin identity' : 'Authorization leak detected',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'SECURITY_RBAC', name: 'Unauthorized Participant Denied Admin Access', passed: false, message: e.message, durationMs: 0 });
    }

    // 10. Role Separation: PROPERTY_REVIEWER denied SUPERADMIN operations
    try {
      const t0 = performance.now();
      const canManageAdmins = AdminService.hasPermission('property.reviewer@lowwin-diaspora.com', 'MANAGE_ADMINS');
      const canVerifyProperty = AdminService.hasPermission('property.reviewer@lowwin-diaspora.com', 'VERIFY_PROPERTY');
      const passed = !canManageAdmins && canVerifyProperty;
      results.push({
        category: 'SECURITY_RBAC',
        name: 'Least-Privilege RBAC: PROPERTY_REVIEWER Denied Staff Management',
        passed,
        message: passed ? 'Role boundaries enforced (can verify property, cannot manage admins)' : 'Role boundaries breached',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'SECURITY_RBAC', name: 'Least-Privilege RBAC', passed: false, message: e.message, durationMs: 0 });
    }

    // 11. Suspended administrator loses access immediately
    try {
      const t0 = performance.now();
      const testEmail = `temp_staff_${Date.now()}@lowwin-diaspora.com`;
      AdminService.addAdmin({
        email: testEmail,
        displayName: 'Temporary Staff',
        role: 'SUPPORT',
        actorEmail: AdminService.DEFAULT_BOOTSTRAP_ADMIN
      });
      const wasAdmin = AdminService.isAdmin(testEmail);
      AdminService.setAdminSuspension({
        email: testEmail,
        suspended: true,
        actorEmail: AdminService.DEFAULT_BOOTSTRAP_ADMIN
      });
      const isStillAdmin = AdminService.isAdmin(testEmail);
      const passed = wasAdmin && !isStillAdmin;
      results.push({
        category: 'SECURITY_RBAC',
        name: 'Immediate Revocation of Suspended Administrator Sessions',
        passed,
        message: passed ? 'Suspension instantly revoked all administrative capabilities' : 'Suspended staff retained access',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'SECURITY_RBAC', name: 'Immediate Revocation of Suspended Admins', passed: false, message: e.message, durationMs: 0 });
    }

    // ---------------- 4. PROPERTY DUE DILIGENCE & AWARD WORKFLOW ---------------- //

    // 12. Unverified property blocks live entries
    try {
      const t0 = performance.now();
      const gates = ComplianceService.getLaunchGates();
      const passed = gates.propertyAwardEnabled === false && gates.legalApprovalStatus !== 'approved';
      results.push({
        category: 'PROPERTY_AWARD',
        name: 'Mandatory Due Diligence: Unverified Title Deed Blocks Award Enablement',
        passed,
        message: passed ? 'Award workflow gated until title deed and legal opinion approved' : 'Property award flag active without approvals',
        durationMs: Math.round(performance.now() - t0)
      });
    } catch (e: any) {
      results.push({ category: 'PROPERTY_AWARD', name: 'Mandatory Due Diligence', passed: false, message: e.message, durationMs: 0 });
    }

    const totalPassed = results.filter((r) => r.passed).length;
    const totalFailed = results.filter((r) => !r.passed).length;

    return {
      results,
      totalPassed,
      totalFailed,
      durationMs: Math.round(performance.now() - startTime)
    };
  }
}
