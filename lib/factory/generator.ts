/**
 * AI Block Generator - Core Logic
 * Generates React/Tailwind components using OpenAI
 */

import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import type {
  BlockType,
  GenerateBlockParams,
  GenerateBlockResult,
  GeneratorResponse,
  ValidationResult,
} from './types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * System prompt that instructs the AI to generate clean React/Tailwind components
 */
const SYSTEM_PROMPT = `You are an expert React and Tailwind CSS developer specializing in creating modern, production-ready UI components.

Your task is to generate ONLY valid React components using:
- TypeScript with proper typing
- Tailwind CSS for all styling (no inline styles or CSS modules)
- Lucide React for icons (import from 'lucide-react')
- Framer Motion for animations when appropriate (import from 'framer-motion')
- Modern React patterns (hooks, functional components)
- Responsive design (mobile-first)
- Accessibility best practices (ARIA labels, semantic HTML)

CRITICAL RULES:
1. Return ONLY a valid JSON object with this exact structure:
{
  "code": "the complete React component code as a string",
  "config": {
    "colors": { "primary": "#hex", "secondary": "#hex", "background": "#hex" },
    "layout": { "variant": "string", "columns": number },
    "content": { "heading": "string", "subheading": "string" },
    "animation": { "enabled": boolean, "type": "string" }
  },
  "name": "ComponentName",
  "description": "Brief description of the component",
  "tags": ["tag1", "tag2", "tag3"]
}

2. The component MUST:
   - Be a default export
   - Be fully self-contained (no external data fetching)
   - Use 'use client' directive if using hooks or interactivity
   - Have TypeScript interfaces for all props
   - Be production-ready and visually impressive

3. NEVER include:
   - window.location redirects
   - eval() or Function() constructors
   - dangerouslySetInnerHTML
   - External script tags
   - Inline event handlers as strings
   - References to process.env or server-side code

4. Style Guidelines:
   - Use dark mode by default (dark backgrounds)
   - Implement glassmorphism effects (backdrop-blur, transparency)
   - Add subtle animations and transitions
   - Ensure high contrast for readability
   - Use gradient accents sparingly

5. DO NOT include any markdown code blocks, explanations, or text outside the JSON object.`;

/**
 * Generate a user prompt based on type and request
 */
function buildUserPrompt(params: GenerateBlockParams): string {
  const { prompt, type, vibe } = params;

  let typeInstructions = '';
  
  switch (type) {
    case 'hero':
      typeInstructions = 'Create a hero section with a compelling headline, subheading, CTA button, and optional visual background effects.';
      break;
    case 'pricing':
      typeInstructions = 'Create a pricing section with 3 tiers (cards) including features, pricing, and CTA buttons.';
      break;
    case 'footer':
      typeInstructions = 'Create a footer with navigation links, social icons, copyright, and optional newsletter signup.';
      break;
    case 'navbar':
      typeInstructions = 'Create a navigation bar with logo, menu items, mobile hamburger menu, and optional CTA button.';
      break;
    case 'features':
      typeInstructions = 'Create a features section showcasing 4-6 features with icons, headings, and descriptions in a grid layout.';
      break;
    case 'testimonials':
      typeInstructions = 'Create a testimonials section with customer reviews, avatars, names, and ratings in cards.';
      break;
    case 'cta':
      typeInstructions = 'Create a call-to-action section with bold headline, description, and prominent action button(s).';
      break;
    case 'faq':
      typeInstructions = 'Create an FAQ section with expandable/collapsible accordion items for questions and answers.';
      break;
    case 'contact':
      typeInstructions = 'Create a contact form with input fields (name, email, message), validation states, and submit button.';
      break;
    case 'gallery':
      typeInstructions = 'Create an image gallery with grid layout, hover effects, and optional lightbox functionality.';
      break;
    case 'team':
      typeInstructions = 'Create a team section showcasing team members with photos, names, roles, and social links.';
      break;
    case 'stats':
      typeInstructions = 'Create a statistics section displaying key metrics with large numbers, labels, and animated counters.';
      break;
    case 'blog':
      typeInstructions = 'Create a blog post grid/list with featured images, titles, excerpts, dates, and read more links.';
      break;
    case 'newsletter':
      typeInstructions = 'Create a newsletter signup section with email input, compelling copy, and subscribe button.';
      break;
  }

  const vibeInstruction = vibe 
    ? `\nAesthetic Vibe: ${vibe}. Incorporate this aesthetic into the design system.`
    : '';

  return `${typeInstructions}

User Request: ${prompt}${vibeInstruction}

Remember: Return ONLY the JSON object with code, config, name, description, and tags. No markdown, no explanations.`;
}

/**
 * Validate generated code for security vulnerabilities and dangerous patterns
 */
