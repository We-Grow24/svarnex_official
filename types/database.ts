export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro_199' | 'empire_799'
          credits: number
          subscription_start_date: string | null
          subscription_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro_199' | 'empire_799'
          credits?: number
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro_199' | 'empire_799'
          credits?: number
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          type: 'hero' | 'pricing' | 'footer' | 'navbar' | 'features' | 
                'testimonials' | 'cta' | 'faq' | 'contact' | 'gallery' |
                'team' | 'stats' | 'blog' | 'newsletter'
          name: string
          description: string | null
          code: string
          config: Json
          vibe_embedding: string | null
          tags: string[]
          is_premium: boolean
          required_tier: 'free' | 'pro_199' | 'empire_799' | null
          created_by: string | null
          created_at: string
          updated_at: string
          views: number
          uses: number
        }
        Insert: {
          id?: string
          type: 'hero' | 'pricing' | 'footer' | 'navbar' | 'features' | 
                'testimonials' | 'cta' | 'faq' | 'contact' | 'gallery' |
                'team' | 'stats' | 'blog' | 'newsletter'
          name: string
          description?: string | null
          code: string
          config?: Json
          vibe_embedding?: string | null
          tags?: string[]
          is_premium?: boolean
          required_tier?: 'free' | 'pro_199' | 'empire_799' | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          views?: number
          uses?: number
        }
        Update: {
          id?: string
          type?: 'hero' | 'pricing' | 'footer' | 'navbar' | 'features' | 
                'testimonials' | 'cta' | 'faq' | 'contact' | 'gallery' |
                'team' | 'stats' | 'blog' | 'newsletter'
          name?: string
          description?: string | null
          code?: string
          config?: Json
          vibe_embedding?: string | null
          tags?: string[]
          is_premium?: boolean
          required_tier?: 'free' | 'pro_199' | 'empire_799' | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          views?: number
          uses?: number
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          subdomain: string | null
          custom_domain: string | null
          blocks: Json
          global_config: Json
          meta_title: string | null
          meta_description: string | null
          favicon_url: string | null
          og_image_url: string | null
          is_published: boolean
          publish_url: string | null
          created_at: string
          updated_at: string
          last_published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          subdomain?: string | null
          custom_domain?: string | null
          blocks?: Json
          global_config?: Json
          meta_title?: string | null
          meta_description?: string | null
          favicon_url?: string | null
          og_image_url?: string | null
          is_published?: boolean
          publish_url?: string | null
          created_at?: string
          updated_at?: string
          last_published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          subdomain?: string | null
          custom_domain?: string | null
          blocks?: Json
          global_config?: Json
          meta_title?: string | null
          meta_description?: string | null
          favicon_url?: string | null
          og_image_url?: string | null
          is_published?: boolean
          publish_url?: string | null
          created_at?: string
          updated_at?: string
          last_published_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_blocks_by_vibe: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_type?: string
        }
        Returns: {
          id: string
          type: string
          name: string
          description: string
          code: string
          config: Json
          tags: string[]
          is_premium: boolean
          similarity: number
        }[]
      }
      increment_block_usage: {
        Args: {
          block_id: string
        }
        Returns: void
      }
      has_credits: {
        Args: {
          user_id: string
          required_credits?: number
        }
        Returns: boolean
      }
      deduct_credits: {
        Args: {
          user_id: string
          amount?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      subscription_tier: 'free' | 'pro_199' | 'empire_799'
      block_type: 'hero' | 'pricing' | 'footer' | 'navbar' | 'features' | 
                  'testimonials' | 'cta' | 'faq' | 'contact' | 'gallery' |
                  'team' | 'stats' | 'blog' | 'newsletter'
    }
  }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Block = Database['public']['Tables']['blocks']['Row']
export type BlockInsert = Database['public']['Tables']['blocks']['Insert']
export type BlockUpdate = Database['public']['Tables']['blocks']['Update']
export type BlockType = Block['type']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type SubscriptionTier = 'free' | 'pro_199' | 'empire_799'

// Block configuration interfaces
export interface BlockConfig {
  [key: string]: any
}

export interface ProjectBlock {
  blockId: string
  order: number
  customConfig?: BlockConfig
}

export interface GlobalConfig {
  theme?: 'light' | 'dark'
  primaryColor?: string
  fontFamily?: string
  [key: string]: any
}
