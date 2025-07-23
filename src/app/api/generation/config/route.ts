import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AgeGroupConfig, FormValues } from '@/types/generation';

// === SOLID: SRP - Types for configuration management ===
interface SaveConfigRequest {
  name: string;
  ageGroupId: string;
  formValues: FormValues;
  description?: string;
  isTemplate?: boolean;
}

interface SaveConfigResponse {
  success: boolean;
  config?: {
    id: string;
    name: string;
    ageGroupId: string;
    formValues: FormValues;
    description?: string;
    isTemplate: boolean;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
  message?: string;
}

interface GetConfigsResponse {
  success: boolean;
  configs?: Array<{
    id: string;
    name: string;
    ageGroupId: string;
    formValues: FormValues;
    description?: string;
    isTemplate: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  error?: string;
}

// === SOLID: SRP - Error handling ===
class ConfigAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ConfigAPIError';
  }
}

// === SOLID: SRP - Authentication helper ===
async function authenticate(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new ConfigAPIError('Authentication required', 401, 'UNAUTHORIZED');
  }
  
  return user;
}

// === SOLID: SRP - Configuration validation ===
function validateSaveRequest(body: any): SaveConfigRequest {
  if (!body.name || typeof body.name !== 'string') {
    throw new ConfigAPIError('Configuration name is required', 400, 'MISSING_NAME');
  }
  
  if (!body.ageGroupId || typeof body.ageGroupId !== 'string') {
    throw new ConfigAPIError('Age group ID is required', 400, 'MISSING_AGE_GROUP');
  }
  
  if (!body.formValues || typeof body.formValues !== 'object') {
    throw new ConfigAPIError('Form values are required', 400, 'MISSING_FORM_VALUES');
  }
  
  return {
    name: body.name.trim(),
    ageGroupId: body.ageGroupId,
    formValues: body.formValues,
    description: body.description?.trim(),
    isTemplate: body.isTemplate || false
  };
}

// === SOLID: SRP - POST endpoint for saving configurations ===
export async function POST(request: NextRequest) {
  try {
    console.log('💾 CONFIG API: Saving configuration');
    
    // === SOLID: SRP - Parse and validate request ===
    const body = await request.json();
    const configData = validateSaveRequest(body);
    
    // === SOLID: SRP - Authenticate user ===
    const user = await authenticate(request);
    
    console.log('📋 CONFIG API: Saving config for user:', user.id);
    
    // === SOLID: SRP - Save configuration to database ===
    const supabase = await createClient();
    
    // Use lessons table to store configurations temporarily
    // In a real app, you'd create a dedicated configurations table
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        user_id: user.id,
        title: configData.name,
        description: configData.description || 'Configuration created by constructor',
        subject: 'Configuration',
        age_group: configData.ageGroupId,
        duration: 0,
        difficulty: 'medium',
        status: 'draft',
        is_public: configData.isTemplate,
        tags: ['configuration', 'template'],
        metadata: {
          type: 'configuration',
          isTemplate: configData.isTemplate,
          formValues: configData.formValues,
          createdBy: 'constructor'
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ CONFIG API: Error saving configuration:', error);
      throw new ConfigAPIError('Failed to save configuration', 500, 'SAVE_ERROR');
    }
    
    console.log('✅ CONFIG API: Configuration saved with ID:', data.id);
    
    // === SOLID: SRP - Format response ===
    const response: SaveConfigResponse = {
      success: true,
      config: {
        id: data.id,
        name: data.title,
        ageGroupId: data.age_group,
        formValues: data.metadata.formValues,
        description: data.description,
        isTemplate: data.metadata.isTemplate,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      message: 'Configuration saved successfully'
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('❌ CONFIG API: Error saving configuration:', error);
    
    if (error instanceof ConfigAPIError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        message: error.message
      }, { status: error.statusCode });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// === SOLID: SRP - GET endpoint for retrieving configurations ===
export async function GET(request: NextRequest) {
  try {
    console.log('📋 CONFIG API: Getting configurations');
    
    // === SOLID: SRP - Authenticate user ===
    const user = await authenticate(request);
    
    // === SOLID: SRP - Parse query parameters ===
    const url = new URL(request.url);
    const ageGroupId = url.searchParams.get('ageGroupId');
    const templatesOnly = url.searchParams.get('templatesOnly') === 'true';
    
    console.log('🔍 CONFIG API: Query params:', { ageGroupId, templatesOnly });
    
    // === SOLID: SRP - Build query ===
    const supabase = await createClient();
    let query = supabase
      .from('lessons')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject', 'Configuration');
    
    if (ageGroupId) {
      query = query.eq('age_group', ageGroupId);
    }
    
    if (templatesOnly) {
      query = query.eq('is_public', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ CONFIG API: Error getting configurations:', error);
      throw new ConfigAPIError('Failed to get configurations', 500, 'GET_ERROR');
    }
    
    console.log('✅ CONFIG API: Found configurations:', data.length);
    
    // === SOLID: SRP - Format response ===
    const response: GetConfigsResponse = {
      success: true,
      configs: data.map(config => ({
        id: config.id,
        name: config.title,
        ageGroupId: config.age_group,
        formValues: config.metadata?.formValues || {},
        description: config.description,
        isTemplate: config.metadata?.isTemplate || false,
        createdAt: config.created_at,
        updatedAt: config.updated_at
      }))
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ CONFIG API: Error getting configurations:', error);
    
    if (error instanceof ConfigAPIError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: error.statusCode });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// === SOLID: SRP - DELETE endpoint for removing configurations ===
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ CONFIG API: Deleting configuration');
    
    // === SOLID: SRP - Authenticate user ===
    const user = await authenticate(request);
    
    // === SOLID: SRP - Parse query parameters ===
    const url = new URL(request.url);
    const configId = url.searchParams.get('id');
    
    if (!configId) {
      throw new ConfigAPIError('Configuration ID is required', 400, 'MISSING_ID');
    }
    
    console.log('🗑️ CONFIG API: Deleting config ID:', configId);
    
    // === SOLID: SRP - Delete configuration ===
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', configId)
      .eq('user_id', user.id)
      .eq('subject', 'Configuration');
    
    if (error) {
      console.error('❌ CONFIG API: Error deleting configuration:', error);
      throw new ConfigAPIError('Failed to delete configuration', 500, 'DELETE_ERROR');
    }
    
    console.log('✅ CONFIG API: Configuration deleted successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ CONFIG API: Error deleting configuration:', error);
    
    if (error instanceof ConfigAPIError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: error.statusCode });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 