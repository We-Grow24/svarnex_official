# Payment Integration System

Complete Razorpay/Stripe payment integration with premium block gating.

---

## 🏗️ Architecture overview

### Payment Flow

```
User clicks Premium Block
  ↓
usePremiumGate.checkPremiumAccess()
  ↓
Check user.subscription_tier
  ↓
If tier insufficient → Open PaymentModal
  ↓
User selects plan (Pro/Enterprise)
  ↓
Auto-detect location → Razorpay (India) / Stripe (International)
  ↓
Create Order/Session via /api/payments/create-order
  ↓
Razorpay Checkout / Stripe Checkout
  ↓
Payment Success
  ↓
Webhook → /api/webhooks/payment
  ↓
Update users.subscription_tier
  ↓
Log transaction in transactions table
  ↓
User gains access to premium blocks
```

---

## 📁 Files Created

### Payment Providers
- [lib/payments/razorpay.ts](lib/payments/razorpay.ts) - Razorpay configuration & helpers
- [lib/payments/stripe.ts](lib/payments/stripe.ts) - Stripe configuration & helpers
- [lib/payments/types.ts](lib/payments/types.ts) - Pricing plans & types

### Components
- [components/payment/payment-modal.tsx](components/payment/payment-modal.tsx) - Generic payment modal
- [components/blocks/block-library.tsx](components/blocks/block-library.tsx) - Block library with premium gating

### Hooks
- [hooks/use-premium-gate.ts](hooks/use-premium-gate.ts) - Premium access control
- [lib/hooks/use-user.ts](lib/hooks/use-user.ts) - User data & subscription tier

### API Routes
- [app/api/payments/create-order/route.ts](app/api/payments/create-order/route.ts) - Create payment order/session
- [app/api/payments/verify/route.ts](app/api/payments/verify/route.ts) - Verify Razorpay signature
- [app/api/webhooks/payment/route.ts](app/api/webhooks/payment/route.ts) - Generic webhook handler

### Database
- [supabase/migrations/005_add_subscriptions.sql](supabase/migrations/005_add_subscriptions.sql) - Subscription schema

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install razorpay stripe
```

### 2. Environment Variables

Copy [.env.local.example](.env.local.example) to `.env.local` and fill in:

```env
# Razorpay (Get from https://dashboard.razorpay.com/app/keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxx

# Stripe (Get from https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migration

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/migrations/005_add_subscriptions.sql
```

Or use Supabase Dashboard → SQL Editor and paste the migration.

### 4. Configure Webhooks

#### Razorpay
1. Go to https://dashboard.razorpay.com/app/webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/payment`
3. Subscribe to: `payment.captured`
4. Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

#### Stripe
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/payment`
3. Subscribe to: `checkout.session.completed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

**Local Testing**: Use Stripe CLI or Razorpay webhook testing tools.

---

## 💰 Pricing Plans

### Free Plan
- 5 Projects
- 100 AI Credits/month
- Basic Blocks only
- Community Support

### Pro Plan
- **₹199/month** or **$9.99/month**
- **₹1,999/year** or **$99.99/year** (save 17%)
- Unlimited Projects
- 1,000 AI Credits/month
- **All Premium Blocks** ✨
- Custom Domain
- Priority Support
- Remove Svarnex Branding

### Enterprise Plan
- **₹499/month** or **$24.99/month**
- **₹4,999/year** or **$249.99/year** (save 17%)
- Everything in Pro
- **Unlimited AI Credits**
- White Label Solution
- API Access
- Dedicated Support
- Custom Integrations
- SLA Guarantee

---

## 🔐 Premium Gating Usage

### Basic Example

```tsx
import { usePremiumGate } from '@/hooks/use-premium-gate';
import PaymentModal from '@/components/payment/payment-modal';

function MyComponent() {
  const {
    checkPremiumAccess,
    isPaymentModalOpen,
    requiredTier,
    closePaymentModal,
  } = usePremiumGate();

  const handleAddBlock = (block) => {
    // Check if user has access
    const hasAccess = checkPremiumAccess(
      block.is_premium,
      block.required_tier,
      block.name
    );

    if (hasAccess) {
      // User can add the block
      addBlockToProject(block);
    }
    // If no access, PaymentModal opens automatically
  };

  return (
    <>
      <button onClick={() => handleAddBlock(premiumBlock)}>
        Add Premium Block
      </button>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        requiredTier={requiredTier || 'Pro'}
      />
    </>
  );
}
```

