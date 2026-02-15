# Block Generator System

The AI-powered block generation system for Svarnex. This system uses OpenAI's GPT-4 to generate production-ready React/Tailwind components based on natural language prompts.

---

## 📁 File Structure

```
lib/factory/
├── generator.ts    # Core generation logic with OpenAI integration
└── types.ts        # TypeScript types for the generator system

app/api/generate/
└── route.ts        # API endpoint for block generation
```

---

## 🚀 Quick Start

### 1. Set Up Environment Variables

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 2. Use the API Endpoint

**POST /api/generate**

Generate a new block:

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create a modern hero section with a gradient background and CTA button',
    type: 'hero',
    vibe: 'cyberpunk', // optional
    isPremium: false,  // optional
  }),
});

const result = await response.json();
// {
//   success: true,
//   blockId: "uuid-here",
//   block: { code, config, name, description, tags },
//   creditsRemaining: 246
// }
```

**GET /api/generate**

Check user status:

```typescript
const response = await fetch('/api/generate');
const data = await response.json();
// {
//   user: { id, credits, subscription_tier },
//   recentBlocks: [...]
// }
```

---

## 📝 Core Function: `generateBlock()`

### Signature

```typescript
async function generateBlock(
  params: GenerateBlockParams
): Promise<GenerateBlockResult>
```

### Parameters

```typescript
interface GenerateBlockParams {
  prompt: string;       // Natural language description
  type: BlockType;      // Component type (hero, pricing, navbar, etc.)
  userId?: string;      // User ID for attribution
  isPremium?: boolean;  // Whether to mark as premium content
  vibe?: string;        // Optional aesthetic (cyberpunk, minimal, etc.)
}
```

### Block Types

The system supports 14 component types:

- `hero` - Hero sections with headlines and CTAs
- `pricing` - Pricing tables/cards
- `footer` - Website footers
- `navbar` - Navigation bars
- `features` - Feature showcases
- `testimonials` - Customer testimonials
- `cta` - Call-to-action sections
- `faq` - FAQ accordions
- `contact` - Contact forms
- `gallery` - Image galleries
- `team` - Team member showcases
- `stats` - Statistics displays
- `blog` - Blog post grids
- `newsletter` - Newsletter signups

### Return Value

```typescript
interface GenerateBlockResult {
  success: boolean;
  blockId?: string;           // UUID of saved block
  data?: GeneratorResponse;   // Generated component data
  error?: string;             // Error message if failed
}

interface GeneratorResponse {
  code: string;               // React component code
  config: BlockConfig;        // Configuration object
  name: string;               // Component name
  description?: string;       // Description
  tags?: string[];            // Search tags
}
```

---

## 🛡️ Security Validation

The `validateCode()` function checks for dangerous patterns:

### ❌ Rejected Patterns (Errors)

- `window.location =` - Direct URL redirects
- `eval()` - Code evaluation
- `Function()` - Function constructors
- `dangerouslySetInnerHTML` - XSS vulnerability
- `<script>` tags - Script injection
- Inline event handlers (`onclick="..."`)
- `process.env` - Server-side code
- `document.write` - DOM manipulation
- `innerHTML =` - Direct HTML injection
- Remote URL imports

### ⚠️ Warning Patterns (Non-blocking)

- `localStorage/sessionStorage` - Storage API usage
- `fetch()` - Network requests
- `WebSocket` - Real-time connections
- Spread operators with external data

### Validation Result

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];      // Blocking errors
  warnings: string[];    // Non-blocking warnings
}
```

---

## 🧠 System Prompt

The generator uses a comprehensive system prompt that instructs GPT-4 to:

1. **Generate React/Tailwind Components**
   - TypeScript with proper typing
   - Tailwind CSS for all styling
   - Lucide React icons
   - Framer Motion animations
   - Responsive, mobile-first design

2. **Return Structured JSON**
   ```json
   {
     "code": "component code string",
     "config": {
       "colors": { "primary": "#hex", "secondary": "#hex" },
       "layout": { "variant": "string", "columns": 3 },
       "content": { "heading": "string", "subheading": "string" },
       "animation": { "enabled": true, "type": "fade" }
     },
     "name": "ComponentName",
     "description": "Brief description",
     "tags": ["tag1", "tag2"]
   }
   ```

3. **Follow Safety Rules**
   - No dangerous code patterns
   - No external data fetching
   - No server-side code
   - Self-contained components

4. **Apply Style Guidelines**
   - Dark mode by default
   - Glassmorphism effects
   - Subtle animations
   - High contrast readability

---

## 🔄 Generation Workflow

```
1. Receive request → Validate parameters
2. Build system + user prompts
3. Call OpenAI API (gpt-4-turbo-preview)
4. Parse JSON response
5. Validate code security
6. Generate embedding vector (text-embedding-ada-002)
7. Save to Supabase blocks table
8. Deduct user credits
9. Return result
```

