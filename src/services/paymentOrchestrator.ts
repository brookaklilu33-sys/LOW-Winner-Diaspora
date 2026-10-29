import {
  LaunchGates,
  TicketCheckoutOrder,
  PaymentProviderResult,
  IPaymentGatewayAdapter
} from '../types/payment';
import { ComplianceService } from './complianceService';
import { WalletLedgerService } from './walletLedgerService';

/**
 * PaymentOrchestrator
 * 
 * Provider-independent payment module for Lowwin Diaspora ticket checkout.
 * Enforces strict, server-side fail-closed launch gates.
 * Never silently substitutes fake simulated payments.
 */
export class PaymentOrchestrator {
  private static orders: Map<string, TicketCheckoutOrder> = new Map();

  /**
   * Attempts to initiate a checkout for entry tickets ($49 USD each, 4900 integer cents).
   */
  public static async createTicketCheckout(params: {
    userId: string;
    userEmail: string;
    competitionId: string;
    competitionTitle: string;
    ticketQuantity: number;
    provider: 'STRIPE' | 'PAYPAL' | 'BANK_WIRE';
  }): Promise<PaymentProviderResult> {
    const launchGates = ComplianceService.getLaunchGates();

    // 1. Mandatory server-enforced launch gates check
    if (!launchGates.paidEntriesEnabled) {
      return {
        success: false,
        orderId: '',
        amountCents: params.ticketQuantity * 4900,
        status: 'FAILED',
        errorMessage: 'Paid competition entries are currently paused pending regulatory legal classification and diaspora compliance authorization. Public browsing and property verification documentation remain open.'
      };
    }

    if (!launchGates.paymentProviderEnabled || !launchGates.productionPaymentsEnabled) {
      return {
        success: false,
        orderId: '',
        amountCents: params.ticketQuantity * 4900,
        status: 'FAILED',
        errorMessage: `Payment processing through ${params.provider} is awaiting approved merchant gateway credentials for Ethiopian residential property awards.`
      };
    }

    if (launchGates.legalApprovalStatus !== 'approved') {
      return {
        success: false,
        orderId: '',
        amountCents: params.ticketQuantity * 4900,
        status: 'FAILED',
        errorMessage: 'Legal approval status has not been certified by licensed counsel for this jurisdiction.'
      };
    }

    // 2. Calculate exact integer cents
    const pricePerTicketCents = 4900; // $49.00 USD
    const totalAmountCents = params.ticketQuantity * pricePerTicketCents;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `idemp_order_${orderId}`;

    const order: TicketCheckoutOrder = {
      orderId,
      userId: params.userId,
      userEmail: params.userEmail,
      competitionId: params.competitionId,
      competitionTitle: params.competitionTitle,
      ticketQuantity: params.ticketQuantity,
      pricePerTicketCents,
      totalAmountCents,
      currency: 'USD',
      status: 'PENDING',
      provider: params.provider,
      idempotencyKey,
      createdAt: new Date().toISOString()
    };

    this.orders.set(orderId, order);

    return {
      success: true,
      orderId,
      amountCents: totalAmountCents,
      status: 'PENDING',
      instructions: `Checkout session initialized for ${params.ticketQuantity} ticket(s) at $49 each ($${(totalAmountCents / 100).toFixed(2)} USD). Redirecting to secure gateway.`
    };
  }

  /**
   * Confirms payment callback / webhook with server verification.
   */
  public static async confirmPaymentWebhook(params: {
    orderId: string;
    providerReference: string;
    verifiedSignature: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    if (!params.verifiedSignature) {
      return { success: false, error: 'Invalid webhook signature.' };
    }

    const order = this.orders.get(params.orderId);
    if (!order) {
      return { success: false, error: 'Order reference not found.' };
    }

    if (order.status === 'CONFIRMED') {
      return { success: true }; // Idempotent response
    }

    order.status = 'CONFIRMED';
    order.providerReference = params.providerReference;
    order.confirmedAt = new Date().toISOString();
    this.orders.set(params.orderId, order);

    // Record authoritative ledger entry
    WalletLedgerService.recordFinancialTransaction({
      userId: order.userId,
      userEmail: order.userEmail,
      type: 'TICKET_PURCHASE',
      amountCents: order.totalAmountCents,
      ticketQuantity: order.ticketQuantity,
      provider: order.provider,
      providerReference: params.providerReference,
      competitionId: order.competitionId,
      idempotencyKey: `ledger_${order.orderId}`,
      description: `${order.ticketQuantity} ticket(s) for ${order.competitionTitle}`
    });

    return { success: true };
  }

  public static getOrder(orderId: string): TicketCheckoutOrder | undefined {
    return this.orders.get(orderId);
  }

  public static getAllOrders(): TicketCheckoutOrder[] {
    return Array.from(this.orders.values()).reverse();
  }

  // Compatibility helpers
  public static getFeatureFlags() {
    return ComplianceService.getLaunchGates();
  }

  public static updateFeatureFlags(flags: any) {
    return ComplianceService.updateLaunchGates(flags);
  }

  public static async processCardOrPayPalDeposit(params: any): Promise<PaymentProviderResult> {
    return this.createTicketCheckout({
      userId: params.userId,
      userEmail: 'participant@example.com',
      competitionId: 'comp_bole_luxury_apt',
      competitionTitle: '3-Bedroom Luxury Condominium — Bole',
      ticketQuantity: Math.max(1, Math.floor((params.amountCents || 4900) / 4900)),
      provider: params.provider === 'PAYPAL' ? 'PAYPAL' : 'STRIPE'
    });
  }

  public static async processCryptoDeposit(params: any): Promise<PaymentProviderResult> {
    return {
      success: false,
      orderId: '',
      amountCents: params.amountCents || 4900,
      status: 'FAILED',
      errorMessage: 'Direct crypto deposits are disabled. Only approved international card checkout ($49.00 USD) applies.'
    };
  }
}