### Check Current Tier

```tsx
const { getCurrentTier, canAccessPro, canAccessEnterprise } = usePremiumGate();

const tier = getCurrentTier(); // 'Free' | 'Pro' | 'Enterprise'

if (canAccessPro()) {
  // Show Pro features
}

if (canAccessEnterprise()) {
  // Show Enterprise features
}
```

### Manual Access Check

```tsx
const { hasAccess } = usePremiumGate();

if (hasAccess('Pro')) {
  // User has Pro or higher
}

if (hasAccess('Enterprise')) {
  // User has Enterprise
}
```

---

## 🎫 Payment Modal Features

### Auto-Detection
- Detects user location via IP
- India → Razorpay (₹ INR)
- Others → Stripe ($ USD)

### Manual Switch
Users can toggle between Razorpay and Stripe:
```tsx
<button onClick={() => setProvider('razorpay')}>
  Pay with Razorpay (₹)
</button>
<button onClick={() => setProvider('stripe')}>
  Pay with Stripe ($)
</button>
```

### Plan Selection
- Monthly vs Yearly billing
- Shows savings on yearly plans (17% off = 2 months free)
- Most popular plan highlighted

### Features Display
Each plan shows:
- Price in selected currency
- Billing cycle
- Feature list with checkmarks
- Tier badge (Pro/Enterprise)

---

## 🔄 Webhook Processing

### Razorpay Webhook

**Event**: `payment.captured`

**Payload**:
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxx",
        "order_id": "order_xxxxx",
        "amount": 19900,
        "currency": "INR"
      }
    }
  }
}
```

**Processing**:
1. Verify webhook signature with HMAC SHA256
2. Fetch order to get user metadata
3. Update `users.subscription_tier`
4. Insert transaction record
5. Return 200 OK

### Stripe Webhook

**Event**: `checkout.session.completed`

**Payload**:
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_xxxxx",
      "payment_intent": "pi_xxxxx",
      "amount_total": 999,
      "currency": "usd",
      "metadata": {
        "user_id": "uuid",
        "tier": "Pro",
        "plan": "PRO_MONTHLY"
      }
    }
  }
}
```

**Processing**:
1. Verify webhook signature using Stripe SDK
2. Extract metadata from session
3. Update `users.subscription_tier`
4. Insert transaction record
5. Return 200 OK

---

## 🗄️ Database Schema

### users table (new columns)

```sql
ALTER TABLE users
ADD COLUMN subscription_tier TEXT DEFAULT 'Free' CHECK (subscription_tier IN ('Free', 'Pro', 'Enterprise')),
ADD COLUMN subscription_updated_at TIMESTAMPTZ,
ADD COLUMN payment_provider TEXT CHECK (payment_provider IN ('razorpay', 'stripe')),
ADD COLUMN last_payment_id TEXT;
```

### transactions table (new)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider TEXT CHECK (provider IN ('razorpay', 'stripe')),
  transaction_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('Pro', 'Enterprise')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### blocks table (new columns)

```sql
ALTER TABLE blocks
ADD COLUMN is_premium BOOLEAN DEFAULT false,
ADD COLUMN required_tier TEXT DEFAULT 'Free' CHECK (required_tier IN ('Free', 'Pro', 'Enterprise'));
```

---

## 🧪 Testing

### Test Mode Keys

Both Razorpay and Stripe provide test mode:

**Razorpay Test Cards**:
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Stripe Test Cards**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

### Local Webhook Testing

**Stripe CLI**:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/payment
stripe trigger checkout.session.completed
```

**Razorpay**:
Use Razorpay Dashboard → Webhooks → Test Webhook

### Manual Testing Flow

1. Create test user with `subscription_tier = 'Free'`
2. Navigate to block library
3. Click a premium block → PaymentModal opens
4. Select a plan
5. Complete test payment
6. Verify webhook is received
7. Check `users.subscription_tier` updated
8. Check `transactions` table has record
9. Verify user can now add premium blocks

---

## 🔒 Security Best Practices

### Webhook Verification

**Always verify webhook signatures**:

```typescript
// Razorpay
const isValid = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(body)
  .digest('hex') === signature;

// Stripe
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

### Environment Variables

