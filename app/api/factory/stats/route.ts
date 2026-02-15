/**
 * Factory Stats API Route
 * 
 * Returns statistics about the automated block generation system
 * Publicly accessible (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getGenerationStats, BLOCK_CATEGORIES } from '@/lib/factory/randomizer';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get overall stats
    const { data: logs, error: logsError } = await supabase
      .from('factory_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      throw logsError;
    }

    // Get category stats
    const { data: categoryStats, error: statsError } = await supabase
      .from('factory_stats')
      .select('*');

    if (statsError) {
      console.warn('Failed to fetch factory_stats view:', statsError);
    }

    // Calculate derived stats
    const totalBlocks = logs?.length || 0;
    const successfulBlocks = logs?.filter((log: any) => log.success).length || 0;
    const failedBlocks = totalBlocks - successfulBlocks;
    const successRate = totalBlocks > 0 ? (successfulBlocks / totalBlocks) * 100 : 0;
    
    const avgGenerationTime = logs && logs.length > 0
      ? logs.reduce((sum: number, log: any) => sum + (log.generation_time_ms || 0), 0) / logs.length
      : 0;

    const lastGeneration: any = logs && logs.length > 0 ? logs[0] : null;

    // Get potential combinations
    const potential = getGenerationStats();

    // Get blocks generated in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentBlocks = logs?.filter((log: any) => log.created_at > oneDayAgo).length || 0;

    return NextResponse.json({
      success: true,
      stats: {
        total_blocks_generated: totalBlocks,
        successful: successfulBlocks,
        failed: failedBlocks,
        success_rate_percent: Math.round(successRate * 100) / 100,
        avg_generation_time_ms: Math.round(avgGenerationTime),
        blocks_last_24h: recentBlocks,
        last_generation: lastGeneration ? {
          category: lastGeneration.category,
          vibe: lastGeneration.vibe,
          success: lastGeneration.success,
          created_at: lastGeneration.created_at,
        } : null,
      },
      by_category: categoryStats || [],
      potential_combinations: potential,
      categories: BLOCK_CATEGORIES,
      recent_logs: logs?.slice(0, 10) || [],
    });

  } catch (error: any) {
    console.error('Failed to fetch factory stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}
