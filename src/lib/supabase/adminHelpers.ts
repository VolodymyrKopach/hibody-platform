/**
 * Admin Helpers for Server-Side
 * Functions to check admin access in server components and API routes
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Check if the current user is an admin (server-side)
 */
export async function isAdminServer(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, role, user_id')
      .eq('user_id', user.id)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking admin status (server):', error);
    return false;
  }
}

/**
 * Check if the current user is a super admin (server-side)
 */
export async function isSuperAdminServer(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking super admin status (server):', error);
    return false;
  }
}

/**
 * Get admin role for the current user (server-side)
 */
export async function getAdminRoleServer(): Promise<'super_admin' | 'admin' | 'moderator' | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return data.role as 'super_admin' | 'admin' | 'moderator';
  } catch (error) {
    console.error('Error getting admin role (server):', error);
    return null;
  }
}

