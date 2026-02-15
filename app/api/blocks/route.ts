import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { Block } from '@/types/database'

// GET /api/blocks - Fetch all blocks (with filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const isPremium = searchParams.get('premium')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('blocks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    
    if (isPremium !== null) {
      query = query.eq('is_premium', isPremium === 'true')
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch blocks', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      data,
      count: data?.length || 0,
      filters: { type, isPremium, limit }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// POST /api/blocks - Create a new block (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.type || !body.name || !body.code) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name, code' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('blocks')
      .insert({
        type: body.type,
        name: body.name,
        description: body.description || null,
        code: body.code,
        config: body.config || {},
        tags: body.tags || [],
        is_premium: body.is_premium || false,
        required_tier: body.required_tier || null,
        created_by: user.id,
      } as any)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create block', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      data 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
