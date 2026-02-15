# 💳 Payment System - Complete Guide

> Razorpay + Stripe integration with premium block gating for Svarnex

---

## 📚 Quick Navigation

- **🚀 Quick Setup**: [PAYMENT_QUICKSTART.md](PAYMENT_QUICKSTART.md) - Get started in 15 minutes
- **📖 Full Documentation**: [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md) - Complete technical reference
- **📝 Implementation Details**: [PAYMENT_SUMMARY.md](PAYMENT_SUMMARY.md) - What was built and how

---

## ⚡ Quick Start (5 Steps)

### 1. Install Dependencies
```bash
npm install razorpay stripe
```

### 2. Setup Environment
Create `.env.local`:
```env
# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get test keys:
- Razorpay: https://dashboard.razorpay.com/app/keys (Test Mode)
- Stripe: https://dashboard.stripe.com/test/apikeys

### 3. Run Migration
```bash
# Option A: Using psql
psql -h your-db-host -U postgres -f supabase/migrations/005_add_subscriptions.sql

# Option B: In Supabase Dashboard
# Go to SQL Editor → Paste migration content → Run
```

### 4. Test Payment Flow
```tsx
import { usePremiumGate } from '@/hooks/use-premium-gate';
import PaymentModal from '@/components/payment/payment-modal';

