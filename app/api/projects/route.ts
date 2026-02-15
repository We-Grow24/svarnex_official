/**
 * API Route: /api/projects
 * Create and manage user projects
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { assembleWebsite, generateSubdomain } from '@/lib/assembler';
import type { WizardFormData } from '@/components/create/wizard';

/**
 * POST /api/projects
 * Create a new website project
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { formData } = body as { formData: WizardFormData };

    // Validate required fields
    if (!formData || !formData.brandName || !formData.industry || !formData.vibe) {
      return NextResponse.json(
        { error: 'Missing required fields: brandName, industry, and vibe are required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to create projects.' },
        { status: 401 }
      );
    }

    // Assemble the website from user preferences
    console.log('🏗️  Assembling website for:', formData.brandName);
    const assembledProject = assembleWebsite(formData);

    // Generate unique subdomain
    const subdomain = generateSubdomain(formData.brandName);

    // Prepare project data for database
    const projectData = {
      user_id: user.id,
      name: assembledProject.name,
      description: assembledProject.description,
      subdomain,
      blocks: assembledProject.blocks,
      global_config: assembledProject.globalConfig,
      meta_title: assembledProject.metaTitle,
      meta_description: assembledProject.metaDescription,
      is_published: false,
    };

    // Save to database
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert(projectData as any)
      .select('id, name, subdomain, created_at')
      .single();

    if (insertError) {
      console.error('Failed to save project:', insertError);
      return NextResponse.json(
        { error: 'Failed to create project', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Project created:', (project as any)?.id);

    // Return success response
    return NextResponse.json({
      success: true,
      project: {
        id: (project as any)?.id,
        name: (project as any)?.name,
        subdomain: (project as any)?.subdomain,
        createdAt: (project as any)?.created_at,
        blocks: assembledProject.blocks,
      },
      message: 'Website created successfully!',
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
 * GET /api/projects
 * Get all projects for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's projects
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Failed to fetch projects:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projects: projects || [],
      count: projects?.length || 0,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects?id=<project_id>
 * Delete a project
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership and delete
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Failed to delete project:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
