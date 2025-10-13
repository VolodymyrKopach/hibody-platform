/**
 * Admin Authentication Hook
 * Custom hook for checking admin permissions in components
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminRole, AdminUser } from '@/types/admin';

interface UseAdminAuthReturn {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminUser: AdminUser | null;
  role: AdminRole | null;
  loading: boolean;
  error: string | null;
  checkPermission: (requiredRole: AdminRole) => boolean;
  refreshAuth: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API endpoint instead of using service directly
      const response = await fetch('/api/admin/auth/check', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to check admin access');
      }

      const data = await response.json();

      setIsAdmin(data.isAdmin);
      setIsSuperAdmin(data.isSuperAdmin);
      setAdminUser(data.user);
      
      if (data.user) {
        setRole(data.user.role);
      }

      // Redirect to home if not admin
      if (!data.isAdmin) {
        router.push('/');
      }
    } catch (err) {
      console.error('Error checking admin auth:', err);
      setError(err instanceof Error ? err.message : 'Failed to check admin access');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkPermission = (requiredRole: AdminRole): boolean => {
    if (!role) return false;
    if (role === 'super_admin') return true;
    return role === requiredRole;
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  return {
    isAdmin,
    isSuperAdmin,
    adminUser,
    role,
    loading,
    error,
    checkPermission,
    refreshAuth
  };
}