export default function TestPage() {
  const {
    checkPremiumAccess,
    isPaymentModalOpen,
    requiredTier,
    closePaymentModal,
  } = usePremiumGate();

  return (
    <>
      <button onClick={() => {
        checkPremiumAccess(true, 'Pro', 'Premium Block');
      }}>
        Try Premium Feature
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

### 5. Test with Test Cards

**Razorpay**:
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: `12/25`

**Stripe**:
- Card: `4242 4242 4242 4242`
- CVV: `123`
- Expiry: `12/25`

---

## 💰 Pricing Tiers

| Tier | Price (INR) | Price (USD) | Features |
|------|-------------|-------------|----------|
| **Free** | ₹0 | $0 | • 5 Projects<br>• 100 AI Credits/month<br>• Basic Blocks<br>• Community Support |
| **Pro** | ₹199/mo<br>₹1,999/yr | $9.99/mo<br>$99.99/yr | • Unlimited Projects<br>• 1,000 AI Credits/month<br>• **All Premium Blocks**<br>• Custom Domain<br>• Priority Support<br>• Remove Branding |
| **Enterprise** | ₹499/mo<br>₹4,999/yr | $24.99/mo<br>$249.99/yr | • Everything in Pro<br>• **Unlimited AI Credits**<br>• White Label<br>• API Access<br>• Dedicated Support<br>• Custom Integrations<br>• SLA Guarantee |

*Yearly plans save 17% (2 months free)*

---

## 🏗️ Architecture

```
User Clicks Premium Block
    ↓
usePremiumGate.checkPremiumAccess()
    ↓
Check user.subscription_tier in Supabase
    ↓
If insufficient → Open PaymentModal
    ↓
Auto-detect location (IP geolocation)
    ├─ India → Razorpay
    └─ Others → Stripe
    ↓
Create order/session (POST /api/payments/create-order)
    ↓
Complete payment via provider
    ↓
Webhook receives event (POST /api/webhooks/payment)
    ├─ Razorpay: payment.captured
    └─ Stripe: checkout.session.completed
    ↓
Verify signature
    ↓
Update users.subscription_tier
    ↓
Log to transactions table
    ↓
User gains access to premium features ✨
```

---

## 🔑 Key Files

### Payment Logic
- `lib/payments/razorpay.ts` - Razorpay client & order creation
- `lib/payments/stripe.ts` - Stripe client & checkout sessions
- `lib/payments/types.ts` - Pricing plans & type definitions

### UI Components
- `components/payment/payment-modal.tsx` - Payment modal with provider selection
- `components/blocks/block-library.tsx` - Example of premium gating in action

### Access Control
- `hooks/use-premium-gate.ts` - Premium feature gating logic
- `lib/hooks/use-user.ts` - User data & subscription tier fetching

### API Routes
- `app/api/payments/create-order/route.ts` - Create Razorpay order or Stripe session
- `app/api/payments/verify/route.ts` - Verify Razorpay payment signature
- `app/api/webhooks/payment/route.ts` - **Main webhook** (handles both providers)

### Database
- `supabase/migrations/005_add_subscriptions.sql` - Schema for subscriptions & transactions

---

## 🎯 Usage Patterns

### Pattern 1: Gate a Premium Feature
```tsx
const { checkPremiumAccess } = usePremiumGate();

function addPremiumBlock(block) {
  const hasAccess = checkPremiumAccess(
    block.is_premium,
    block.required_tier,
    block.name
  );
  
  if (hasAccess) {
    // User has access - proceed
    addToProject(block);
  }
  // PaymentModal opens automatically if no access
}
```

### Pattern 2: Check Tier Level
```tsx
const { hasAccess, getCurrentTier } = usePremiumGate();

if (hasAccess('Pro')) {
  // User is Pro or higher
}

if (hasAccess('Enterprise')) {
  // User is Enterprise
}

const tier = getCurrentTier(); // 'Free' | 'Pro' | 'Enterprise'
```

### Pattern 3: Manual Modal Control
```tsx
const {
  isPaymentModalOpen,
  requiredTier,
  closePaymentModal,
} = usePremiumGate();

<PaymentModal
  isOpen={isPaymentModalOpen}
  onClose={closePaymentModal}
  requiredTier={requiredTier || 'Pro'}
  blockName="Advanced Hero Block"
/>
```

---

## 🔒 Security Features

✅ **Webhook Signature Verification**
- Razorpay: HMAC SHA256 signature validation
- Stripe: Webhook signature verification via SDK

✅ **Server-Side Validation**
- All payment verification happens server-side
- No client-side price manipulation possible

✅ **Environment Variable Protection**
- API secrets never exposed to client
- Different keys for test/production

✅ **Transaction Logging**
- Complete audit trail in `transactions` table
- Status tracking (pending, completed, failed, refunded)

✅ **Database Security**
- Row Level Security (RLS) ready
- Service role key only on server

---

## 🧪 Testing Checklist

- [ ] Install razorpay and stripe packages
- [ ] Configure `.env.local` with test keys
- [ ] Run database migration
- [ ] Start dev server
- [ ] Test Razorpay payment flow
- [ ] Test Stripe payment flow
- [ ] Verify webhook updates `users.subscription_tier`
- [ ] Check `transactions` table has records
- [ ] Test premium gate blocks Free users
- [ ] Test Pro users can access Pro features
- [ ] Test modal opens/closes correctly
- [ ] Test provider toggle (Razorpay ↔ Stripe)
- [ ] Test yearly vs monthly plans
- [ ] Verify error handling

---

## 🐛 Common Issues

### "Cannot find module 'razorpay'"
**Fix**: Run `npm install razorpay stripe`

### "User subscription tier not updating"
**Fix**: 
1. Check webhook secret in `.env.local` matches dashboard
2. Verify webhook URL is correct
3. Check webhook logs in Razorpay/Stripe dashboard

### "PaymentModal not opening"
**Fix**: 
1. Ensure `checkPremiumAccess()` is called with correct params
2. Check `is_premium: true` on block
3. Verify user is logged in

### "Database error on payment"
**Fix**: Run the migration script first

### "Webhook signature invalid"
**Fix**: 
1. Copy exact webhook secret from dashboard
2. Don't include quotes in `.env.local`
3. Restart dev server after changing env vars

---

## 📞 Support & Resources

### Documentation
- 📖 [Full Integration Guide](PAYMENT_INTEGRATION.md)
- 🚀 [Quick Start Guide](PAYMENT_QUICKSTART.md)
- 📝 [Implementation Summary](PAYMENT_SUMMARY.md)

### Provider Docs
- 🟦 [Razorpay Documentation](https://razorpay.com/docs/)
- 🟪 [Stripe Documentation](https://stripe.com/docs)

### Test Tools
- Razorpay Dashboard: https://dashboard.razorpay.com/
- Stripe Dashboard: https://dashboard.stripe.com/
- Stripe CLI: `brew install stripe/stripe-cli/stripe`

### Getting Help
- GitHub Issues: [Create an issue](https://github.com/yourusername/svarnex/issues)
- Email: support@svarnex.com

---

## 🚀 Production Deployment

Before going live:

1. **Switch to Live Keys**
   - Remove `test_` prefix from API keys
   - Update webhook secrets

2. **Update Webhook URLs**
   - Change from `localhost:3000` to production domain
   - Must be HTTPS

3. **Test with Real Payment**
   - Use small amount (₹1 or $0.50)
   - Verify full flow works

4. **Enable Monitoring**
   - Set up error tracking (Sentry)
   - Monitor webhook delivery
   - Track payment metrics

5. **Add Email Notifications**
   - Payment success email
   - Payment failure email
   - Invoice generation

---

## 📊 What's Next?

After payment integration, consider adding:

- **Subscription Management**: Allow users to upgrade/downgrade
- **Usage Tracking**: Monitor AI credits consumption
- **Billing Portal**: Self-service subscription management
- **Refund Flow**: Handle refund requests
- **Invoice System**: Generate PDF invoices
- **Team Billing**: Support multiple users per subscription
- **Analytics**: Track conversion rates and revenue

---

**Status**: ✅ **READY FOR TESTING**

**Setup Time**: ~15 minutes

**Files Created**: 14 files (2,500+ lines)

**Documentation**: Complete

---

Made with ⚡ by Svarnex Team
