export interface CheckoutSessionResult {
  sessionId?: string;
  checkoutUrl?: string;
  success: boolean;
  message?: string;
}

export interface PaymentProvider {
  name: string;
  createCheckout(params: {
    enrollmentId: string;
    studentId: string;
    amountCad: number;
    courseTitle: string;
    batchCode?: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<CheckoutSessionResult>;
  verifyPayment(sessionId: string): Promise<{ paid: boolean; paymentNote?: string }>;
}

/**
 * Manual / e-Transfer Payment Provider (Default for Phase 1)
 * Admin manually checks Interac e-Transfer or in-person cash/card payment
 * and updates enrollment payment_status in /admin/batches.
 */
export class ManualPaymentProvider implements PaymentProvider {
  name = "manual";

  async createCheckout(params: {
    enrollmentId: string;
    studentId: string;
    amountCad: number;
    courseTitle: string;
    batchCode?: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<CheckoutSessionResult> {
    return {
      success: true,
      message: `Manual registration confirmed. Please e-Transfer to payments@krishfashionacademy.com for ${params.courseTitle} (${params.batchCode || ""}).`,
    };
  }

  async verifyPayment(): Promise<{ paid: boolean; paymentNote?: string }> {
    return {
      paid: false,
      paymentNote: "Awaiting manual verification by admin",
    };
  }
}

export const defaultPaymentProvider = new ManualPaymentProvider();