export function validateCode(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Dangerous patterns that should cause rejection
  const dangerousPatterns = [
    { pattern: /window\.location\s*=/, message: 'Direct window.location assignment detected' },
    { pattern: /eval\s*\(/, message: 'eval() usage detected' },
    { pattern: /Function\s*\(/, message: 'Function constructor detected' },
    { pattern: /dangerouslySetInnerHTML/, message: 'dangerouslySetInnerHTML detected' },
    { pattern: /<script[\s>]/i, message: 'Script tag detected' },
    { pattern: /on\w+\s*=\s*["']/i, message: 'Inline event handler detected' },
    { pattern: /process\.env/, message: 'process.env reference detected (server-side code)' },
    { pattern: /document\.write/, message: 'document.write detected' },
    { pattern: /innerHTML\s*=/, message: 'innerHTML assignment detected' },
    { pattern: /\.createElement\s*\(\s*["']script["']/i, message: 'Dynamic script creation detected' },
    { pattern: /import\s+.*\s+from\s+["']http/, message: 'Remote URL import detected' },
  ];

  // Warning patterns (suspicious but not always dangerous)
  const warningPatterns = [
    { pattern: /localStorage|sessionStorage/, message: 'Local/session storage usage detected' },
    { pattern: /fetch\s*\(/, message: 'Fetch API usage detected - ensure proper error handling' },
    { pattern: /new\s+WebSocket/, message: 'WebSocket usage detected' },
    { pattern: /\[\s*\.\.\.\w+\s*\]/, message: 'Spread operator usage - ensure data validation' },
  ];

  // Check for dangerous patterns
  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }

  // Check for warning patterns
  for (const { pattern, message } of warningPatterns) {
    if (pattern.test(code)) {
      warnings.push(message);
    }
  }

  // Basic code structure validation
  if (!code.includes('export default') && !code.includes('export {')) {
    errors.push('No default export found');
  }

  if (code.length < 50) {
    errors.push('Generated code is suspiciously short');
  }

  if (code.length > 50000) {
    errors.push('Generated code exceeds maximum length (50KB)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parse and validate the OpenAI response
 */
function parseGeneratorResponse(content: string): GeneratorResponse | null {
  try {
    // Try to extract JSON from the response
    // Sometimes the AI might wrap it in markdown code blocks despite instructions
    let jsonString = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonString.startsWith('```')) {
      const jsonMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
    }

    const parsed = JSON.parse(jsonString) as GeneratorResponse;

    // Validate required fields
    if (!parsed.code || typeof parsed.code !== 'string') {
      throw new Error('Invalid or missing code field');
    }
    if (!parsed.name || typeof parsed.name !== 'string') {
      throw new Error('Invalid or missing name field');
    }
    if (!parsed.config || typeof parsed.config !== 'object') {
      throw new Error('Invalid or missing config field');
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse generator response:', error);
    return null;
  }
}

/**
 * Generate embedding vector for vibe-based search
 * Uses OpenAI's text-embedding-ada-002 model
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Save generated block to Supabase
 */
async function saveBlockToDatabase(
  data: GeneratorResponse,
  type: BlockType,
  userId?: string,
  isPremium: boolean = false,
  embedding: number[] | null = null
): Promise<string | null> {
  try {
    const supabase = await createClient();

    // Prepare the insert data
    const insertData = {
      type,
      name: data.name,
      description: data.description || null,
      code: data.code,
      config: data.config,
      tags: data.tags || [],
      is_premium: isPremium,
      required_tier: isPremium ? ('pro_199' as const) : ('free' as const),
      created_by: userId || null,
      vibe_embedding: embedding ? `[${embedding.join(',')}]` : null,
    };

    const { data: block, error } = await supabase
      .from('blocks')
      .insert(insertData as any)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save block to database:', error);
      return null;
    }

    return (block as any)?.id || null;
  } catch (error) {
    console.error('Database save error:', error);
    return null;
  }
}

/**
 * Main function: Generate a block using OpenAI and save to database
 */
export async function generateBlock(
  params: GenerateBlockParams
): Promise<GenerateBlockResult> {
  try {
    // Step 1: Build prompts
    const systemPrompt = SYSTEM_PROMPT;
    const userPrompt = buildUserPrompt(params);

    // Step 2: Call OpenAI API
    console.log(`🤖 Generating ${params.type} block...`);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Use gpt-4-turbo-preview or gpt-4o for best results
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }, // Ensure JSON response
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      return {
        success: false,
        error: 'Empty response from OpenAI',
      };
    }

    // Step 3: Parse response
    const parsedResponse = parseGeneratorResponse(responseContent);
    
    if (!parsedResponse) {
      return {
        success: false,
        error: 'Failed to parse OpenAI response into valid JSON',
      };
    }

    // Step 4: Validate code for security
    console.log('🔒 Validating generated code...');
    const validation = validateCode(parsedResponse.code);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: `Code validation failed: ${validation.errors.join(', ')}`,
        data: parsedResponse, // Return the data anyway for debugging
      };
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Code warnings:', validation.warnings);
    }

    // Step 5: Generate embedding for semantic search
    console.log('🧠 Generating embedding vector...');
    const embeddingText = `${params.prompt} ${parsedResponse.name} ${parsedResponse.description} ${parsedResponse.tags?.join(' ')}`;
    const embedding = await generateEmbedding(embeddingText);

    // Step 6: Save to database
    console.log('💾 Saving block to database...');
    const blockId = await saveBlockToDatabase(
      parsedResponse,
      params.type,
      params.userId,
      params.isPremium || false,
      embedding
    );

    if (!blockId) {
      return {
        success: false,
        error: 'Failed to save block to database',
        data: parsedResponse,
      };
    }

    console.log(`✅ Block generated successfully: ${blockId}`);

    return {
      success: true,
      blockId,
      data: parsedResponse,
    };
  } catch (error) {
    console.error('❌ Block generation error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Batch generate multiple blocks (for autonomous factory mode)
 */
export async function generateBlockBatch(
  prompts: GenerateBlockParams[]
): Promise<GenerateBlockResult[]> {
  const results: GenerateBlockResult[] = [];

  for (const prompt of prompts) {
    try {
      const result = await generateBlock(prompt);
      results.push(result);
      
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Batch generation failed',
      });
    }
  }

  return results;
}
