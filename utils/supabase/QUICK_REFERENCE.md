# Supabase Utils Quick Reference

## Import Patterns

### Server Components & API Routes
```typescript
import { createClient } from '@/utils/supabase/server'

// Always await the client
const supabase = await createClient()
```

### Client Components
```typescript
'use client'

import { createClient } from '@/utils/supabase/client'

// Direct usage (no await needed)
const supabase = createClient()
```

## Common Operations

### Authentication

#### Get Current User (Server)
```typescript
import { getUser } from '@/utils/supabase/server'

const { user, error } = await getUser()
if (user) {
  console.log('Logged in as:', user.email)
}
```

#### Get Current User (Client)
```typescript
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

#### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
    }
  }
})
```

#### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})
```

#### Sign Out
```typescript
const { error } = await supabase.auth.signOut()
```

### User Profile Management

#### Get User Profile
```typescript
import { getUserProfile } from '@/utils/supabase/server'

const { data: profile, error } = await getUserProfile(userId)
console.log('Credits:', profile?.credits)
console.log('Tier:', profile?.subscription_tier)
```

#### Update User Profile  
```typescript
const { data, error } = await supabase
  .from('users')
  .update({ 
    full_name: 'New Name',
    credits: 200 
  })
  .eq('id', userId)
```

#### Check Subscription Tier
```typescript
import { checkSubscriptionTier } from '@/utils/supabase/server'

const hasAccess = await checkSubscriptionTier(userId, 'pro_199')
if (hasAccess) {
  // User can access pro features
}
```

#### Use Credits
```typescript
import { useCredits } from '@/utils/supabase/server'

const { success, error } = await useCredits(userId, 10)
if (success) {
  console.log('Credits deducted successfully')
}
```

### Blocks (Components)

#### Fetch All Blocks
```typescript
const { data: blocks, error } = await supabase
  .from('blocks')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Fetch Blocks by Type
```typescript
const { data: heroes, error } = await supabase
  .from('blocks')
  .select('*')
  .eq('type', 'hero')
  .limit(10)
```

#### Fetch Free Blocks Only
```typescript
const { data: freeBlocks, error } = await supabase
  .from('blocks')
  .select('*')
  .eq('is_premium', false)
```

#### Search Blocks by Tags
```typescript
const { data: blocks, error } = await supabase
  .from('blocks')
  .select('*')
  .contains('tags', ['luxury', 'dark'])
```

#### Vector Search (AI-powered)
```typescript
// First, get embedding from OpenAI
const embedding = await getEmbedding('luxury hero section')

// Then search
const { data: similarBlocks, error } = await supabase
  .rpc('search_blocks_by_vibe', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 10,
    filter_type: 'hero' // optional
  })
```

#### Create Block
```typescript
const { data, error } = await supabase
  .from('blocks')
  .insert({
    type: 'hero',
    name: 'Modern Hero',
    description: 'Clean and modern hero section',
    code: '...React component code...',
    config: { title: 'Welcome', subtitle: 'Get started' },
    tags: ['modern', 'minimal'],
    is_premium: false,
  })
```

#### Increment Block Usage
```typescript
const { error } = await supabase.rpc('increment_block_usage', {
  block_id: 'uuid-here'
})
```

### Projects (User Websites)

#### Create Project
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({
    user_id: userId,
    name: 'My Awesome Site',
    description: 'A beautiful website',
    blocks: [
      { blockId: 'hero-uuid', order: 0, customConfig: {} },
      { blockId: 'features-uuid', order: 1, customConfig: {} },
    ],
    global_config: {
      theme: 'dark',
      primaryColor: '#8B5CF6',
      fontFamily: 'Inter'
    },
  })
```

#### Get User's Projects
```typescript
const { data: projects, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false })
```

#### Update Project Blocks
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({
    blocks: updatedBlocksArray,
    updated_at: new Date().toISOString()
  })
  .eq('id', projectId)
```

#### Publish Project
```typescript
const subdomain = 'mysite'
const publishUrl = `https://${subdomain}.svarnex.app`

const { data, error } = await supabase
  .from('projects')
  .update({
    is_published: true,
    publish_url: publishUrl,
    subdomain: subdomain,
    last_published_at: new Date().toISOString()
  })
  .eq('id', projectId)
```

## Real-time Subscriptions

### Listen to Block Changes
```typescript
const channel = supabase
  .channel('blocks-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'blocks' },
    (payload) => {
      console.log('New block created:', payload.new)
    }
  )
  .subscribe()

// Clean up
channel.unsubscribe()
```

### Listen to Project Updates
```typescript
const channel = supabase
  .channel(`project-${projectId}`)
  .on(
    'postgres_changes',
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'projects',
      filter: `id=eq.${projectId}`
    },
    (payload) => {
      console.log('Project updated:', payload.new)
    }
  )
  .subscribe()
```

## Error Handling

### Standard Pattern
```typescript
const { data, error } = await supabase
  .from('blocks')
  .select('*')

if (error) {
  console.error('Database error:', error.message)
  // Handle error (show toast, redirect, etc.)
  return
}

// Use data
console.log('Fetched data:', data)
```

### API Route Pattern
```typescript
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('blocks').select('*')
    
    if (error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error' }, 
      { status: 500 }
    )
  }
}
```

## TypeScript Types

All database types are available in `/types/database.ts`:

```typescript
import type { 
  User, 
  Block, 
  Project,
  BlockType,
  SubscriptionTier,
  Database 
} from '@/types/database'

// Use in your components
const renderBlock = (block: Block) => {
  return <div>{block.name}</div>
}
```

## Useful Queries

### Get User Stats
```typescript
const userId = 'uuid-here'

const [userProfile, projectCount, blocksUsed] = await Promise.all([
  supabase.from('users').select('*').eq('id', userId).single(),
  supabase.from('projects').select('id', { count: 'exact' }).eq('user_id', userId),
  // Count unique blocks used across all projects
  supabase.from('projects').select('blocks').eq('user_id', userId)
])
```

### Get Popular Blocks
```typescript
const { data: popularBlocks } = await supabase
  .from('blocks')
  .select('*')
  .order('uses', { ascending: false })
  .limit(10)
```

### Get Recently Created Blocks
```typescript
const { data: recentBlocks } = await supabase
  .from('blocks')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20)
```

## Best Practices

1. ✅ Always use server-side client for API routes and Server Components
2. ✅ Use client-side client only in Client Components
3. ✅ Handle errors gracefully - check for `error` before using `data`
4. ✅ Use TypeScript types for better autocomplete and safety
5. ✅ Leverage RLS policies - data is automatically filtered by user
6. ✅ Use database functions for complex operations (credits, search)
7. ✅ Clean up real-time subscriptions when components unmount
8. ✅ Never expose service role key in client-side code

## Troubleshooting

### "Failed to fetch" errors
- Check your `.env.local` has correct Supabase URL and keys
- Verify Supabase project is running
- Check browser console for CORS errors

### "Row level security" errors
- Ensure user is authenticated
- Check RLS policies in Supabase dashboard
- Verify user has correct subscription tier for premium content

### TypeScript errors
- Run `npm run dev` to regenerate types
- Check `/types/database.ts` matches your schema
- Use `as any` as last resort (not recommended)

## Resources

- [Supabase JavaScript Docs](https://supabase.com/docs/reference/javascript)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
