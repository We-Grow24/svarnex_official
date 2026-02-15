# Quick Start: Testing Payment System

Follow these steps to test the payment integration locally.

---

## 1. Install Dependencies

```bash
npm install razorpay stripe
```

## 2. Create `.env.local`

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (existing)
OPENAI_API_KEY=your-openai-key

# Razorpay Test Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=test_webhook_secret

# Stripe Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get test keys from:
- Razorpay: https://dashboard.razorpay.com/app/keys (use Test Mode)
- Stripe: https://dashboard.stripe.com/test/apikeys

## 3. Run Database Migration

```bash
# Using psql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/005_add_subscriptions.sql

# OR paste SQL into Supabase Dashboard → SQL Editor
```

## 4. Start Dev Server

```bash
npm run dev
```

## 5. Test Premium Gate

### Option A: Use Block Library Component

```tsx
// In any page
import BlockLibrary from '@/components/blocks/block-library';

export default function TestPage() {
  return (
    <BlockLibrary 
      onAddBlock={(block) => console.log('Added:', block)}
    />
  );
}
```

### Option B: Manual Integration

```tsx
'use client';

import { usePremiumGate } from '@/hooks/use-premium-gate';
import PaymentModal from '@/components/payment/payment-modal';

export default function TestPage() {
  const {
    checkPremiumAccess,
    isPaymentModalOpen,
    requiredTier,
    closePaymentModal,
  } = usePremiumGate();

  const testPremiumBlock = {
    name: 'Premium Hero',
    is_premium: true,
    required_tier: 'Pro',
  };

  const handleClick = () => {
    const hasAccess = checkPremiumAccess(
      testPremiumBlock.is_premium,
      testPremiumBlock.required_tier,
      testPremiumBlock.name
    );

    if (hasAccess) {
      alert('You have access!');
    }
    // PaymentModal opens automatically if no access
  };

  return (
    <div className="p-8">
      <button
        onClick={handleClick}
        className="px-6 py-3 bg-purple-500 text-white rounded-lg"
      >
        Try Premium Block
      </button>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        requiredTier={requiredTier || 'Pro'}
        blockName="Premium Hero"
      />
    </div>
  );
}
```

## 6. Test Payment Flow

### Razorpay Test Card
- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: `12/25`
- OTP: `1234` (for test mode)

### Stripe Test Card
- Card Number: `4242 4242 4242 4242`
- CVV: `123`
- Expiry: `12/25`
- ZIP: `12345`

## 7. Verify Database

After successful payment, check:

```sql
-- Check user tier
SELECT id, email, subscription_tier, subscription_updated_at
FROM users
WHERE email = 'your-test-email@example.com';

-- Check transactions
SELECT *
FROM transactions
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

## 8. Test Webhook (Optional)

### Stripe CLI (recommended)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/payment

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

### Without CLI

Use Razorpay/Stripe dashboard webhook testing tools.

---

## Quick Troubleshooting

### "User is null"
→ Make sure you're logged in with authenticated user

### "Payment modal not opening"
→ Check `is_premium: true` and `required_tier: 'Pro'` on block

### "Webhook not updating tier"
→ Check webhook secret matches in `.env.local`

### "Supabase error on create-order"
→ Run the migration script first

---

## Example: Add to Existing Dashboard

```tsx
// app/(app)/dashboard/page.tsx

'use client';

import { usePremiumGate } from '@/hooks/use-premium-gate';
import PaymentModal from '@/components/payment/payment-modal';
import { useBlockEditor } from '@/lib/store/block-editor';

export default function DashboardPage() {
  const { blocks, selectBlock } = useBlockEditor();
  const {
    checkPremiumAccess,
    isPaymentModalOpen,
    requiredTier,
    blockedBlockName,
    closePaymentModal,
  } = usePremiumGate();

  const handleBlockClick = (block) => {
    // Check premium access before opening edit panel
    const hasAccess = checkPremiumAccess(
      block.is_premium || false,
      block.required_tier || 'Free',
      block.name
    );

    if (hasAccess) {
      selectBlock(block); // Open edit panel
    }
  };

  return (
    <>
      {/* Your existing dashboard UI */}
      
      {/* Add PaymentModal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        requiredTier={requiredTier || 'Pro'}
        blockName={blockedBlockName || undefined}
      />
    </>
  );
}
```

**That's it!** Your payment system is ready to test.
