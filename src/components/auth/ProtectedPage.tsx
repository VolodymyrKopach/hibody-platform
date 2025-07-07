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
  fallback = <LoadingScreen message="Перевірка авторизації..." />
}) => {
  const { user, loading } = useAuth();

  // Показуємо завантаження поки йде перевірка авторизації
  if (loading) {
    return <>{fallback}</>;
  }

  // Якщо користувач не авторизований, показуємо завантаження
  // (редирект буде виконано AuthProvider або middleware)
  if (!user) {
    return <>{fallback}</>;
  }

  // Користувач авторизований, показуємо контент
  return <>{children}</>;
};

export default ProtectedPage; 