/**
 * API Route: /api/generate
 * Generate AI blocks using the Block Generator
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBlock } from '@/lib/factory/generator';
import { createClient } from '@/utils/supabase/server';
import type { BlockType } from '@/lib/factory/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt, type, vibe, isPremium } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { error: 'Type is required and must be a valid block type' },
        { status: 400 }
      );
    }

    // Validate block type
    const validTypes: BlockType[] = [
      'hero', 'pricing', 'footer', 'navbar', 'features',
      'testimonials', 'cta', 'faq', 'contact', 'gallery',
      'team', 'stats', 'blog', 'newsletter'
    ];

    if (!validTypes.includes(type as BlockType)) {
      return NextResponse.json(
        { error: `Invalid block type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to generate blocks.' },
        { status: 401 }
      );
    }

    // Check user credits
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('credits, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if ((userProfile as any).credits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan or purchase more credits.' },
        { status: 403 }
      );
    }

    // Generate the block
    console.log(`🚀 Generating block for user ${user.id}: ${type} - "${prompt}"`);
    
    const result = await generateBlock({
      prompt,
      type: type as BlockType,
      userId: user.id,
      isPremium: isPremium || false,
      vibe: vibe || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to generate block',
          details: result.data // Include parsed data for debugging if available
        },
        { status: 500 }
      );
    }

    // Deduct credits using the database RPC function
    const { error: creditError } = await (supabase as any).rpc('deduct_credits', {
      user_id: user.id,
      amount: 1,
    });

    if (creditError) {
      console.error('Failed to deduct credits:', creditError);
      // Don't fail the request, just log the error
    }

    // Return success response
    return NextResponse.json({
      success: true,
      blockId: result.blockId,
      block: result.data,
      creditsRemaining: (userProfile as any).credits - 1,
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate - Check generation status
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get user's credits and subscription info
  const { data: userProfile } = await supabase
    .from('users')
    .select('credits, subscription_tier')
    .eq('id', user.id)
    .single();

  // Get user's recent blocks
  const { data: recentBlocks } = await supabase
    .from('blocks')
    .select('id, name, type, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    user: {
      id: user.id,
      credits: (userProfile as any)?.credits || 0,
      subscription_tier: (userProfile as any)?.subscription_tier || 'free',
    },
    recentBlocks: recentBlocks || [],
  });
}
