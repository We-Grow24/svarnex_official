# Supabase Setup Guide for Svarnex

This guide will help you set up Supabase for the Svarnex project.

## Prerequisites
- A Supabase account (free tier works fine)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name:** Svarnex
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine for development

## Step 2: Enable Required Extensions

1. In your Supabase project, go to **Database** → **Extensions**
2. Enable these extensions:
   - ✅ `uuid-ossp` (for UUID generation)
   - ✅ `vector` (for AI embeddings - pgvector)

## Step 3: Run the Schema SQL

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the entire contents of `/supabase/schema.sql`
4. Paste and click **Run**
5. You should see: "Success. No rows returned"

This creates:
- ✅ `users` table (extends auth.users)
- ✅ `blocks` table (AI-generated components)
- ✅ `projects` table (user websites)
- ✅ Row Level Security (RLS) policies
- ✅ Helper functions for credits and search

## Step 4: Configure Environment Variables

1. In Supabase, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

3. In your project root, create `.env.local`:

```bash
cp .env.example .env.local
```

4. Fill in the values in `.env.local`

## Step 5: Configure Authentication (Optional)

If you want to enable social login:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable providers you want:
   - Google OAuth
   - GitHub OAuth
   - Magic Link (Email)
   - etc.

3. Configure callback URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

## Step 6: Test the Connection

Run your Next.js dev server:

```bash
npm run dev
```

Open your browser console and check for any Supabase connection errors.

## Database Schema Overview

### Users Table
```sql
- id (UUID, references auth.users)
- email, full_name, avatar_url
- subscription_tier (free, pro_199, empire_799)
- credits (default: 100)
- timestamps
```

### Blocks Table
```sql
- id (UUID)
- type (hero, pricing, footer, etc.)
- code (React component string)
- config (JSONB - editable fields)
- vibe_embedding (VECTOR - for AI search)
- tags (array)
- is_premium (boolean)
- usage stats
```

### Projects Table
```sql
- id (UUID)
- user_id (references users)
- name, description
- subdomain, custom_domain
- blocks (JSONB - array of block configs)
- global_config (JSONB)
- SEO metadata
- publishing status
```

## Helper Functions Available

### Credits Management
```typescript
// Check if user has credits
has_credits(user_id, required_credits)

// Deduct credits from user
deduct_credits(user_id, amount)
```

### Block Search
```typescript
// Search blocks by AI embedding similarity
search_blocks_by_vibe(query_embedding, match_threshold, match_count, filter_type)

// Increment block usage counter
increment_block_usage(block_id)
```

## Using Supabase in Your Code

### Server Components (Recommended)
```typescript
import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: blocks } = await supabase
    .from('blocks')
    .select('*')
    .limit(10)
  
  return <div>{/* render blocks */}</div>
}
```

### Client Components
```typescript
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Component() {
  const [blocks, setBlocks] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    async function fetchBlocks() {
      const { data } = await supabase
        .from('blocks')
        .select('*')
        .limit(10)
      setBlocks(data || [])
    }
    fetchBlocks()
  }, [])
  
  return <div>{/* render blocks */}</div>
}
```

### API Routes
```typescript
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}
```

## Security Best Practices

1. ✅ **Never expose service role key** - Only use it server-side
2. ✅ **RLS is enabled** - All tables have Row Level Security
3. ✅ **Use typed clients** - TypeScript types are auto-generated
4. ✅ **Validate user input** - Always sanitize before database operations
5. ✅ **Use middleware** - Session refresh is handled automatically

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the schema.sql file
- Check that you're connected to the correct project

### "permission denied" error
- Check your RLS policies
- Verify you're authenticated when accessing protected data

### "vector" type not found
- Enable the `vector` extension in Supabase dashboard
- Go to Database → Extensions → Enable "vector"

## Next Steps

1. ✅ Add authentication pages (login/signup)
2. ✅ Create API routes for block generation
3. ✅ Implement OpenAI integration for embeddings
4. ✅ Build the component library UI
5. ✅ Set up payment integration

## Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [pgvector Extension](https://supabase.com/docs/guides/ai/vector-columns)
