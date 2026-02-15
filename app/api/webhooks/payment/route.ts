/**
 * Generic Payment Webhook Handler
 * 
 * Handles webhooks from both Razorpay and Stripe
 * Updates user subscription tier after successful payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/payments/stripe';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') ||
                     request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Detect provider based on signature format
    const isStripe = request.headers.get('stripe-signature') !== null;
    const isRazorpay = request.headers.get('x-razorpay-signature') !== null;

    if (isStripe) {
      return handleStripeWebhook(body, signature);
    } else if (isRazorpay) {
      return handleRazorpayWebhook(body, signature);
    } else {
      return NextResponse.json(
        { error: 'Unknown payment provider' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle Stripe Webhook
 */
async function handleStripeWebhook(body: string, signature: string) {
  try {
    const event = verifyStripeWebhook(body, signature);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      const userId = session.metadata.user_id;
      const tier = session.metadata.tier;
      const planId = session.metadata.plan;

      if (!userId || !tier) {
        console.error('Missing metadata in Stripe session');
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        );
      }

      // Update user subscription
      const supabase = await createClient();
      const { error } = await supabase
        .from('users')
        // @ts-ignore - subscription_tier column added via migration
        .update({
          subscription_tier: tier,
          subscription_updated_at: new Date().toISOString(),
          payment_provider: 'stripe',
          last_payment_id: session.payment_intent,
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
        provider: 'stripe',
        transaction_id: session.payment_intent,
        order_id: session.id,
        amount: session.amount_total,
        currency: session.currency,
        tier: tier,
        status: 'completed',
        created_at: new Date().toISOString(),
      });

      console.log(`✅ Stripe payment successful for user ${userId} - Tier: ${tier}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

/**
 * Handle Razorpay Webhook
 */
async function handleRazorpayWebhook(body: string, signature: string) {
  try {
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Razorpay webhook secret not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(body);

    // Handle payment.captured event
    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;

      // Fetch order to get user metadata
      const razorpayInstance = require('@/lib/payments/razorpay').razorpayInstance;
      const order = await razorpayInstance.orders.fetch(orderId);

      const userId = order.notes.user_id;
      const tier = order.notes.tier;

      if (!userId || !tier) {
        console.error('Missing notes in Razorpay order');
        return NextResponse.json(
          { error: 'Missing order notes' },
          { status: 400 }
        );
      }

      // Update user subscription
      const supabase = await createClient();
      const { error } = await supabase
        .from('users')
        // @ts-ignore - subscription_tier column added via migration
        .update({
          subscription_tier: tier,
          subscription_updated_at: new Date().toISOString(),
          payment_provider: 'razorpay',
          last_payment_id: payment.id,
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
        transaction_id: payment.id,
        order_id: orderId,
        amount: payment.amount,
        currency: payment.currency,
        tier: tier,
        status: 'completed',
        created_at: new Date().toISOString(),
      });

      console.log(`✅ Razorpay payment successful for user ${userId} - Tier: ${tier}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
