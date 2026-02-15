/**
 * Factory Cron Job - Automated Block Generation
 * 
 * This API route is triggered by Vercel Cron Jobs (or manually with secret key)
 * It generates a random block and stores it in the database
 * 
 * Security: Requires CRON_SECRET environment variable to prevent unauthorized access
 * 
 * Usage:
 * - Automated: Vercel Cron triggers this every 15 minutes
 * - Manual: POST /api/cron/generate with Authorization header
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBlock } from '@/lib/factory/generator';
import {
  getRandomBlockParams,
  getWeightedRandomCategory,
  getGenerationStats,
} from '@/lib/factory/randomizer';
import { createClient } from '@/utils/supabase/server';

/**
 * Verify the cron secret to prevent unauthorized access
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('❌ CRON_SECRET not configured');
    return false;
  }

  // Check Bearer token
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    return token === cronSecret;
  }

  // Check Vercel cron header (automatically added by Vercel)
  const vercelCron = request.headers.get('x-vercel-cron');
  if (vercelCron === cronSecret) {
    return true;
  }

  // Check query parameter (for manual testing)
  const url = new URL(request.url);
  const secretParam = url.searchParams.get('secret');
  if (secretParam === cronSecret) {
    return true;
  }

  return false;
}

/**
 * Main cron handler
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Verify secret key
    console.log('🔐 Verifying cron secret...');
    if (!verifyCronSecret(request)) {
      console.error('❌ Unauthorized cron attempt');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid or missing CRON_SECRET',
          message: 'Please provide valid credentials via Authorization header or ?secret=XXX',
        },
        { status: 401 }
      );
    }

    console.log('✅ Cron secret verified');

    // Step 2: Get random parameters
    console.log('🎲 Selecting random block parameters...');
    const category = getWeightedRandomCategory(); // Use weighted selection
    const { vibe, prompt } = getRandomBlockParams();
    
    console.log(`📦 Selected: ${category} with ${vibe} vibe`);
    console.log(`📝 Prompt: "${prompt}"`);

    // Step 3: Generate the block
    console.log('🤖 Calling AI generator...');
    const result = await generateBlock({
      prompt: prompt,
      type: category,
      vibe: vibe,
      isPremium: false, // Factory blocks are free by default
    });

    if (!result.success) {
      console.error('❌ Block generation failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          params: { category, vibe, prompt },
        },
        { status: 500 }
      );
    }

    // Step 4: Log to factory history (optional)
    try {
      const supabase = await createClient();
      // @ts-ignore - factory_logs table may not be in types yet
      await supabase.from('factory_logs').insert({
        block_id: result.blockId,
        category,
        vibe,
        prompt,
        success: true,
        generation_time_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.warn('⚠️ Failed to log to factory_logs:', logError);
      // Don't fail the entire operation if logging fails
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Block generated successfully in ${duration}ms`);
    console.log(`🆔 Block ID: ${result.blockId}`);

    // Step 5: Return success response
    return NextResponse.json({
      success: true,
      blockId: result.blockId,
      category,
      vibe,
      prompt,
      duration_ms: duration,
      message: `Successfully generated ${category} block with ${vibe} vibe`,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        duration_ms: duration,
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - same as GET (for manual triggering)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * Stats endpoint - no auth required (public info)
 */
export async function OPTIONS(request: NextRequest) {
  const stats = getGenerationStats();
  
  return NextResponse.json({
    factory_stats: stats,
    message: 'Factory cron job endpoint',
    usage: {
      automated: 'Triggered by Vercel Cron every 15 minutes',
      manual: 'GET/POST /api/cron/generate?secret=YOUR_CRON_SECRET',
      headers: 'Authorization: Bearer YOUR_CRON_SECRET',
    },
    security: 'Requires CRON_SECRET environment variable',
  });
}
