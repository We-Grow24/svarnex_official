/**
 * Verify Razorpay Payment API Route
 * 
 * Verifies Razorpay payment signature and updates user subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { createClient } from '@/utils/supabase/server';
import { RAZORPAY_PLANS } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = body;

    if (provider !== 'razorpay') {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch order details to get the tier
    const razorpayInstance = require('@/lib/payments/razorpay').razorpayInstance;
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);

    const tier = order.notes.tier;

    // Update user subscription tier in database
    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      // @ts-ignore - subscription_tier column added via migration
      .update({
        subscription_tier: tier,
        subscription_updated_at: new Date().toISOString(),
        payment_provider: 'razorpay',
        last_payment_id: razorpay_payment_id,
      })
      .eq('id', userId);

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    // Log transaction
    // @ts-ignore - transactions table added via migration
    await supabase.from('transactions').insert({
      user_id: userId,
      provider: 'razorpay',
      transaction_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      amount: order.amount,
      currency: order.currency,
      tier: tier,
      status: 'completed',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      tier,
      message: 'Payment verified successfully',
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
