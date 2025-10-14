/**
 * Admin Settings API - Platform Settings
 * GET/PUT /api/admin/settings/platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all platform settings
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('category', 'general');

    // Convert to simple object
    const settingsObj: any = {
      maintenance_mode: false,
      registration_enabled: true,
      ai_generation_enabled: true,
      default_generation_limit: 10,
      max_generation_limit: 100,
      default_ai_model: 'claude-3-sonnet',
      available_ai_models: ['claude-3-sonnet', 'claude-3-opus', 'gpt-4', 'gpt-3.5-turbo'],
      feature_flags: {
        chat_enabled: true,
        worksheets_enabled: true,
        slide_editing_enabled: true,
        batch_generation_enabled: true,
      },
    };

    settings?.forEach(setting => {
      settingsObj[setting.setting_key] = JSON.parse(setting.setting_value as string);
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const updates = await request.json();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      await supabase
        .from('platform_settings')
        .upsert({
          setting_key: key,
          setting_value: JSON.stringify(value),
          setting_type: typeof value,
          category: 'general',
          updated_by: currentUser.id,
        }, {
          onConflict: 'setting_key',
        });
    }

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

