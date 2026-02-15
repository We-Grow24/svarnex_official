-- SVARNEX Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Subscription Management
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro_199', 'empire_799')),
  credits INTEGER NOT NULL DEFAULT 100,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read and update their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BLOCKS TABLE (AI-generated components)
-- ============================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Block Information
  type TEXT NOT NULL CHECK (type IN (
    'hero', 'pricing', 'footer', 'navbar', 'features', 
    'testimonials', 'cta', 'faq', 'contact', 'gallery',
    'team', 'stats', 'blog', 'newsletter'
  )),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Component Code
  code TEXT NOT NULL, -- The actual React component code string
  
  -- Editable Configuration
  config JSONB NOT NULL DEFAULT '{}', -- Editable fields like {title, subtitle, color, etc}
  
  -- AI Matching
  vibe_embedding VECTOR(1536), -- OpenAI ada-002 embedding for semantic search
  tags TEXT[] DEFAULT '{}', -- Keywords for searching: ['luxury', 'minimal', 'dark']
  
  -- Access Control
  is_premium BOOLEAN NOT NULL DEFAULT false,
  required_tier TEXT CHECK (required_tier IN ('free', 'pro_199', 'empire_799')),
  
  -- Metadata
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  uses INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Everyone can view free blocks
CREATE POLICY "Anyone can view free blocks" ON public.blocks
  FOR SELECT USING (is_premium = false);

-- Premium users can view premium blocks
CREATE POLICY "Premium users can view premium blocks" ON public.blocks
  FOR SELECT USING (
    is_premium = true AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.subscription_tier IN ('pro_199', 'empire_799')
    )
  );

-- Only admins can insert/update blocks (will be done via Edge Functions)
CREATE POLICY "Service role can manage blocks" ON public.blocks
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS blocks_vibe_embedding_idx ON public.blocks 
  USING ivfflat (vibe_embedding vector_cosine_ops);

-- Index for filtering
CREATE INDEX IF NOT EXISTS blocks_type_idx ON public.blocks(type);
CREATE INDEX IF NOT EXISTS blocks_tags_idx ON public.blocks USING GIN(tags);

-- ============================================
-- PROJECTS TABLE (User's built websites)
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Owner
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Project Details
  name TEXT NOT NULL,
  description TEXT,
  subdomain TEXT UNIQUE, -- e.g., 'mysite' -> mysite.svarnex.app
  custom_domain TEXT UNIQUE, -- User's custom domain
  
  -- Site Configuration
  blocks JSONB NOT NULL DEFAULT '[]', -- Array of block IDs and their order: [{blockId, order, customConfig}]
  global_config JSONB DEFAULT '{}', -- Global settings: theme, fonts, colors
  
  -- SEO & Meta
  meta_title TEXT,
  meta_description TEXT,
  favicon_url TEXT,
  og_image_url TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  publish_url TEXT, -- Full published URL
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_published_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own projects
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Published projects can be viewed by anyone
CREATE POLICY "Anyone can view published projects" ON public.projects
  FOR SELECT USING (is_published = true);

-- Index for user's projects
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS projects_subdomain_idx ON public.projects(subdomain);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_blocks_updated_at
  BEFORE UPDATE ON public.blocks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to search blocks by vibe embedding
CREATE OR REPLACE FUNCTION search_blocks_by_vibe(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  description TEXT,
  code TEXT,
  config JSONB,
  tags TEXT[],
  is_premium BOOLEAN,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    blocks.id,
    blocks.type,
    blocks.name,
    blocks.description,
    blocks.code,
    blocks.config,
    blocks.tags,
    blocks.is_premium,
    1 - (blocks.vibe_embedding <=> query_embedding) AS similarity
  FROM public.blocks
  WHERE 
    (filter_type IS NULL OR blocks.type = filter_type)
    AND 1 - (blocks.vibe_embedding <=> query_embedding) > match_threshold
  ORDER BY blocks.vibe_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to increment block usage stats
CREATE OR REPLACE FUNCTION increment_block_usage(block_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.blocks
  SET uses = uses + 1
  WHERE id = block_id;
END;
$$;

-- Function to check user credits
CREATE OR REPLACE FUNCTION has_credits(user_id UUID, required_credits INT DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  user_credits INT;
BEGIN
  SELECT credits INTO user_credits
  FROM public.users
  WHERE id = user_id;
  
  RETURN user_credits >= required_credits;
END;
$$;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INT DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  user_credits INT;
BEGIN
  SELECT credits INTO user_credits
  FROM public.users
  WHERE id = user_id;
  
  IF user_credits >= amount THEN
    UPDATE public.users
    SET credits = credits - amount
    WHERE id = user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert sample blocks (You can run this after setting up OpenAI embeddings)
-- INSERT INTO public.blocks (type, name, description, code, config, tags, is_premium) VALUES
-- ('hero', 'Luxury Hero', 'High-end hero section with 3D elements', '...code...', '{"title": "Welcome"}', ARRAY['luxury', 'dark', '3d'], false),
-- ('pricing', 'SaaS Pricing', 'Clean pricing table', '...code...', '{"plans": []}', ARRAY['minimal', 'saas'], false);

-- ============================================
-- COMPLETE! 
-- ============================================
-- Next steps:
-- 1. Enable pgvector extension in Supabase dashboard
-- 2. Run this script in SQL Editor
-- 3. Configure environment variables in your app
-- 4. Test with sample data
