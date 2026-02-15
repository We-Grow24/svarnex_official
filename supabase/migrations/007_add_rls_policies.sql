-- Add strict Row Level Security (RLS) policies
-- Ensures users can ONLY access their own data

-- ============================================
-- TRANSACTIONS TABLE - RLS POLICIES
-- ============================================

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users cannot insert transactions directly (only via API/webhooks)
CREATE POLICY "Service role can insert transactions" ON transactions
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Users cannot update transactions
CREATE POLICY "Service role can update transactions" ON transactions
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

-- Users cannot delete transactions (audit trail)
CREATE POLICY "No one can delete transactions" ON transactions
  FOR DELETE USING (false);

-- ============================================
-- FACTORY_LOGS TABLE - RLS POLICIES
-- ============================================

-- Enable RLS on factory_logs table
ALTER TABLE factory_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for factory stats (monitoring)
CREATE POLICY "Anyone can view factory logs" ON factory_logs
  FOR SELECT USING (true);

-- Only service role (cron job) can insert logs
CREATE POLICY "Service role can insert factory logs" ON factory_logs
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- No one can update or delete factory logs (immutable audit trail)
CREATE POLICY "No one can update factory logs" ON factory_logs
  FOR UPDATE USING (false);

CREATE POLICY "No one can delete factory logs" ON factory_logs
  FOR DELETE USING (false);

-- ============================================
-- ENHANCED BLOCKS TABLE POLICIES
-- ============================================

-- Drop existing policies to recreate with stricter rules
DROP POLICY IF EXISTS "Anyone can view free blocks" ON blocks;
DROP POLICY IF EXISTS "Premium users can view premium blocks" ON blocks;
DROP POLICY IF EXISTS "Service role can manage blocks" ON blocks;

-- Public can view free blocks
CREATE POLICY "Users can view free blocks" ON blocks
  FOR SELECT USING (is_premium = false OR is_premium IS NULL);

-- Authenticated users with Pro/Empire can view premium blocks
CREATE POLICY "Premium users can view premium blocks" ON blocks
  FOR SELECT USING (
    is_premium = true 
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.subscription_tier IN ('pro_199', 'empire_799')
    )
  );

-- Only service role can insert/update/delete blocks
CREATE POLICY "Service role can insert blocks" ON blocks
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can update blocks" ON blocks
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can delete blocks" ON blocks
  FOR DELETE USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- ENHANCED PROJECTS TABLE POLICIES
-- ============================================

-- Ensure stricter project ownership
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Anyone can view published projects" ON projects;

-- Users can ONLY view their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create projects (with ownership check)
CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Users can ONLY update their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can ONLY delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Public can view published projects (via subdomain/custom domain)
CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT USING (
    is_published = true 
    AND (subdomain IS NOT NULL OR custom_domain IS NOT NULL)
  );

-- ============================================
-- ENHANCED USERS TABLE POLICIES
-- ============================================

-- Ensure users can ONLY see their own data
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Users can ONLY view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can ONLY update their own profile
-- Note: Subscription fields are protected via API routes, not RLS
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can update subscription fields
CREATE POLICY "Service role can update user subscriptions" ON users
  FOR UPDATE USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- SECURITY FUNCTIONS
-- ============================================

-- Function to check if user owns a project
CREATE OR REPLACE FUNCTION user_owns_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION user_has_premium()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND subscription_tier IN ('pro_199', 'empire_799')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's tier
CREATE OR REPLACE FUNCTION get_user_tier()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT subscription_tier FROM users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Add missing indexes for RLS queries
CREATE INDEX IF NOT EXISTS idx_projects_user_published ON projects(user_id, is_published);
CREATE INDEX IF NOT EXISTS idx_blocks_premium ON blocks(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(id, subscription_tier);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Users can view own transactions" ON transactions IS 
  'Users can only view their own payment history';

COMMENT ON POLICY "Service role can insert transactions" ON transactions IS 
  'Only payment webhooks (service role) can create transaction records';

COMMENT ON POLICY "Anyone can view factory logs" ON factory_logs IS 
  'Factory logs are publicly viewable for transparency';

COMMENT ON POLICY "Users can view own projects" ON projects IS 
  'Users can ONLY view projects they created';

COMMENT ON POLICY "Public can view published projects" ON projects IS 
  'Published projects with subdomain/custom domain are publicly accessible';

COMMENT ON FUNCTION user_owns_project(UUID) IS 
  'Security function to verify project ownership';

COMMENT ON FUNCTION user_has_premium() IS 
  'Security function to check if current user has premium subscription';
