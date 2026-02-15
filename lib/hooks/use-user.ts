/**
 * User Hook
 * 
 * Provides access to current user data and subscription tier
 * This is a placeholder - integrate with your existing auth system
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { SubscriptionTier } from '@/lib/payments/types';

interface User {
  id: string;
  email: string;
  name: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();

      // Get authenticated user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setIsLoading(false);
        return;
      }

      // Fetch user profile with subscription tier
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({
          id: (profile as any).id,
          email: (profile as any).email || authUser.email || '',
          name: (profile as any).name || '',
          subscription_tier: (profile as any).subscription_tier || 'free',
          created_at: (profile as any).created_at,
        });
      }

      setIsLoading(false);
    };

    fetchUser();

    // Subscribe to auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({
          id: (profile as any).id,
          email: (profile as any).email || authUser.email || '',
          name: (profile as any).name || '',
          subscription_tier: (profile as any).subscription_tier || 'free',
          created_at: (profile as any).created_at,
        });
      }
    }

    setIsLoading(false);
  };

  return {
    user,
    isLoading,
    refreshUser,
  };
}
