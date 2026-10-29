import {
  FinancialLedgerRecord,
  FinancialTransactionType,
  ParticipantAccountSummary,
  Wallet,
  WithdrawalRequest
} from '../types/wallet';

/**
 * WalletLedgerService
 * 
 * Authoritative financial accounting ledger for Lowwin Diaspora.
 * Every financial transaction is recorded using integer cents ($49.00 USD = 4900 cents).
 * Floating-point arithmetic for currency is strictly prohibited.
 */
export class WalletLedgerService {
  private static records: FinancialLedgerRecord[] = [];
  private static processedIdempotencyKeys: Set<string> = new Set();
  private static summaries: Map<string, ParticipantAccountSummary> = new Map();

  public static getOrCreateSummary(userId: string): ParticipantAccountSummary {
    let summary = this.summaries.get(userId);
    if (!summary) {
      summary = {
        userId,
        totalTicketsPurchased: 0,
        totalAmountSpentCents: 0,
        activeEntriesCount: 0,
        refundedCount: 0,
        lastActivityAt: new Date().toISOString()
      };
      this.summaries.set(userId, summary);
    }
    return { ...summary };
  }

  /**
   * Records an immutable financial transaction with strict idempotency.
   */
  public static recordFinancialTransaction(params: {
    userId: string;
    userEmail: string;
    type: FinancialTransactionType;
    amountCents: number; // e.g. 4900 cents ($49.00)
    ticketQuantity: number;
    provider: 'STRIPE' | 'PAYPAL' | 'BANK_WIRE';
    providerReference?: string;
    competitionId?: string;
    idempotencyKey: string;
    description: string;
    authorizedAdminId?: string;
    reason?: string;
  }): { success: boolean; record?: FinancialLedgerRecord; error?: string } {
    // 1. Idempotency guard against duplicate callbacks or double-submissions
    if (this.processedIdempotencyKeys.has(params.idempotencyKey)) {
      const existing = this.records.find((r) => r.idempotencyKey === params.idempotencyKey);
      if (existing) {
        return { success: true, record: existing };
      }
      return { success: false, error: 'Idempotency conflict: transaction already recorded' };
    }

    if (!Number.isInteger(params.amountCents) || params.amountCents <= 0) {
      return { success: false, error: 'Transaction amount must be a positive integer in cents' };
    }

    const summary = this.getOrCreateSummary(params.userId);

    if (params.type === 'TICKET_PURCHASE') {
      summary.totalTicketsPurchased += params.ticketQuantity;
      summary.totalAmountSpentCents += params.amountCents;
      summary.activeEntriesCount += params.ticketQuantity;
    } else if (params.type === 'COMPETITION_REFUND') {
      summary.refundedCount += params.ticketQuantity;
      summary.activeEntriesCount = Math.max(0, summary.activeEntriesCount - params.ticketQuantity);
    }
    summary.lastActivityAt = new Date().toISOString();
    this.summaries.set(params.userId, summary);

    const record: FinancialLedgerRecord = {
      id: `fin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      userEmail: params.userEmail,
      type: params.type,
      amountCents: params.amountCents,
      currency: 'USD',
      status: 'COMPLETED',
      provider: params.provider,
      providerReference: params.providerReference,
      competitionId: params.competitionId,
      ticketQuantity: params.ticketQuantity,
      idempotencyKey: params.idempotencyKey,
      description: params.description,
      timestamp: new Date().toISOString(),
      auditMetadata: {
        authorizedAdminId: params.authorizedAdminId,
        reason: params.reason
      }
    };

    this.records.push(record);
    this.processedIdempotencyKeys.add(params.idempotencyKey);

    return { success: true, record };
  }

  // Alias for backward compatibility with existing routes
  public static recordTransaction(params: any) {
    return this.recordFinancialTransaction({
      userId: params.userId,
      userEmail: params.userEmail || 'participant@example.com',
      type: params.type === 'REFUND' ? 'COMPETITION_REFUND' : 'TICKET_PURCHASE',
      amountCents: Math.abs(params.amountCents),
      ticketQuantity: Math.max(1, Math.floor(Math.abs(params.amountCents) / 4900)),
      provider: 'STRIPE',
      providerReference: params.providerReference,
      competitionId: params.relatedAuctionId,
      idempotencyKey: params.idempotencyKey,
      description: params.description,
      authorizedAdminId: params.adminUserId,
      reason: params.reason
    });
  }

  public static getOrCreateWallet(userId: string): Wallet {
    const summary = this.getOrCreateSummary(userId);
    return {
      userId,
      balanceCents: summary.totalAmountSpentCents,
      balanceUnique: summary.totalTicketsPurchased,
      uniqueCredits: summary.totalTicketsPurchased,
      reservedCents: 0,
      demoBalanceCents: 0,
      demoBalanceUnique: 0,
      currency: 'USD',
      lastReconciledAt: summary.lastActivityAt
    };
  }

  public static getRecordsForUser(userId: string): FinancialLedgerRecord[] {
    return this.records.filter((r) => r.userId === userId).reverse();
  }

  public static getTransactionsForUser(userId: string) {
    return this.getRecordsForUser(userId);
  }

  public static getAllRecords(): FinancialLedgerRecord[] {
    return [...this.records].reverse();
  }

  public static getAllTransactions() {
    return this.getAllRecords();
  }

  public static getAllWithdrawals(): WithdrawalRequest[] {
    return [];
  }

  public static getWithdrawalsForUser(_userId: string): WithdrawalRequest[] {
    return [];
  }

  public static requestWithdrawal(_params: any) {
    return { success: false, error: 'Direct withdrawals are not supported. Only authorized refunds to original payment method apply.' };
  }

  public static completeWithdrawal(_withdrawalId: string, _adminId?: string) {
    return { success: false, error: 'Not supported.' };
  }

  public static cancelWithdrawal(_withdrawalId: string, _reason: string, _adminId?: string) {
    return { success: false, error: 'Not supported.' };
  }
}
