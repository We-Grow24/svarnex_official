/**
 * Create Payment Order API Route
 * 
 * Creates a Razorpay order or Stripe checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { createStripeCheckoutSession } from '@/lib/payments/stripe';
import { PRICING_PLANS } from '@/lib/payments/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, planId, userId, userEmail } = body;

    // Validate inputs
    if (!provider || !planId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the selected plan
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (provider === 'razorpay') {
      // Create Razorpay order
      const planKey = planId.toUpperCase().replace('-', '_') as any;
      const order = await createRazorpayOrder(planKey, userId, userEmail);

      return NextResponse.json({ order });
    } else if (provider === 'stripe') {
      // Create Stripe checkout session
      const planKey = planId.toUpperCase().replace('-', '_') as any;
      const session = await createStripeCheckoutSession(
        planKey,
        userId,
        userEmail
      );

      return NextResponse.json({ sessionUrl: session.url });
    } else {
      return NextResponse.json(
        { error: 'Invalid payment provider' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
