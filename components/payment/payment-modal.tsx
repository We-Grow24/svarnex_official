/**
 * Generic Payment Modal Component
 * 
 * Supports both Razorpay (India) and Stripe (International) payments
 * Automatically detects user location and shows appropriate payment provider
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Zap, Crown, Sparkles } from 'lucide-react';
import { PRICING_PLANS, PaymentProvider, SubscriptionTier } from '@/lib/payments/types';
import { useUser } from '@/lib/hooks/use-user';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: SubscriptionTier;
  blockName?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  requiredTier,
  blockName,
}: PaymentModalProps) {
  const { user } = useUser();
  const [provider, setProvider] = useState<PaymentProvider>('razorpay');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect payment provider based on location
  useEffect(() => {
    const detectProvider = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setProvider(data.country_code === 'IN' ? 'razorpay' : 'stripe');
      } catch {
        setProvider('razorpay'); // Default to Razorpay
      }
    };

    if (isOpen) {
      detectProvider();
    }
  }, [isOpen]);

  // Filter plans based on required tier
  const availablePlans = PRICING_PLANS.filter((plan) => {
    if (requiredTier === 'pro_199') {
      return plan.tier === 'pro_199' || plan.tier === 'empire_799';
    }
    if (requiredTier === 'empire_799') {
      return plan.tier === 'empire_799';
    }
    return false;
  });

  // Auto-select recommended plan
  useEffect(() => {
    if (availablePlans.length > 0 && !selectedPlan) {
      const recommended = availablePlans.find((p) => p.popular);
      setSelectedPlan(recommended?.id || availablePlans[0].id);
    }
  }, [availablePlans, selectedPlan]);

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create order/session via API
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          planId: selectedPlan,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const { order, sessionUrl } = await response.json();

      if (provider === 'razorpay') {
        // Razorpay Checkout
        await loadRazorpayCheckout(order);
      } else {
        // Stripe Checkout (redirect)
        window.location.href = sessionUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const loadRazorpayCheckout = async (order: any) => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: 'Svarnex',
        description: order.notes.plan,
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#8B5CF6',
        },
        handler: async (response: any) => {
          // Payment success
          await verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    };
  };

  const verifyPayment = async (response: any) => {
    try {
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          ...response,
          userId: user?.id,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      // Success! Reload user data
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Payment verification failed');
      setIsProcessing(false);
    }
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro_199':
        return <Zap className="w-5 h-5" />;
      case 'empire_799':
        return <Crown className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    Upgrade to {requiredTier}
                  </h2>
                  {blockName && (
                    <p className="text-white/60 mt-2">
                      Unlock <span className="text-purple-400 font-medium">{blockName}</span> and
                      other premium features
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Provider Toggle */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setProvider('razorpay')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      provider === 'razorpay'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Pay with Razorpay (₹)
                  </button>
                  <button
                    onClick={() => setProvider('stripe')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      provider === 'stripe'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Pay with Stripe ($)
                  </button>
                </div>

                {/* Pricing Plans */}
                <div className="grid md:grid-cols-2 gap-4">
                  {availablePlans.map((plan) => (
                    <motion.button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                        selectedPlan === plan.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                          MOST POPULAR
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            {getTierIcon(plan.tier)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            <p className="text-sm text-white/60 capitalize">{plan.billingCycle}</p>
                          </div>
                        </div>
                        {selectedPlan === plan.id && (
                          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="text-3xl font-bold text-white">
                          {plan.displayPrice[provider]}
                        </div>
                        {plan.billingCycle === 'yearly' && (
                          <div className="text-sm text-green-400 font-medium">
                            Save 17% (2 months free)
                          </div>
                        )}
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                            <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.button>
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Payment Button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-sm text-white/60">
                    Secure payment powered by {provider === 'razorpay' ? 'Razorpay' : 'Stripe'}
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || !selectedPlan}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
