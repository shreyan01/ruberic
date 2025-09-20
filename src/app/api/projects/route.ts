import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyManager } from '@/lib/api-keys';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Project management endpoint for customers
 * 
 * GET /api/projects?apiKey=xxx - List customer's projects
 * POST /api/projects - Create a new project
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Verify API key
    const keyVerification = await ApiKeyManager.verifyApiKey(apiKey);
    
    if (!keyVerification.isValid || !keyVerification.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      );
    }

    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        documents (
          id,
          filename,
          upload_status,
          created_at
        )
      `)
      .eq('user_id', keyVerification.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, apiKey } = await request.json();

    if (!name || !apiKey) {
      return NextResponse.json(
        { error: 'Project name and API key are required' },
        { status: 400 }
      );
    }

    // Verify API key
    const keyVerification = await ApiKeyManager.verifyApiKey(apiKey);
    
    if (!keyVerification.isValid || !keyVerification.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      );
    }

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: keyVerification.userId,
        name,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return NextResponse.json({
      project,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
