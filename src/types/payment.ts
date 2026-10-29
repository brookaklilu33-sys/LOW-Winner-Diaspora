export interface LaunchGates {
  paidEntriesEnabled: boolean;          // PAID_ENTRIES_ENABLED
  productionPaymentsEnabled: boolean;   // PRODUCTION_PAYMENTS_ENABLED
  propertyAwardEnabled: boolean;        // PROPERTY_AWARD_ENABLED
  legalApprovalStatus: 'not_reviewed' | 'pending_counsel_review' | 'approved' | 'rejected';
  paymentProviderEnabled: boolean;      // PAYMENT_PROVIDER_ENABLED
  legalCounselReference?: string;
  lastReviewedDate?: string;
}

export type PaymentProvider = 'STRIPE' | 'PAYPAL' | 'BANK_WIRE';

export interface TicketCheckoutOrder {
  orderId: string;
  userId: string;
  userEmail: string;
  competitionId: string;
  competitionTitle: string;
  ticketQuantity: number;
  pricePerTicketCents: number; // 4900 ($49.00 USD)
  totalAmountCents: number;    // e.g. 4900, 9800, 14700
  currency: 'USD';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  provider: PaymentProvider;
  providerReference?: string;
  checkoutUrl?: string;
  idempotencyKey: string;
  createdAt: string;
  confirmedAt?: string;
  failureReason?: string;
}

export interface PaymentProviderResult {
  success: boolean;
  orderId: string;
  providerReference?: string;
  amountCents: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  errorMessage?: string;
  checkoutUrl?: string;
  instructions?: string;
}

export interface IPaymentGatewayAdapter {
  providerName: string;
  isConfigured(): boolean;
  createCheckoutSession(order: TicketCheckoutOrder): Promise<PaymentProviderResult>;
  verifyTransaction(providerReference: string): Promise<PaymentProviderResult>;
  processRefund(orderId: string, amountCents: number, reason: string): Promise<{ success: boolean; refundReference?: string; error?: string }>;
}
