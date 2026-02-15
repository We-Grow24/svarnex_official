import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test 1: Check connection
    const { data: testData, error: testError } = await supabase
      .from('blocks')
      .select('count')
      .limit(1)
    
    if (testError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed', 
          details: testError.message 
        },
        { status: 500 }
      )
    }
    
    // Test 2: Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful! ✅',
      connection: {
        database: '✅ Connected',
        tablesAccessible: '✅ Tables accessible',
        authentication: user ? `✅ Authenticated as ${user.email}` : '⚠️ Not authenticated (this is OK for public routes)',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
