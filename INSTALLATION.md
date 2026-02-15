# Installation & Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- OpenAI API key
- Git repository

---

## Step 1: Install Missing Dependencies

The following packages are referenced but not yet installed:

```bash
npm install next-sitemap razorpay stripe
```

**Note**: The TypeScript errors you see for these packages will disappear after installation.

---

## Step 2: Database Setup

Run the security migration in Supabase:

### Option A: Supabase Dashboard

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste contents of `supabase/migrations/007_add_rls_policies.sql`
5. Click **Run**

### Option B: Command Line

```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f supabase/migrations/007_add_rls_policies.sql
```

Replace `db.xxxxx.supabase.co` with your Supabase database URL.

---

## Step 3: Environment Variables

Update `.env.local`:

```bash
# Copy example file
cp .env.local.example .env.local

# Edit with your values
nano .env.local
```

**Required variables**:
```bash
NEXT_PUBLIC_SITE_URL=https://svarnex.app
SITE_URL=https://svarnex.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key
CRON_SECRET=your-random-secret
```

**Optional (for payments)**:
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

---

## Step 4: Build & Test

```bash
# Install all dependencies
npm install

# Build the project (this also generates sitemap)
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to verify everything works.

---

## Step 5: Verify Installation

### ✅ Check Sitemap

Visit: `http://localhost:3000/sitemap.xml`

Should show:
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://svarnex.app/</loc>
    <priority>1.0</priority>
  </url>
</urlset>
```

### ✅ Check Error Boundary

1. Open browser DevTools console
2. Type: `throw new Error('Test')`
3. Should see beautiful error fallback UI (not a blank page)

### ✅ Check RLS Security

In Supabase SQL Editor:

```sql
-- This should return policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Should see policies like:
-- "Users can view own projects"
-- "Service role can insert transactions"
-- etc.
```

### ✅ Check Lazy Loading

1. Open Chrome DevTools → Network tab
2. Reload page
3. Look for dynamically loaded chunks (e.g., `123.js`)
4. 3D components should load separately, not in initial bundle

---

## Step 6: Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "🚀 Launch preparation complete"
git push origin main
```

### In Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Add all environment variables from `.env.local`
4. Click **Deploy**

Wait 2-3 minutes. Your site will be live at `https://your-project.vercel.app`.

---

## Troubleshooting

### Error: "Cannot find module 'next-sitemap'"

**Fix**: Run `npm install next-sitemap`

### Error: "Cannot find module 'razorpay'"

**Fix**: Run `npm install razorpay stripe`

### Error: "RLS policy violation"

**Fix**: Ensure migration `007_add_rls_policies.sql` was run in Supabase.

### Sitemap not generating

**Fix**: 
1. Check `SITE_URL` is set in `.env.local`
2. Verify `postbuild` script exists in `package.json`
3. Run manually: `npx next-sitemap`

### Error boundary not showing

**Fix**: Check that `ErrorBoundary` wraps the app in `app/layout.tsx`.

---

## Performance Optimization

After deployment, run Lighthouse audit:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-site.com --view
```

**Target scores**:
- Performance: > 90
- SEO: > 95
- Accessibility: > 90
- Best Practices: > 90

---

## Next Steps

1. Submit sitemap to [Google Search Console](https://search.google.com/search-console)
2. Test payment flows (use test cards)
3. Monitor error logs in Vercel Dashboard
4. Set up uptime monitoring
5. Announce launch! 🎉

---

## Documentation

- **Complete Guide**: [LAUNCH_PREPARATION.md](LAUNCH_PREPARATION.md)
- **Quick Checklist**: [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)
- **Summary**: [LAUNCH_SUMMARY.md](LAUNCH_SUMMARY.md)
- **Factory Automation**: [FACTORY_AUTOMATION.md](FACTORY_AUTOMATION.md)
- **Lazy Loading**: [docs/LAZY_LOADING_GUIDE.md](docs/LAZY_LOADING_GUIDE.md)

---

**Setup Time**: ~15 minutes  
**Difficulty**: Easy  
**Support**: Check documentation or open an issue  

✅ **Ready to launch!** 🚀
