# 🚀 Svarnex Launch Checklist

## Pre-Launch Setup (15 minutes)

### 1. Install Dependencies

```bash
npm install next-sitemap
```

### 2. Environment Variables

Update `.env.local`:

```bash
# Production URLs
NEXT_PUBLIC_SITE_URL=https://svarnex.app
SITE_URL=https://svarnex.app

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI (already configured)
OPENAI_API_KEY=your-openai-key

# Cron (already configured)
CRON_SECRET=your-cron-secret

# Payment providers (already configured)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

### 3. Database Migration

Run in Supabase SQL Editor:

```bash
# Paste and run: supabase/migrations/007_add_rls_policies.sql
```

Or via psql:

```bash
psql -h db.xxxxx.supabase.co -U postgres -f supabase/migrations/007_add_rls_policies.sql
```

### 4. Build & Test Locally

```bash
npm run build
npm start
```

Visit `http://localhost:3000` and verify:
- [ ] Site loads without errors
- [ ] Sitemap exists: `http://localhost:3000/sitemap.xml`
- [ ] Robots.txt exists: `http://localhost:3000/robots.txt`
- [ ] Error boundary works (trigger intentional error)

---

## Vercel Deployment

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Framework: **Next.js** (auto-detected)
5. Root Directory: `./`

### 2. Configure Environment Variables

Add all variables from `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://svarnex.app
SITE_URL=https://svarnex.app
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
CRON_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

**Important**: Set for **Production** environment.

### 3. Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (includes `postbuild: next-sitemap`)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy

Click **Deploy** and wait 2-3 minutes.

---

## Post-Deployment Verification (10 minutes)

### ✅ SEO Check

- [ ] Visit: `https://svarnex.app/sitemap.xml`
- [ ] Visit: `https://svarnex.app/server-sitemap.xml`
- [ ] Visit: `https://svarnex.app/robots.txt`
- [ ] Test OG tags: [OpenGraph.xyz](https://www.opengraph.xyz/?url=https://svarnex.app)
- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console)

### ✅ Performance Check

- [ ] Run [Lighthouse](https://pagespeed.web.dev/) on homepage
  - Target: Performance > 90, SEO > 95
- [ ] Check Network tab: Verify 3D components lazy load
- [ ] Test mobile performance (should be fast)

### ✅ Security Check

**Test RLS Policies**:

1. Create test account: `testuser@example.com`
2. Create a project as test user
3. Try to access via direct Supabase query (should fail):
   ```javascript
   // In browser console or Postman
   const { data } = await supabase
     .from('projects')
     .select('*')
     .neq('user_id', currentUserId);
   // Should return: [] (empty array)
   ```
4. Verify transactions can't be modified:
   ```javascript
   const { error } = await supabase
     .from('transactions')
     .delete()
     .eq('id', 'any-transaction-id');
   // Should return: error
   ```

**API Security**:

- [ ] Try accessing cron without secret: `https://svarnex.app/api/cron/generate`
  - Should return: `401 Unauthorized`
- [ ] Try accessing with correct secret: works
- [ ] Verify payment webhooks require valid signature

### ✅ Error Handling Check

**Trigger Intentional Error**:

1. Navigate to any page
2. Open browser DevTools → Console
3. Type: `throw new Error('Test error')`
4. Verify error boundary shows beautiful fallback UI
5. Click "Try Again" → should recover

**Check Logs**:

- [ ] Vercel Dashboard → Project → Logs
- [ ] Errors should be logged (ready for Sentry integration)

### ✅ Feature Tests

- [ ] User signup/login works
- [ ] AI block generation works
- [ ] Payment flow (Razorpay/Stripe) works
- [ ] Project creation/editing works
- [ ] Factory cron job running (check Vercel → Crons)
- [ ] Factory monitor dashboard shows stats

---

## Production Monitoring Setup

### 1. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://svarnex.app`
3. Verify ownership (Vercel DNS or HTML tag)
4. Submit sitemap: `https://svarnex.app/sitemap.xml`

### 2. Google Analytics (Optional)

Add to `app/layout.tsx`:

```tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script dangerouslySetInnerHTML={{
  __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `
}} />
```

### 3. Error Tracking (Sentry - Recommended)

```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

---

## DNS Configuration (Custom Domain)

### Point Domain to Vercel

1. Go to Vercel → Project → Settings → Domains
2. Add domain: `svarnex.app` and `www.svarnex.app`
3. Update DNS records at your registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Wait 24-48 hours for propagation

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| **Lighthouse Performance** | > 90 | ⏳ |
| **First Contentful Paint** | < 1s | ⏳ |
| **Time to Interactive** | < 2s | ⏳ |
| **Largest Contentful Paint** | < 2.5s | ⏳ |
| **Cumulative Layout Shift** | < 0.1 | ⏳ |
| **SEO Score** | > 95 | ⏳ |
| **Accessibility Score** | > 90 | ⏳ |

---

## Launch Day Tasks

### 📣 Announcements

- [ ] Product Hunt launch
- [ ] Twitter/X announcement
- [ ] LinkedIn post
- [ ] Reddit (r/webdev, r/SideProject)
- [ ] Indie Hackers
- [ ] Dev.to article

### 📊 Monitoring

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure Vercel alerts (build failures, errors)
- [ ] Set up Slack/Discord notifications for:
  - New signups
  - Payment failures
  - Factory cron failures

### 🎯 Marketing Page

- [ ] Create `/pricing` page
- [ ] Create `/features` page
- [ ] Create `/blog` for SEO
- [ ] Add social proof (testimonials)
- [ ] Add demo video

---

## Rollback Plan (If Things Go Wrong)

### Quick Rollback in Vercel

1. Go to Vercel → Project → Deployments
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**
4. Previous version restored in 30 seconds

### Disable Factory Cron

If factory is causing issues:

1. Vercel → Project → Crons
2. Disable `/api/cron/generate`

### Disable RLS (Emergency Only)

If RLS is blocking users:

```sql
-- In Supabase SQL Editor
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocks DISABLE ROW LEVEL SECURITY;
-- (Remember to re-enable after fixing!)
```

---

## Support Channels

- **Email**: support@svarnex.app
- **Discord**: Create community server
- **Documentation**: Link to LAUNCH_PREPARATION.md

---

## Final Pre-Launch Checklist

- [ ] All tests passing locally
- [ ] Database migration applied
- [ ] Environment variables configured in Vercel
- [ ] Sitemaps generating correctly
- [ ] RLS policies active and tested
- [ ] Error boundary integrated
- [ ] Payment providers configured (test mode OFF)
- [ ] Custom domain pointed to Vercel
- [ ] SSL certificate active (HTTPS)
- [ ] Analytics/monitoring configured
- [ ] Support email configured
- [ ] Legal pages (Terms, Privacy) created
- [ ] Backup strategy in place (Supabase automatic)

---

## 🎉 You're Ready to Launch!

When all items are checked:

```bash
git add .
git commit -m "🚀 Production ready - Launch preparation complete"
git push origin main
```

Vercel will automatically deploy. Visit `https://svarnex.app` in 2-3 minutes.

---

**Launch Countdown**: T-minus 15 minutes ⏱️

Good luck! 🚀

---

*Need help? Check [LAUNCH_PREPARATION.md](LAUNCH_PREPARATION.md) for detailed guides.*