- Never commit secrets to Git
- Use different keys for test/production
- Rotate keys periodically
- Use Vercel/Railway secret management in production

### Database Security

- Use Row Level Security (RLS) on Supabase
- Service role key only on server-side
- Validate user IDs match authenticated user
- Log all transactions for audit trail

---

## 🚀 Production Checklist

### Before Launch

- [ ] Switch to live API keys (remove `test_`)
- [ ] Update webhook URLs to production domain
- [ ] Enable webhook signature verification
- [ ] Test with real payment (small amount)
- [ ] Verify transactions logged correctly
- [ ] Test refund flow
- [ ] Set up payment failure monitoring
- [ ] Add error tracking (Sentry)
- [ ] Configure email notifications on payment

### Razorpay Live Mode

1. Complete KYC verification on Razorpay
2. Switch to live keys on dashboard
3. Update `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
4. Test with small real payment

### Stripe Live Mode

1. Activate account on Stripe
2. Switch to live keys on dashboard
3. Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`
4. Add business details and bank account
5. Test with small real payment

---

## 📊 Analytics & Monitoring

### Track Key Metrics

```typescript
// Log to analytics service
analytics.track('payment_initiated', {
  provider: 'razorpay',
  plan: 'PRO_MONTHLY',
  amount: 19900,
  currency: 'INR',
});

analytics.track('payment_success', {
  provider: 'razorpay',
  plan: 'PRO_MONTHLY',
  tier: 'Pro',
  transaction_id: 'pay_xxxxx',
});

analytics.track('payment_failed', {
  provider: 'razorpay',
  error: 'card_declined',
});
```

### Monitor Webhooks

```typescript
// In webhook handler
console.log(`✅ ${provider} payment successful for user ${userId} - Tier: ${tier}`);

// Set up alerts for:
// - Failed webhook deliveries
// - Payment errors > 5%
// - Unusual payment amounts
// - Duplicate transactions
```

### Query Transaction Data

```sql
-- Total revenue by provider
SELECT 
  provider,
  currency,
  SUM(amount) / 100 as total,
  COUNT(*) as count
FROM transactions
WHERE status = 'completed'
GROUP BY provider, currency;

-- Conversion rate by tier
SELECT 
  tier,
  COUNT(*) as purchases,
  AVG(amount) / 100 as avg_amount
FROM transactions
WHERE status = 'completed'
GROUP BY tier;

-- Recent upgrades
SELECT 
  u.email,
  u.subscription_tier,
  t.amount / 100 as amount,
  t.currency,
  t.created_at
FROM users u
JOIN transactions t ON t.user_id = u.id
WHERE t.status = 'completed'
ORDER BY t.created_at DESC
LIMIT 10;
```

---

## 🛟 Troubleshooting

### Payment Not Completing

**Check**:
1. Browser console for errors
2. Network tab for failed API calls
3. Webhook logs in Razorpay/Stripe dashboard
4. Database logs for transaction inserts
5. Environment variables are correct

### Webhook Not Firing

**Solutions**:
1. Verify webhook URL is publicly accessible
2. Check webhook signature verification
3. Test with provider's webhook testing tool
4. Check server logs for incoming requests
5. Ensure HTTPS in production

### User Tier Not Updating

**Debug**:
```typescript
// Add logging in webhook handler
console.log('Webhook received:', {
  provider,
  userId,
  tier,
  transactionId,
});

// Check database update result
const { data, error } = await supabase
  .from('users')
  .update({ subscription_tier: tier })
  .eq('id', userId);

console.log('Database update:', { data, error });
```

### Premium Gate Not Working

**Verify**:
1. User data loaded: `console.log(user)`
2. Block data correct: `console.log(block.is_premium, block.required_tier)`
3. hasAccess logic: `console.log(hasAccess('Pro'))`
4. Modal state: `console.log(isPaymentModalOpen)`

---

## 📞 Support

### Razorpay
- Docs: https://razorpay.com/docs/
- Support: https://razorpay.com/support/

### Stripe
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com/

### Svarnex Issues
- GitHub: [Create Issue](https://github.com/yourusername/svarnex/issues)
- Email: support@svarnex.com

---

**Status**: ✅ Payment system complete and ready for testing  
**Last Updated**: February 16, 2026  
**Next Step**: Run migration, configure API keys, test with test cards
