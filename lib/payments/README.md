# Architecture Decision Record (ADR): Payment Architecture

## Context
Krish Fashion Academy (KFA) operates tailoring masterclasses in Scarborough, Ontario, Canada with both In-person and Online participation.
Current payment collection is handled manually via:
1. Interac e-Transfer to the academy's Canadian business email.
2. Direct in-person payment on Day 1 of class.
3. WhatsApp coordination with Krish (+1 647-501-9569).

## Decision
We define an extensible `PaymentProvider` interface in `lib/payments/index.ts` with a `ManualPaymentProvider` as the active provider.
The `enrollments` table includes:
- `payment_status`: check (`unpaid`, `paid`, `waived`, `refunded`)
- `amount_paid_cad`: numeric (in CAD $)
- `payment_note`: text (e.g. "Interac reference #123456", "In-person cash on May 10")

## Future Stripe / Interac Integration Plan
When automated online credit card processing is activated:
1. Install `@stripe/stripe-js` and `stripe`.
2. Implement `StripePaymentProvider implements PaymentProvider` inside `lib/payments/stripe.ts`:
   - `createCheckout()` will create a Stripe Checkout session with `currency: 'cad'`, passing `enrollment_id` in metadata.
   - Set up Next.js webhook route at `/api/webhooks/stripe` listening for `checkout.session.completed`.
   - On webhook trigger, update `enrollments`:
     ```ts
     await supabase
       .from('enrollments')
       .update({
         payment_status: 'paid',
         amount_paid_cad: session.amount_total / 100,
         payment_note: `Stripe Checkout Session ${session.id}`,
       })
       .eq('id', session.metadata.enrollment_id);
     ```
3. No schema migration will be needed because `enrollments` already supports `payment_status`, `amount_paid_cad`, and `payment_note`.