### Step-by-Step Breakdown

#### 1. Prompt Construction

The `buildUserPrompt()` function creates type-specific instructions:

```typescript
// Example for 'hero' type:
"Create a hero section with a compelling headline, subheading, 
CTA button, and optional visual background effects.

User Request: Modern landing page hero with animated text

Aesthetic Vibe: cyberpunk. Incorporate this aesthetic into the design."
```

#### 2. OpenAI API Call

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ],
  temperature: 0.7,
  max_tokens: 4000,
  response_format: { type: 'json_object' },
});
```

#### 3. Response Parsing

The system handles:
- Clean JSON objects
- Markdown-wrapped JSON (```json ... ```)
- Validates required fields (code, name, config)

#### 4. Code Validation

```typescript
const validation = validateCode(parsedResponse.code);

if (!validation.isValid) {
  return { 
    success: false, 
    error: `Validation failed: ${validation.errors.join(', ')}` 
  };
}
```

#### 5. Embedding Generation

Creates a 1536-dimension vector for semantic search:

```typescript
const embeddingText = `${prompt} ${name} ${description} ${tags.join(' ')}`;
const embedding = await generateEmbedding(embeddingText);
// Returns: number[] (1536 dimensions)
```

#### 6. Database Storage

Saves to the `blocks` table:

```typescript
const block = await supabase.from('blocks').insert({
  type: 'hero',
  name: 'ModernHero',
  description: 'A cyberpunk-style hero section',
  code: '...',
  config: { colors: {...}, layout: {...} },
  tags: ['hero', 'cyberpunk', 'animated'],
  is_premium: false,
  required_tier: 'free',
  created_by: 'user-uuid',
  vibe_embedding: '[0.123, -0.456, ...]',
});
```

---

## 📊 Database Integration

### Blocks Table Schema

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  vibe_embedding VECTOR(1536),  -- For semantic search
  tags TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  required_tier TEXT DEFAULT 'free',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  views INTEGER DEFAULT 0,
  uses INTEGER DEFAULT 0
);
```

### Semantic Search

Use the embedding vector for vibe-based search:

```sql
SELECT * FROM search_blocks_by_vibe(
  query_embedding := '[0.1, 0.2, ...]',
  similarity_threshold := 0.7,
  max_results := 10
);
```

---

## 💳 Credits System

Each generation costs **1 credit**:

```typescript
// Check credits before generation
const { data: user } = await supabase
  .from('users')
  .select('credits')
  .eq('id', userId)
  .single();

if (user.credits <= 0) {
  throw new Error('Insufficient credits');
}

// Deduct after successful generation
await supabase.rpc('deduct_credits', {
  user_id: userId,
  amount: 1,
});
```

### Credit Limits by Tier

- **Free**: 100 credits
- **Pro (₹199)**: 500 credits/month
- **Empire (₹799)**: Unlimited

---

## 🔁 Batch Generation

For autonomous factory mode:

```typescript
import { generateBlockBatch } from '@/lib/factory/generator';

const prompts = [
  { prompt: 'Modern hero', type: 'hero' },
  { prompt: 'Pricing table', type: 'pricing' },
  { prompt: 'Contact form', type: 'contact' },
];

const results = await generateBlockBatch(prompts);
// Returns: GenerateBlockResult[]

// Includes 2-second delay between generations to avoid rate limits
```

---

## 🧪 Testing & Examples

### Example 1: Generate Hero Section

```typescript
const result = await generateBlock({
  prompt: 'Create a bold hero section with animated gradient text and a warp-speed CTA button',
  type: 'hero',
  userId: 'user-123',
  vibe: 'glassmorphism',
});

console.log(result);
// {
//   success: true,
//   blockId: '550e8400-e29b-41d4-a716-446655440000',
//   data: {
//     code: "'use client';\n\nexport default function Hero() {...}",
//     config: {
//       colors: { primary: '#8B5CF6', secondary: '#EC4899' },
//       layout: { variant: 'centered', columns: 1 },
//       content: { heading: 'Build Faster', subheading: '...' },
//       animation: { enabled: true, type: 'fade-up' }
//     },
//     name: 'GlassmorphismHero',
//     description: 'A modern hero section with glassmorphism effects',
//     tags: ['hero', 'glassmorphism', 'animated', 'gradient']
//   }
// }
```

### Example 2: Generate Pricing Cards

```typescript
const result = await generateBlock({
  prompt: 'Three-tier pricing cards with hover effects and feature lists',
  type: 'pricing',
  userId: 'user-123',
  isPremium: true,
});
```

### Example 3: Direct Function Usage

```typescript
import { generateBlock } from '@/lib/factory/generator';

async function myGenerationScript() {
  const result = await generateBlock({
    prompt: 'FAQ section with smooth accordion animations',
    type: 'faq',
    userId: 'automation-bot',
  });

  if (result.success) {
    console.log('✅ Generated block:', result.blockId);
  } else {
    console.error('❌ Error:', result.error);
  }
}
```

