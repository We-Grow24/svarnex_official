-- Add subscription fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro_199', 'empire_799')),
ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_provider TEXT CHECK (payment_provider IN ('razorpay', 'stripe')),
ADD COLUMN IF NOT EXISTS last_payment_id TEXT;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
  transaction_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro_199', 'empire_799')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- Add premium field to blocks table (if it doesn't exist)
ALTER TABLE blocks
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS required_tier TEXT DEFAULT 'free' CHECK (required_tier IN ('free', 'pro_199', 'empire_799'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transactions table
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample premium blocks
INSERT INTO blocks (name, type, description, code, is_premium, required_tier, config)
VALUES
  (
    'Premium Hero Section', 
    'hero', 
    'Advanced hero section with animated gradients',
    'export default function PremiumHero() { return <section className="relative h-screen"><div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900"></div><div className="relative z-10 flex items-center justify-center h-full"><h1 className="text-6xl font-bold text-white">Premium Hero</h1></div></section> }',
    true, 
    'pro_199', 
    '{"title": "Premium Hero", "subtitle": "Unlock with Pro"}'
  ),
  (
    'Advanced CTA Section', 
    'cta', 
    'Call-to-action with glassmorphism design',
    'export default function AdvancedCTA() { return <section className="py-20 px-4"><div className="max-w-4xl mx-auto"><div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10"><h2 className="text-4xl font-bold text-white text-center mb-6">Ready to Get Started?</h2><p className="text-white/80 text-center mb-8">Join thousands of developers building amazing projects</p><div className="flex justify-center"><button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-bold">Get Started</button></div></div></div></section> }',
    true,
    'pro_199', 
    '{"heading": "Premium CTA", "buttonText": "Get Started"}'
  ),
  (
    'Testimonials Carousel', 
    'testimonials', 
    'Premium testimonials with carousel animation',
    'export default function TestimonialsCarousel() { return <section className="py-20 px-4 bg-gray-900"><div className="max-w-6xl mx-auto"><h2 className="text-4xl font-bold text-white text-center mb-12">What Our Clients Say</h2><div className="grid md:grid-cols-3 gap-8">{[1,2,3].map(i => <div key={i} className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"><p className="text-white mb-4">Amazing service!</p><p className="text-white/60">- Client {i}</p></div>)}</div></div></section> }',
    true, 
    'pro_199', 
    '{"testimonials": []}'
  ),
  (
    'Enterprise Pricing Table', 
    'pricing', 
    'Advanced pricing table with comparison features',
    'export default function EnterprisePricing() { return <section className="py-20 px-4"><div className="max-w-7xl mx-auto"><h2 className="text-4xl font-bold text-white text-center mb-12">Pricing Plans</h2><div className="grid md:grid-cols-3 gap-8">{["Free", "Pro", "Enterprise"].map(tier => <div key={tier} className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-8 border border-purple-500/30"><h3 className="text-2xl font-bold text-white mb-4">{tier}</h3><div className="text-4xl font-bold text-white mb-6">$99</div><button className="w-full py-3 bg-purple-500 rounded-lg text-white font-bold">Choose Plan</button></div>)}</div></div></section> }',
    true, 
    'empire_799', 
    '{"tiers": []}'
  ),
  (
    'Enterprise Contact Form', 
    'contact', 
    'Advanced contact form with validation',
    'export default function EnterpriseContact() { return <section className="py-20 px-4 bg-gray-900"><div className="max-w-2xl mx-auto"><h2 className="text-4xl font-bold text-white text-center mb-12">Contact Us</h2><form className="space-y-4"><input type="text" placeholder="Name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white" /><input type="email" placeholder="Email" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white" /><textarea placeholder="Message" rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"></textarea><button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-bold">Send Message</button></form></div></section> }',
    true, 
    'empire_799', 
    '{"fields": []}'
  )
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON blocks TO authenticated;

COMMENT ON TABLE transactions IS 'Stores payment transaction history';
COMMENT ON COLUMN users.subscription_tier IS 'User subscription level: free, pro_199, or empire_799';
COMMENT ON COLUMN blocks.is_premium IS 'Whether this block requires a paid subscription';
COMMENT ON COLUMN blocks.required_tier IS 'Minimum subscription tier required to use this block: free, pro_199, or empire_799';
