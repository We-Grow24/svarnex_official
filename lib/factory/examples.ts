/**
 * Example Usage: AI Block Generator
 * 
 * This file demonstrates how to use the block generator system.
 * These examples can be run in API routes, server actions, or scripts.
 */

import { generateBlock, generateBlockBatch, type BlockType } from '@/lib/factory';

// ============================================
// Example 1: Basic Generation
// ============================================

export async function example1_BasicGeneration() {
  const result = await generateBlock({
    prompt: 'Create a modern hero section with a gradient background and CTA button',
    type: 'hero',
    userId: 'user-123',
  });

  if (result.success) {
    console.log('✅ Block generated:', result.blockId);
    console.log('📦 Component name:', result.data?.name);
    console.log('🏷️  Tags:', result.data?.tags);
  } else {
    console.error('❌ Generation failed:', result.error);
  }

  return result;
}

// ============================================
// Example 2: Generate with Vibe
// ============================================

export async function example2_GenerateWithVibe() {
  const result = await generateBlock({
    prompt: 'Three-tier pricing cards with hover effects',
    type: 'pricing',
    userId: 'user-123',
    vibe: 'glassmorphism', // Apply aesthetic vibe
    isPremium: true,       // Mark as premium content
  });

  return result;
}

// ============================================
// Example 3: All Block Types
// ============================================

export async function example3_AllBlockTypes() {
  const blockTypes: BlockType[] = [
    'hero',
    'pricing',
    'footer',
    'navbar',
    'features',
    'testimonials',
    'cta',
    'faq',
    'contact',
    'gallery',
    'team',
    'stats',
    'blog',
    'newsletter',
  ];

  for (const type of blockTypes) {
    console.log(`\n🔨 Generating ${type} block...`);
    
    const result = await generateBlock({
      prompt: `Create a modern ${type} component`,
      type,
      userId: 'automation',
    });

    if (result.success) {
      console.log(`✅ ${type}: ${result.blockId}`);
    } else {
      console.log(`❌ ${type}: ${result.error}`);
    }

    // Wait 2 seconds between generations to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// ============================================
// Example 4: Batch Generation
// ============================================

export async function example4_BatchGeneration() {
  const prompts = [
    {
      prompt: 'Cyberpunk-style hero with neon effects',
      type: 'hero' as BlockType,
      vibe: 'cyberpunk',
    },
    {
      prompt: 'Minimal pricing table with three tiers',
      type: 'pricing' as BlockType,
      vibe: 'minimal',
    },
    {
      prompt: 'Dark footer with social icons',
      type: 'footer' as BlockType,
    },
  ];

  console.log('🚀 Starting batch generation...');
  const results = await generateBlockBatch(prompts);

  console.log('\n📊 Batch Results:');
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`  ✅ ${index + 1}. ${result.data?.name} (${result.blockId})`);
    } else {
      console.log(`  ❌ ${index + 1}. Failed: ${result.error}`);
    }
  });

  return results;
}

// ============================================
// Example 5: Error Handling
// ============================================

export async function example5_ErrorHandling() {
  try {
    const result = await generateBlock({
      prompt: 'Create an FAQ accordion with smooth animations',
      type: 'faq',
      userId: 'user-123',
    });

    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes('validation failed')) {
        console.error('🔒 Security issue detected in generated code');
        console.error('Validation errors:', result.error);
        
        // You can still access the generated data for debugging
        if (result.data) {
          console.log('Generated name:', result.data.name);
          console.log('Generated code (first 200 chars):', result.data.code.slice(0, 200));
        }
      } else if (result.error?.includes('OpenAI')) {
        console.error('🤖 OpenAI API error:', result.error);
      } else if (result.error?.includes('database')) {
        console.error('💾 Database error:', result.error);
      } else {
        console.error('❌ Unknown error:', result.error);
      }
      
      return null;
    }

    return result.blockId;
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  }
}

// ============================================
// Example 6: Custom Validation
// ============================================

import { validateCode } from '@/lib/factory';

export function example6_CustomValidation() {
  const sampleCode = `
    'use client';
    import { useState } from 'react';
    
    export default function MyComponent() {
      const [count, setCount] = useState(0);
      
      return (
        <div className="p-4">
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
        </div>
      );
    }
  `;

  const validation = validateCode(sampleCode);

  console.log('Validation Result:');
  console.log('  Valid:', validation.isValid);
  console.log('  Errors:', validation.errors);
  console.log('  Warnings:', validation.warnings);

  return validation;
}

