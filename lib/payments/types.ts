/**
 * Payment System Types
 * 
 * Note: Tier values match database schema
 * - free: Free tier
 * - pro_199: Pro tier (₹199/$9.99)
 * - empire_799: Empire tier (₹799/$39.99)
 */

export type SubscriptionTier = 'free' | 'pro_199' | 'empire_799';

export type PaymentProvider = 'razorpay' | 'stripe';

export type BillingCycle = 'monthly' | 'yearly';

export interface PricingPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  price: {
    razorpay: number; // INR paise
    stripe: number;   // USD cents
  };
  displayPrice: {
    razorpay: string; // "₹199"
    stripe: string;   // "$9.99"
  };
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    billingCycle: 'monthly',
    price: { razorpay: 0, stripe: 0 },
    displayPrice: { razorpay: '₹0', stripe: '$0' },
    features: [
      '5 Projects',
      '100 AI Credits/month',
      'Basic Blocks',
      'Community Support',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    tier: 'pro_199',
    billingCycle: 'monthly',
    price: { razorpay: 19900, stripe: 999 },
    displayPrice: { razorpay: '₹199', stripe: '$9.99' },
    features: [
      'Unlimited Projects',
      '1,000 AI Credits/month',
      'All Premium Blocks',
      'Custom Domain',
      'Priority Support',
      'Remove Svarnex Branding',
    ],
    popular: true,
  },
  {
    id: 'pro-yearly',
    name: 'Pro (Yearly)',
    tier: 'pro_199',
    billingCycle: 'yearly',
    price: { razorpay: 199900, stripe: 9999 },
    displayPrice: { razorpay: '₹1,999', stripe: '$99.99' },
    features: [
      'Everything in Pro Monthly',
      '17% discount (2 months free)',
      'Annual billing',
    ],
  },
  {
    id: 'empire-monthly',
    name: 'Empire',
    tier: 'empire_799',
    billingCycle: 'monthly',
    price: { razorpay: 79900, stripe: 3999 },
    displayPrice: { razorpay: '₹799', stripe: '$39.99' },
    features: [
      'Everything in Pro',
      'Unlimited AI Credits',
      'White Label Solution',
      'API Access',
      'Dedicated Support',
      'Custom Integrations',
      'SLA Guarantee',
    ],
  },
  {
    id: 'empire-yearly',
    name: 'Empire (Yearly)',
    tier: 'empire_799',
    billingCycle: 'yearly',
    price: { razorpay: 799900, stripe: 39999 },
    displayPrice: { razorpay: '₹7,999', stripe: '$399.99' },
    features: [
      'Everything in Empire Monthly',
      '17% discount (2 months free)',
      'Annual billing',
    ],
  },
];

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  tier?: SubscriptionTier;
  error?: string;
}
