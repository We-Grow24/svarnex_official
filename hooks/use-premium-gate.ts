/**
 * Premium Gate Hook
 * 
 * Checks if user has access to premium features based on subscription tier
 * Opens PaymentModal if user tries to access premium content
 */

'use client';

import { useState } from 'react';
import { SubscriptionTier } from '@/lib/payments/types';
import { useUser } from '@/lib/hooks/use-user';

interface PremiumGateState {
  isPaymentModalOpen: boolean;
  requiredTier: SubscriptionTier | null;
  blockedBlockName: string | null;
}

export function usePremiumGate() {
  const { user } = useUser();
  const [gateState, setGateState] = useState<PremiumGateState>({
    isPaymentModalOpen: false,
    requiredTier: null,
    blockedBlockName: null,
  });

  /**
   * Check if user has access to a specific tier
   */
  const hasAccess = (requiredTier: SubscriptionTier): boolean => {
    if (!user) return false;

    const tierHierarchy: Record<SubscriptionTier, number> = {
      free: 0,
      pro_199: 1,
      empire_799: 2,
    };

    const userTierLevel = tierHierarchy[user.subscription_tier as SubscriptionTier] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier];

    return userTierLevel >= requiredTierLevel;
  };

  /**
   * Check if user can add a premium block
   * If not, opens payment modal
   * 
   * @returns true if user can proceed, false if blocked
   */
  const checkPremiumAccess = (
    blockIsPremium: boolean,
    blockRequiredTier: SubscriptionTier,
    blockName?: string
  ): boolean => {
    // If block is not premium, allow access
    if (!blockIsPremium) return true;

    // If user has access, allow
    if (hasAccess(blockRequiredTier)) return true;

    // Block access and open payment modal
    setGateState({
      isPaymentModalOpen: true,
      requiredTier: blockRequiredTier,
      blockedBlockName: blockName || null,
    });

    return false;
  };

  /**
   * Close payment modal
   */
  const closePaymentModal = () => {
    setGateState({
      isPaymentModalOpen: false,
      requiredTier: null,
      blockedBlockName: null,
    });
  };

  /**
   * Get user's current tier
   */
  const getCurrentTier = (): SubscriptionTier => {
    return (user?.subscription_tier as SubscriptionTier) || 'free';
  };

  /**
   * Check if user can access Pro features
   */
  const canAccessPro = (): boolean => {
    return hasAccess('pro_199');
  };

  /**
   * Check if user can access Empire (Enterprise) features
   */
  const canAccessEnterprise = (): boolean => {
    return hasAccess('empire_799');
  };

  return {
    // State
    isPaymentModalOpen: gateState.isPaymentModalOpen,
    requiredTier: gateState.requiredTier,
    blockedBlockName: gateState.blockedBlockName,

    // Methods
    checkPremiumAccess,
    closePaymentModal,
    hasAccess,
    getCurrentTier,
    canAccessPro,
    canAccessEnterprise,
  };
}
