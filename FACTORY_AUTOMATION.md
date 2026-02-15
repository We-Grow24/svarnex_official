# Factory Automation System - Automated Block Generation

The **Factory** is Svarnex's autonomous AI engine that continuously generates new website blocks in the background.

---

## 🏭 Overview

The Factory runs as a **Vercel Cron Job** that triggers every **15 minutes**, automatically:
1. Selects a random block category (hero, navbar, pricing, etc.)
2. Chooses a random aesthetic vibe (minimal, dark, luxury, etc.)
3. Generates the block using OpenAI GPT-4
4. Validates and stores it in the database
5. Logs the result for monitoring

---

## 🗂️ Files Created

### Core Logic
1. **lib/factory/randomizer.ts** (~280 lines)
   - Random category selection (14 block types)
   - Random vibe selection (15 aesthetic styles)
   - Weighted randomization (prioritizes high-demand blocks)
   - 5 prompts per category = 1,050 unique combinations

2. **app/api/cron/generate/route.ts** (~170 lines)
   - Main cron endpoint with security
   - Verifies CRON_SECRET before execution
   - Calls generateBlock() with random parameters
   - Logs results to factory_logs table

### Configuration
3. **vercel.json** (5 lines)
   - Configures Vercel Cron to trigger every 15 minutes
   - Schedule: `*/15 * * * *` (cron syntax)

4. **.env.local.example** (updated)
   - Added CRON_SECRET environment variable

### Database
5. **supabase/migrations/006_add_factory_logs.sql** (~40 lines)
   - `factory_logs` table for execution history
   - `factory_stats` view for aggregated metrics
   - Tracks success/failure, timing, categories

### Monitoring
6. **app/api/factory/stats/route.ts** (~100 lines)
   - Public API endpoint for factory statistics
   - Returns total blocks, success rate, avg time
   - Category-wise breakdown

7. **components/factory/factory-monitor.tsx** (~350 lines)
   - Real-time dashboard component
   - Shows live factory stats
   - Auto-refreshes every 30 seconds
   - Beautiful glassmorphism UI

---

## 🔧 Setup Instructions

### 1. Generate Cron Secret

Create a secure random string for CRON_SECRET:

```bash
# Option A: Using OpenSSL
openssl rand -base64 32

# Option B: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option C: Just make up a long random string
# Example: "my-super-secret-cron-key-2026-xyz789"
```

### 2. Add to Environment Variables

In `.env.local`:
```env
CRON_SECRET=your-generated-secret-here
```

**In Vercel Dashboard**:
1. Go to Project Settings → Environment Variables
2. Add `CRON_SECRET` with the same value
3. Make sure it's available in **Production** environment

### 3. Run Database Migration

```bash
# Using psql
psql -h your-db-host -U postgres -f supabase/migrations/006_add_factory_logs.sql

# OR paste into Supabase Dashboard → SQL Editor
```

### 4. Deploy to Vercel

```bash
git add .
git commit -m "Add Factory automation"
git push

# Vercel will automatically deploy and set up the cron job
```

### 5. Verify Cron Job

In Vercel Dashboard:
1. Go to your project
2. Click **Crons** tab
3. You should see: `/api/cron/generate` scheduled for `*/15 * * * *`
4. Status should be **Active**

---

## 🎲 Randomization Logic

### Block Categories (14 total)
```typescript
[
  'hero', 'navbar', 'features', 'pricing', 'testimonials',
  'cta', 'footer', 'faq', 'contact', 'gallery',
  'team', 'stats', 'blog', 'newsletter'
]
```

### Vibes (15 total)
```typescript
[
  'minimal', 'glassmorphism', 'dark', 'luxury', 'cyberpunk',
  'neon', 'neomorphism', 'brutalist', 'gradient', 'retro',
  'modern', 'playful', 'professional', 'elegant', 'bold'
]
```

### Prompts (5 per category = 70 total)
Each block type has 5 different prompt variations. Example for hero blocks:
- "Create a hero section for a SaaS product with a compelling headline"
- "Design a hero banner for an e-commerce store"
- "Build a hero section for a tech startup with futuristic vibes"
- etc.

**Total Unique Combinations**: 14 categories × 15 vibes × 5 prompts = **1,050 possibilities**

### Weighted Selection

High-demand blocks are generated more frequently:

