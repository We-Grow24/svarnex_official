/**
 * Block Library Component with Premium Gating
 * 
 * Shows all available blocks with premium badges
 * Opens PaymentModal when user tries to add a premium block without access
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Crown as CrownIcon, Lock, Sparkles } from 'lucide-react';
import { usePremiumGate } from '@/hooks/use-premium-gate';
import PaymentModal from '@/components/payment/payment-modal';
import { SubscriptionTier } from '@/lib/payments/types';

interface Block {
  id: string;
  name: string;
  type: string;
  category: string;
  is_premium: boolean;
  required_tier: SubscriptionTier;
  config: any;
  preview_image?: string;
}

interface BlockLibraryProps {
  onAddBlock: (block: Block) => void;
}

export default function BlockLibrary({ onAddBlock }: BlockLibraryProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    isPaymentModalOpen,
    requiredTier,
    blockedBlockName,
    checkPremiumAccess,
    closePaymentModal,
    getCurrentTier,
  } = usePremiumGate();

  // Fetch blocks from API
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await fetch('/api/blocks');
        const data = await response.json();
        setBlocks(data);
      } catch (error) {
        console.error('Failed to fetch blocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  // Handle block addition with premium gating
  const handleAddBlock = (block: Block) => {
    // Check if user has access to this block
    const hasAccess = checkPremiumAccess(
      block.is_premium,
      block.required_tier,
      block.name
    );

    if (hasAccess) {
      // User has access - add the block
      onAddBlock(block);
    }
    // If no access, checkPremiumAccess() will open the PaymentModal
  };

  // Get tier badge color
  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro_199':
        return 'from-purple-500 to-pink-500';
      case 'empire_799':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Get tier icon
  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'pro_199':
        return <Sparkles className="w-3 h-3" />;
      case 'empire_799':
        return <CrownIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const categories = ['all', ...Array.from(new Set(blocks.map((b) => b.category)))];

  const filteredBlocks =
    selectedCategory === 'all'
      ? blocks
      : blocks.filter((b) => b.category === selectedCategory);

  const currentTier = getCurrentTier();

  return (
    <div className="space-y-6">
      {/* Current Tier Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Block Library</h2>
        <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getTierColor(currentTier)} text-white text-sm font-bold flex items-center gap-2`}>
          {getTierIcon(currentTier)}
          {currentTier} Plan
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Blocks Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlocks.map((block) => (
            <motion.div
              key={block.id}
              className="relative group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="h-48 rounded-xl bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/10 p-6 flex flex-col">
                {/* Premium Badge */}
                {block.is_premium && (
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(
                      block.required_tier
                    )} text-white text-xs font-bold flex items-center gap-1`}
                  >
                    {getTierIcon(block.required_tier)}
                    {block.required_tier}
                  </div>
                )}

                {/* Block Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {block.name}
                  </h3>
                  <p className="text-sm text-white/60">
                    {block.category} • {block.type}
                  </p>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => handleAddBlock(block)}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                    block.is_premium && currentTier === 'free'
                      ? 'bg-white/5 text-white/40 border border-white/10'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                  }`}
                >
                  {block.is_premium && currentTier === 'free' ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Upgrade to Add
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Block
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        requiredTier={requiredTier || 'pro_199'}
        blockName={blockedBlockName || undefined}
      />
    </div>
  );
}
