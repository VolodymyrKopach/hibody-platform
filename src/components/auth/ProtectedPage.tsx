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

  // Show loading only while authentication is initializing
  // If the user is not authenticated, middleware should perform a redirect
  if (loading) {
    return <>{fallback}</>;
  }

  // If the user is not authenticated after loading is complete,
  // do not show fallback - allow middleware to perform a redirect
  if (!user) {
    return null;
  }

  // User is authenticated, show content
  return <>{children}</>;
};

export default ProtectedPage; 