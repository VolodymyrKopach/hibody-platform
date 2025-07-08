'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface ProtectedPageProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ 
  children, 
  fallback = <LoadingScreen />
}) => {
  const { user, loading } = useAuth();

  // Показуємо завантаження тільки поки йде ініціалізація авторизації
  // Якщо користувач не авторизований, middleware має виконати редирект
  if (loading) {
    return <>{fallback}</>;
  }

  // Якщо користувач не авторизований після завершення loading,
  // не показуємо fallback - дозволяємо middleware виконати редирект
  if (!user) {
    return null;
  }

  // Користувач авторизований, показуємо контент
  return <>{children}</>;
};

export default ProtectedPage; 