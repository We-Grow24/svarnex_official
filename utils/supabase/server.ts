import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database, User } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Helper to get the current user
export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Helper to get user profile from public.users table
export async function getUserProfile(userId: string): Promise<{ data: User | null, error: any }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data: data as User | null, error }
}

// Helper to check if user has required subscription tier
export async function checkSubscriptionTier(
  userId: string,
  requiredTier: 'free' | 'pro_199' | 'empire_799'
) {
  const { data: user } = await getUserProfile(userId)
  
  if (!user) return false
  
  const tierHierarchy: Record<string, number> = {
    'free': 0,
    'pro_199': 1,
    'empire_799': 2
  }
  
  return tierHierarchy[user.subscription_tier] >= tierHierarchy[requiredTier]
}

// Helper to check and deduct credits
export async function useCredits(userId: string, amount: number = 1) {
  const supabase = await createClient()
  
  // Call the database function to safely deduct credits
  const { data, error } = await supabase.rpc('deduct_credits', {
    user_id: userId,
    amount: amount
  } as any)
  
  return { success: data, error }
}
