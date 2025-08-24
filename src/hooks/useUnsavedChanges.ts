'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  onBeforeUnload?: () => void;
  onRouteChange?: () => Promise<boolean> | boolean; // true = allow navigation, false = block
  message?: string;
}

export const useUnsavedChanges = ({
  hasUnsavedChanges,
  onBeforeUnload,
  onRouteChange,
  message = 'You have unsaved changes. Are you sure you want to leave?'
}: UseUnsavedChangesOptions) => {
  const router = useRouter();
  const routeChangeRef = useRef<(() => Promise<boolean> | boolean) | undefined>(onRouteChange);
  
  // Update ref when callback changes
  useEffect(() => {
    routeChangeRef.current = onRouteChange;
  }, [onRouteChange]);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Call custom handler if provided
        if (onBeforeUnload) {
          onBeforeUnload();
        }
        
        // Standard browser warning
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, onBeforeUnload, message]);

  // Handle programmatic navigation
  const navigateWithConfirmation = useCallback(async (url: string) => {
    if (hasUnsavedChanges && routeChangeRef.current) {
      const canNavigate = await routeChangeRef.current();
      if (canNavigate) {
        router.push(url);
      }
    } else {
      router.push(url);
    }
  }, [hasUnsavedChanges, router]);

  return {
    navigateWithConfirmation
  };
};

export default useUnsavedChanges;
