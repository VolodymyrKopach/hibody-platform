'use client';

import React, { useEffect } from 'react';
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

  // Публічні маршрути - доступні без авторизації
  const publicRoutes = [
    '/auth/login',
    '/auth/register', 
    '/test'
  ];

  // Маршрути тільки для неавторизованих - авторизовані користувачі будуть перенаправлені
  const authOnlyRoutes = [
    '/auth/login',
    '/auth/register'
  ];

  // Захищені маршрути - потребують авторизації
  const protectedRoutes = [
    '/',
    '/chat',
    '/materials',
    '/account'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
  const isAuthOnlyRoute = authOnlyRoutes.some(route => pathname?.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));

  useEffect(() => {
    // Не робимо нічого поки йде завантаження
    if (loading) return;

    console.log(`🛡️ RouteGuard: Checking access to ${pathname}`);
    console.log(`🛡️ RouteGuard: User status: ${user ? `Authenticated (${user.email})` : 'Not authenticated'}`);
    console.log(`🛡️ RouteGuard: Route type: ${isPublicRoute ? 'Public' : isProtectedRoute ? 'Protected' : 'Unknown'}`);

    // Якщо користувач не авторизований і намагається потрапити на захищену сторінку
    if (!user && isProtectedRoute) {
      console.log(`🔄 RouteGuard: Redirecting unauthorized user to login`);
      const redirectUrl = `/auth/login?redirectTo=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
      return;
    }

    // Якщо користувач авторизований і намагається потрапити на сторінку авторизації
    if (user && isAuthOnlyRoute) {
      // Перевіряємо чи є redirectTo параметр
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
  }, [user, loading, pathname, router, isPublicRoute, isAuthOnlyRoute, isProtectedRoute]);

  // Показуємо loading screen поки йде перевірка авторизації
  if (loading) {
    return <LoadingScreen message="Перевірка доступу..." />;
  }

  // Для неавторизованих користувачів на захищених сторінках показуємо loading
  // поки відбувається редирект
  if (!user && isProtectedRoute) {
    return <LoadingScreen message="Перенаправлення на сторінку входу..." />;
  }

  // Для авторизованих користувачів на сторінках авторизації показуємо loading
  // поки відбувається редирект
  if (user && isAuthOnlyRoute) {
    return <LoadingScreen message="Перенаправлення..." />;
  }

  // В інших випадках показуємо контент
  return <>{children}</>;
};

export default RouteGuard; 