export type FinancialTransactionType =
  | 'TICKET_PURCHASE'
  | 'COMPETITION_REFUND'
  | 'CHARGEBACK_DISPUTE'
  | 'AWARD_SETTLEMENT'
  | 'ADMIN_CORRECTION'
  | 'DEPOSIT'
  | 'AUCTION_ENTRY'
  | 'BID_CHARGE'
  | 'REFUND'
  | 'PRIZE_CREDIT'
  | 'WITHDRAWAL_RESERVE'
  | 'WITHDRAWAL_COMPLETION'
  | 'WITHDRAWAL_REVERSAL'
  | 'AUTHORIZED_CORRECTION';

export type FinancialTransactionStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface FinancialLedgerRecord {
  id: string;
  userId: string;
  userEmail: string;
  type: FinancialTransactionType;
  amountCents: number; // 4900 integer cents per ticket ($49.00 USD)
  currency: 'USD';
  status: FinancialTransactionStatus;
  provider: 'STRIPE' | 'PAYPAL' | 'BANK_WIRE';
  providerReference?: string;
  competitionId?: string;
  ticketQuantity: number;
  idempotencyKey: string;
  description: string;
  timestamp: string;
  uniqueCredits?: number;
  balanceBeforeCents?: number;
  balanceAfterCents?: number;
  auditMetadata: {
    ipAddress?: string;
    userAgent?: string;
    authorizedAdminId?: string;
    reason?: string;
    refundReference?: string;
    isDemo?: boolean;
  };
}

export interface ParticipantAccountSummary {
  userId: string;
  totalTicketsPurchased: number;
  totalAmountSpentCents: number;
  activeEntriesCount: number;
  refundedCount: number;
  lastActivityAt: string;
}

export interface Wallet {
  userId: string;
  balanceCents: number;
  balanceUnique: number;
  uniqueCredits?: number;
  reservedCents: number;
  demoBalanceCents: number;
  demoBalanceUnique: number;
  currency: 'USD';
  lastReconciledAt: string;
}

export interface WithdrawalDestination {
  type: 'ACH' | 'ACH_BANK' | 'WIRE' | 'PAYPAL' | 'CRYPTO';
  accountNumber?: string;
  routingNumber?: string;
  paypalEmail?: string;
  walletAddress?: string;
  accountHolderName?: string;
  routingOrEmailOrAddress?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amountCents: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  destination: WithdrawalDestination;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Backward compatibility alias
export type LedgerTransaction = FinancialLedgerRecord;
export type TransactionType = FinancialTransactionType;

