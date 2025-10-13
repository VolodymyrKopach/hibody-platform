/**
 * Admin Authentication Service
 * Handles admin access verification and permission checks
 */

import { createClient } from '@/lib/supabase/client';
import type { AdminRole, AdminUser } from '@/types/admin';

class AdminAuthService {
  /**
   * Get the Supabase client (browser client only)
   * This service is designed to be used in client components
   */
  private getClient() {
    return createClient();
  }

  /**
   * Check if current user is an admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('🔍 AdminAuthService.isAdmin: Checking user:', {
        userId: user?.id,
        email: user?.email
      });
      
      if (!user) {
        console.log('❌ AdminAuthService.isAdmin: No user found');
        return false;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role, user_id')
        .eq('user_id', user.id)
        .single();

      console.log('📊 AdminAuthService.isAdmin: Query result:', {
        data,
        error: error?.message,
        hasData: !!data,
        isAdmin: !error && !!data
      });

      return !error && !!data;
    } catch (error) {
      console.error('❌ AdminAuthService.isAdmin: Error:', error);
      return false;
    }
  }

  /**
   * Check if current user is a super admin
   */
  async isSuperAdmin(): Promise<boolean> {
    try {
      const supabase = this.getClient();
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
      console.error('Error checking super admin status:', error);
      return false;
    }
  }

  /**
   * Get admin user info for current user
   */
  async getAdminUser(): Promise<AdminUser | null> {
    try {
      const supabase = this.getClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          email:user_id(email),
          full_name:user_id(raw_user_meta_data->full_name)
        `)
        .eq('user_id', user.id)
        .single();

      if (error || !data) return null;

      return {
        ...data,
        email: (data as any).email?.email,
        full_name: (data as any).full_name?.full_name
      } as AdminUser;
    } catch (error) {
      console.error('Error getting admin user:', error);
      return null;
    }
  }

  /**
   * Get admin role for current user
   */
  async getAdminRole(): Promise<AdminRole | null> {
    try {
      const supabase = this.getClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return null;

      return data.role as AdminRole;
    } catch (error) {
      console.error('Error getting admin role:', error);
      return null;
    }
  }

  /**
   * Check if user has required permission
   */
  async hasPermission(requiredRole: AdminRole): Promise<boolean> {
    try {
      const role = await this.getAdminRole();
      if (!role) return false;

      // Super admin has all permissions
      if (role === 'super_admin') return true;

      // Check if role matches required role
      return role === requiredRole;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Verify admin access and throw error if not authorized
   */
  async verifyAdminAccess(): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
  }

  /**
   * Verify super admin access and throw error if not authorized
   */
  async verifySuperAdminAccess(): Promise<void> {
    const isSuperAdmin = await this.isSuperAdmin();
    if (!isSuperAdmin) {
      throw new Error('Unauthorized: Super admin access required');
    }
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();