| Block Type | Weight | Priority |
|------------|--------|----------|
| hero | 10 | High |
| features | 10 | High |
| pricing | 9 | High |
| navbar | 8 | High |
| cta | 8 | High |
| testimonials | 7 | Medium |
| stats | 6 | Medium |
| footer | 6 | Medium |
| newsletter | 6 | Medium |
| faq | 5 | Low |
| contact | 5 | Low |
| blog | 5 | Low |
| gallery | 4 | Low |
| team | 4 | Low |

This ensures the most useful blocks are generated more often.

---

## 🔒 Security

### Secret Key Verification

The cron endpoint accepts authentication in **3 ways**:

#### 1. Authorization Header (Recommended)
```bash
curl -X POST https://yoursite.com/api/cron/generate \
  -H "Authorization: Bearer your-cron-secret"
```

#### 2. Vercel Automatic Header
Vercel automatically adds `x-vercel-cron` header when triggering cron jobs. The endpoint checks this against CRON_SECRET.

#### 3. Query Parameter (Testing only)
```bash
curl https://yoursite.com/api/cron/generate?secret=your-cron-secret
```

**⚠️ Never commit CRON_SECRET to Git!**

### Why Security Matters

Without secret key protection:
- Anyone could trigger unlimited block generations
- Could exhaust OpenAI API credits
- Could flood the database
- Could cost money in API usage

---

## 📊 Monitoring

### Factory Monitor Dashboard

Create a page to view stats:

```tsx
// app/factory-monitor/page.tsx
import FactoryMonitor from '@/components/factory/factory-monitor';

export default function FactoryMonitorPage() {
  return <FactoryMonitor />;
}
```

Visit `/factory-monitor` to see:
- Total blocks generated
- Success/failure rates
- Average generation time
- Blocks generated in last 24 hours
- Last generation details
- Category-wise breakdown

### API Endpoints

**Factory Stats** (Public):
```
GET /api/factory/stats
```

Returns:
```json
{
  "success": true,
  "stats": {
    "total_blocks_generated": 42,
    "successful": 40,
    "failed": 2,
    "success_rate_percent": 95.24,
    "avg_generation_time_ms": 15234,
    "blocks_last_24h": 96,
    "last_generation": {
      "category": "hero",
      "vibe": "glassmorphism",
      "success": true,
      "created_at": "2026-02-16T10:30:00Z"
    }
  },
  "by_category": [
    {
      "category": "hero",
      "total_generated": 12,
      "successful": 12,
      "failed": 0,
      "avg_time_ms": 14500
    }
  ]
}
```

**Cron Trigger** (Secured):
```
POST /api/cron/generate
Authorization: Bearer YOUR_CRON_SECRET
```

Returns:
```json
{
  "success": true,
  "blockId": "uuid-here",
  "category": "pricing",
  "vibe": "dark",
  "prompt": "Create a pricing table with three tiers",
  "duration_ms": 15234,
  "message": "Successfully generated pricing block with dark vibe"
}
```

---

## 🧪 Testing

### Manual Trigger (Local)

```bash
# Using curl
curl "http://localhost:3000/api/cron/generate?secret=your-cron-secret"

# Using httpie
http POST localhost:3000/api/cron/generate Authorization:"Bearer your-cron-secret"
```

### Manual Trigger (Production)

```bash
curl -X POST https://yoursite.vercel.app/api/cron/generate \
  -H "Authorization: Bearer your-cron-secret"
```

### Check Logs

In Vercel Dashboard:
1. Go to **Deployments**
2. Click latest deployment
3. Go to **Runtime Logs**
4. Filter by `/api/cron/generate`

You should see:
```
🔐 Verifying cron secret...
✅ Cron secret verified
🎲 Selecting random block parameters...
📦 Selected: hero with glassmorphism vibe
📝 Prompt: "Create a hero section for a SaaS product..."
🤖 Calling AI generator...
✅ Block generated successfully in 15234ms
🆔 Block ID: abc-123-def
```

### Test Failure Cases

**Missing Secret**:
```bash
curl http://localhost:3000/api/cron/generate
# Returns 401 Unauthorized
```

**Wrong Secret**:
```bash
curl "http://localhost:3000/api/cron/generate?secret=wrong-secret"
# Returns 401 Unauthorized
```

---

## 📈 Expected Behavior

### Generation Schedule

With the cron running every 15 minutes:
- **Per Hour**: 4 blocks
- **Per Day**: 96 blocks
- **Per Week**: 672 blocks
- **Per Month**: ~2,880 blocks

### Cost Estimates (OpenAI)

