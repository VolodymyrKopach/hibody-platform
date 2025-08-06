'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes - accessible without authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/register', 
    '/test',
    '/not-found'  // 404 page is accessible to all
  ];

  // Routes for unauthenticated users only - authenticated users will be redirected
  const authOnlyRoutes = [
    '/auth/login',
    '/auth/register'
  ];

  // Protected routes - require authentication
  const protectedRoutes = [
    '/',
    '/chat',
    '/materials',
    '/account'
  ];

  // Memoize route calculations to prevent unnecessary re-renders
  const routeInfo = useMemo(() => {
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
    const isAuthOnlyRoute = authOnlyRoutes.some(route => pathname?.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));
    const isKnownRoute = isPublicRoute || isProtectedRoute;
    
    return { isPublicRoute, isAuthOnlyRoute, isProtectedRoute, isKnownRoute };
  }, [pathname]);

  const { isPublicRoute, isAuthOnlyRoute, isProtectedRoute, isKnownRoute } = routeInfo;

  useEffect(() => {
    // Do nothing while loading
    if (loading) return;

    console.log(`🛡️ RouteGuard: Checking access to ${pathname}`);
    console.log(`🛡️ RouteGuard: User status: ${user ? `Authenticated (${user.email})` : 'Not authenticated'}`);
    
    // Determine route type for logging
    let routeType = 'Unknown';
    if (isPublicRoute) routeType = 'Public';
    else if (isProtectedRoute) routeType = 'Protected';
    else if (!isKnownRoute) routeType = '404/Not Found';
    
    console.log(`🛡️ RouteGuard: Route type: ${routeType}`);

    // If this is an unknown route (404), allow the 404 page to show
    if (!isKnownRoute) {
      console.log(`📄 RouteGuard: Unknown route, allowing 404 page to show`);
      return;
    }

    // If the user is not authenticated and tries to access a protected page
    if (!user && isProtectedRoute) {
      console.log(`🔄 RouteGuard: Redirecting unauthorized user to login`);
      const redirectUrl = `/auth/login?redirectTo=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
      return;
    }

    // If the user is authenticated and tries to access an authentication page
    if (user && isAuthOnlyRoute) {
      // Check if redirectTo parameter exists
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo');
      
      if (redirectTo && redirectTo !== '/auth/login' && redirectTo !== '/auth/register') {
        console.log(`🔄 RouteGuard: Redirecting authenticated user to saved URL: ${redirectTo}`);
        router.replace(redirectTo);
      } else {
        console.log(`🔄 RouteGuard: Redirecting authenticated user to home`);
        router.replace('/');
      }
      return;
    }

    console.log(`✅ RouteGuard: Access granted to ${pathname}`);
  }, [user, loading, pathname, router, routeInfo]);

  // Show loading screen while authentication is being checked
  if (loading) {
    return <LoadingScreen />;
  }

  // For unauthenticated users on protected pages, show loading
  // while the redirect is in progress
  if (!user && isProtectedRoute) {
    return <LoadingScreen />;
  }

  // For authenticated users on authentication pages, show loading
  // while the redirect is in progress
  if (user && isAuthOnlyRoute) {
    return <LoadingScreen />;
  }

  // In other cases, show content (including 404)
  return <>{children}</>;
};

export default RouteGuard; 