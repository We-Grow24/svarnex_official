/**
 * Razorpay Client Configuration
 * 
 * Handles Razorpay integration for Indian payment processing
 */

import Razorpay from 'razorpay';

// Server-side Razorpay instance (for creating orders)
export const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Subscription tier pricing (in INR paise - ₹199 = 19900 paise)
export const RAZORPAY_PLANS = {
  PRO_MONTHLY: {
    amount: 19900, // ₹199
    currency: 'INR',
    name: 'Svarnex Pro - Monthly',
    description: 'Unlock premium blocks and advanced features',
    tier: 'pro_199',
  },
  PRO_YEARLY: {
    amount: 199900, // ₹1,999 (save ₹389)
    currency: 'INR',
    name: 'Svarnex Pro - Yearly',
    description: 'Unlock premium blocks and advanced features (17% off)',
    tier: 'pro_199',
  },
  ENTERPRISE_MONTHLY: {
    amount: 79900, // ₹799
    currency: 'INR',
    name: 'Svarnex Empire - Monthly',
    description: 'All features + priority support',
    tier: 'empire_799',
  },
  ENTERPRISE_YEARLY: {
    amount: 799900, // ₹7,999 (save ₹1,589)
    currency: 'INR',
    name: 'Svarnex Empire - Yearly',
    description: 'All features + priority support (17% off)',
    tier: 'empire_799',
  },
} as const;

export type RazorpayPlanKey = keyof typeof RAZORPAY_PLANS;

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(
  planKey: RazorpayPlanKey,
  userId: string,
  userEmail: string
) {
  const plan = RAZORPAY_PLANS[planKey];

  const order = await razorpayInstance.orders.create({
    amount: plan.amount,
    currency: plan.currency,
    receipt: `order_${userId}_${Date.now()}`,
    notes: {
      user_id: userId,
      user_email: userEmail,
      plan: planKey,
      tier: plan.tier,
    },
  });

  return order;
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto');

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

/**
 * Client-side Razorpay options
 */
export function getRazorpayOptions(
  order: any,
  userEmail: string,
  userName: string,
  onSuccess: (response: any) => void,
  onError: (response: any) => void
) {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: order.amount,
    currency: order.currency,
    name: 'Svarnex',
    description: order.notes.plan,
    order_id: order.id,
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: '#8B5CF6', // Purple brand color
    },
    handler: onSuccess,
    modal: {
      ondismiss: onError,
    },
  };
}