Using GPT-4 Turbo:
- ~$0.01-0.03 per block generation
- **Daily**: $0.96-2.88
- **Monthly**: $28.80-86.40

**Optimization Tips**:
- Use `gpt-3.5-turbo` for cheaper generation ($0.001-0.002 per block)
- Reduce frequency (e.g., every hour instead of 15 min)
- Add block count limits per day

### Database Growth

Each factory_logs entry is ~500 bytes:
- **Per Day**: 96 × 500 bytes = 48 KB
- **Per Month**: ~1.4 MB
- **Per Year**: ~17 MB

Minimal impact on database size.

---

## 🔄 Customization

### Change Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate",
      "schedule": "0 * * * *"  // Every hour on the hour
    }
  ]
}
```

Common schedules:
- `*/15 * * * *` - Every 15 minutes (current)
- `*/30 * * * *` - Every 30 minutes
- `0 * * * *` - Every hour
- `0 */4 * * *` - Every 4 hours
- `0 0 * * *` - Once a day at midnight

### Customize Vibes

Edit `lib/factory/randomizer.ts`:

```typescript
export const VIBES = [
  'minimal',
  'glassmorphism',
  // Add your custom vibes:
  'vintage',
  'futuristic',
  'organic',
] as const;
```

### Customize Prompts

Edit `lib/factory/randomizer.ts`:

```typescript
export const BLOCK_PROMPTS: Record<BlockType, string[]> = {
  hero: [
    'Create a hero section...',
    'Your custom prompt here',
  ],
  // ...
};
```

### Adjust Weights

Edit `lib/factory/randomizer.ts`:

```typescript
export const BLOCK_WEIGHTS: Record<BlockType, number> = {
  hero: 20,  // Generate heroes twice as often
  navbar: 5, // Generate navbars less often
  // ...
};
```

---

## 🐛 Troubleshooting

### "Unauthorized - Invalid or missing CRON_SECRET"

**Fix**:
1. Check `CRON_SECRET` is set in Vercel environment variables
2. Ensure it matches your local `.env.local`
3. Redeploy after adding environment variable

### "Factory logs not appearing"

**Fix**:
1. Run the migration: `006_add_factory_logs.sql`
2. Check Supabase Dashboard → Database → Tables
3. Verify `factory_logs` table exists

### "Cron not triggering automatically"

**Fix**:
1. Check Vercel Dashboard → Crons tab
2. Ensure cron is **Active**
3. Verify you're on a **Pro** plan (Hobby plans have limited cron)
4. Check deployment logs for errors

### "OpenAI API errors"

**Fix**:
1. Verify `OPENAI_API_KEY` is set in Vercel
2. Check OpenAI API usage limits
3. Ensure billing is set up on OpenAI account
4. Check API key has correct permissions

### "Too many blocks generated"

**Fix**:
Add rate limiting to the cron endpoint:

```typescript
// In app/api/cron/generate/route.ts
const today = new Date().toISOString().split('T')[0];
const { count } = await supabase
  .from('factory_logs')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', today);

if (count >= 100) {
  return NextResponse.json({
    success: false,
    error: 'Daily limit reached (100 blocks)'
  });
}
```

---

## 📞 Support & Next Steps

### What's Working
✅ Random category selection  
✅ Random vibe selection  
✅ Weighted block prioritization  
✅ Secure cron endpoint  
✅ Database logging  
✅ Real-time monitoring  
✅ Vercel Cron integration  

### Next Enhancements
- [ ] **Smart Gap Analysis**: Detect which blocks are missing
- [ ] **Quality Scoring**: Auto-test and rate generated blocks
- [ ] **Premium Flagging**: Mark exceptional blocks as premium
- [ ] **Vector Embeddings**: Enable semantic search
- [ ] **A/B Testing**: Generate multiple variants
- [ ] **User Feedback**: Let users rate factory blocks
- [ ] **Auto-Cleanup**: Delete poor-quality blocks

### Documentation
- [Main Master Plan](Svarnex_MasterPlan.md)
- [Block Generator](lib/factory/README.md)
- [Payment Integration](PAYMENT_INTEGRATION.md)

---

**Status**: ✅ **READY FOR DEPLOYMENT**

**Setup Time**: 10 minutes (add secret + deploy)

**Files Created**: 7 files (~1,200 lines)

**Starting**: Cron begins automatically after Vercel deployment

---

Made with 🏭 by the Svarnex Factory Team