// ============================================
// Example 7: API Route Usage
// ============================================

/**
 * This example shows how to call the generation API from the client side
 */
export async function example7_ClientSideAPICall() {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Create a contact form with validation',
        type: 'contact',
        vibe: 'glassmorphism',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Generation failed');
    }

    const result = await response.json();
    console.log('✅ Generated block:', result.blockId);
    console.log('💳 Credits remaining:', result.creditsRemaining);
    console.log('📦 Component:', result.block.name);

    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// ============================================
// Example 8: Check User Status
// ============================================

export async function example8_CheckUserStatus() {
  const response = await fetch('/api/generate');
  const data = await response.json();

  console.log('User Status:');
  console.log('  User ID:', data.user.id);
  console.log('  Credits:', data.user.credits);
  console.log('  Tier:', data.user.subscription_tier);
  console.log('  Recent Blocks:', data.recentBlocks.length);

  return data;
}

// ============================================
// Example 9: Autonomous Factory (Cron Job)
// ============================================

/**
 * This function can be called by a cron job every 15 minutes
 * to autonomously generate new blocks for the factory feed
 */
export async function example9_AutonomousFactory() {
  // Define interesting prompts for autonomous generation
  const autonomousPrompts = [
    { prompt: 'Futuristic hero with animated particles', type: 'hero' as BlockType, vibe: 'sci-fi' },
    { prompt: 'Elegant pricing cards with hover tilts', type: 'pricing' as BlockType, vibe: 'elegant' },
    { prompt: 'Bold CTA with gradient button', type: 'cta' as BlockType, vibe: 'bold' },
    { prompt: 'Smooth FAQ accordion', type: 'faq' as BlockType, vibe: 'minimal' },
    { prompt: 'Grid gallery with lightbox', type: 'gallery' as BlockType, vibe: 'modern' },
  ];

  // Pick a random prompt
  const randomPrompt = autonomousPrompts[Math.floor(Math.random() * autonomousPrompts.length)];

  console.log(`🤖 Autonomous generation: ${randomPrompt.type}`);

  const result = await generateBlock({
    ...randomPrompt,
    userId: 'automation-bot',
    isPremium: Math.random() > 0.7, // 30% chance of premium
  });

  if (result.success) {
    console.log(`✅ Autonomous block created: ${result.blockId}`);
  } else {
    console.error(`❌ Autonomous generation failed: ${result.error}`);
  }

  return result;
}

// ============================================
// Example 10: Scheduled Generation Script
// ============================================

/**
 * Run this with: node -r tsx/register lib/factory/examples.ts
 * Or set up as a cron job or Vercel scheduled function
 */
export async function example10_ScheduledGeneration() {
  console.log('🏭 Starting scheduled factory generation...');
  console.log(`📅 ${new Date().toISOString()}`);

  // Generate 5 blocks autonomously
  const types: BlockType[] = ['hero', 'pricing', 'features', 'cta', 'testimonials'];
  const vibes = ['cyberpunk', 'minimal', 'glassmorphism', 'elegant', 'bold'];

  for (let i = 0; i < 5; i++) {
    const type = types[i];
    const vibe = vibes[i];

    const result = await generateBlock({
      prompt: `Modern ${type} component with ${vibe} aesthetic`,
      type,
      vibe,
      userId: 'factory-automation',
      isPremium: i % 2 === 0, // Alternate premium/free
    });

    if (result.success) {
      console.log(`  ${i + 1}. ✅ ${type}: ${result.blockId}`);
    } else {
      console.log(`  ${i + 1}. ❌ ${type}: ${result.error}`);
    }

    // Wait 3 seconds between generations
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log('\n✅ Scheduled generation complete!');
}

// ============================================
// Export all examples
// ============================================

export const examples = {
  example1_BasicGeneration,
  example2_GenerateWithVibe,
  example3_AllBlockTypes,
  example4_BatchGeneration,
  example5_ErrorHandling,
  example6_CustomValidation,
  example7_ClientSideAPICall,
  example8_CheckUserStatus,
  example9_AutonomousFactory,
  example10_ScheduledGeneration,
};

// To run a specific example:
// import { examples } from '@/lib/factory/examples';
// await examples.example1_BasicGeneration();