---

## ⚙️ Configuration

### OpenAI Model Settings

In [generator.ts](c:\Users\ingal\Desktop\svarnex2026\lib\factory\generator.ts#L346-L352):

```typescript
{
  model: 'gpt-4-turbo-preview',  // Can use: gpt-4o, gpt-4, gpt-3.5-turbo
  temperature: 0.7,               // 0.0 (deterministic) to 1.0 (creative)
  max_tokens: 4000,               // Max response length
  response_format: { type: 'json_object' },
}
```

### Embedding Model

Fixed to `text-embedding-ada-002` (1536 dimensions):

```typescript
const response = await openai.embeddings.create({
  model: 'text-embedding-ada-002',
  input: embeddingText,
});
```

---

## 🐛 Error Handling

### Common Errors

1. **Empty OpenAI Response**
   ```typescript
   { success: false, error: 'Empty response from OpenAI' }
   ```

2. **Invalid JSON**
   ```typescript
   { success: false, error: 'Failed to parse OpenAI response into valid JSON' }
   ```

3. **Code Validation Failure**
   ```typescript
   { 
     success: false, 
     error: 'Code validation failed: eval() usage detected',
     data: { code, config, name } // Included for debugging
   }
   ```

4. **Database Save Error**
   ```typescript
   { 
     success: false, 
     error: 'Failed to save block to database',
     data: { code, config, name } // Generated data preserved
   }
   ```

5. **Insufficient Credits**
   ```typescript
   { 
     error: 'Insufficient credits. Please upgrade your plan.',
     status: 403 
   }
   ```

### Debugging Tips

- Check OpenAI API key validity
- Verify Supabase connection
- Monitor console logs (emoji indicators: 🤖 🔒 🧠 💾 ✅ ❌)
- Review validation errors/warnings
- Check user credit balance

---

## 🔐 Security Considerations

1. **API Key Protection**
   - Store `OPENAI_API_KEY` in `.env.local` (never commit)
   - Use server-side only (never expose to client)

2. **Code Validation**
   - Always validate before saving to database
   - Reject any dangerous patterns
   - Sanitize user prompts if needed

3. **Rate Limiting**
   - OpenAI has rate limits (check your tier)
   - Batch generation includes 2s delays
   - Consider implementing queue system for high volume

4. **User Authentication**
   - API route checks `supabase.auth.getUser()`
   - Blocks are attributed to `created_by` user ID
   - Credits checked before generation

5. **Content Moderation**
   - User prompts should be monitored
   - Consider OpenAI's Moderation API for inappropriate content
   - Implement reporting system for generated blocks

---

## 🚀 Performance Optimization

1. **Caching**
   - Cache similar prompts (implement embedding similarity check)
   - Store popular blocks for instant retrieval

2. **Parallel Processing**
   - Use `generateBlockBatch()` for multiple generations
   - Process in worker threads for CPU-intensive validation

3. **Token Optimization**
   - Use `gpt-3.5-turbo` for simpler components
   - Reserve `gpt-4-turbo-preview` for complex generations

4. **Database Queries**
   - Index `vibe_embedding` column for fast similarity search
   - Use `tags` array for quick filtering
   - Cache user profile data

---

## 📈 Future Enhancements

- [ ] Fine-tuned model on Svarnex component library
- [ ] Multi-language support (internationalization)
- [ ] Component preview generation (screenshots)
- [ ] A/B testing for prompt variations
- [ ] User feedback loop (thumbs up/down)
- [ ] Component composition (combine multiple blocks)
- [ ] Style transfer (apply one block's style to another)
- [ ] Real-time streaming responses
- [ ] Voice-to-component (audio input)
- [ ] Image-to-component (design mockup input)

---

## 📚 API Reference Summary

### Functions

- `generateBlock(params)` - Generate a single block
- `generateBlockBatch(prompts)` - Generate multiple blocks
- `validateCode(code)` - Security validation
- `parseGeneratorResponse(content)` - Parse OpenAI JSON
- `generateEmbedding(text)` - Create embedding vector
- `saveBlockToDatabase(data)` - Save to Supabase
- `buildUserPrompt(params)` - Construct generation prompt

### Types

- `BlockType` - 14 component types
- `GenerateBlockParams` - Input parameters
- `GenerateBlockResult` - Output result
- `GeneratorResponse` - OpenAI response structure
- `BlockConfig` - Component configuration
- `ValidationResult` - Security check result

---

## 🆘 Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify environment variables are set correctly
3. Test API endpoint with Postman/Insomnia
4. Review validation errors in response
5. Check OpenAI API dashboard for quota/errors

---

**Generated by Svarnex Block Generator v1.0**  
Last Updated: February 16, 2026
