/**
 * Stripe Client Configuration
 * 
 * Handles Stripe integration for international payment processing
 */

import Stripe from 'stripe';

// Server-side Stripe instance
export const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

// Subscription tier pricing (in USD cents - $9.99 = 999 cents)
export const STRIPE_PLANS = {
  PRO_MONTHLY: {
    amount: 999, // $9.99
    currency: 'usd',
    name: 'Svarnex Pro - Monthly',
    description: 'Unlock premium blocks and advanced features',
    tier: 'pro_199',
  },
  PRO_YEARLY: {
    amount: 9999, // $99.99 (save $19.89)
    currency: 'usd',
    name: 'Svarnex Pro - Yearly',
    description: 'Unlock premium blocks and advanced features (17% off)',
    tier: 'pro_199',
  },
  ENTERPRISE_MONTHLY: {
    amount: 3999, // $39.99
    currency: 'usd',
    name: 'Svarnex Empire - Monthly',
    description: 'All features + priority support',
    tier: 'empire_799',
  },
  ENTERPRISE_YEARLY: {
    amount: 39999, // $399.99 (save $79.89)
    currency: 'usd',
    name: 'Svarnex Empire - Yearly',
    description: 'All features + priority support (17% off)',
    tier: 'empire_799',
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;

/**
 * Create a Stripe Checkout Session
 */
export async function createStripeCheckoutSession(
  planKey: StripePlanKey,
  userId: string,
  userEmail: string
) {
  const plan = STRIPE_PLANS[planKey];

  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
    client_reference_id: userId,
    customer_email: userEmail,
    metadata: {
      user_id: userId,
      plan: planKey,
      tier: plan.tier,
    },
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(payload: string, signature: string): Stripe.Event {
  return stripeInstance.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

/**
 * Get formatted price display
 */
export function formatStripePrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function formatRazorpayPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount / 100);
}
