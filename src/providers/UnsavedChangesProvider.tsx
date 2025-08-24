'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UnsavedChangesDialog from '@/components/dialogs/UnsavedChangesDialog';

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  navigateWithConfirmation: (url: string) => Promise<void>;
  registerBeforeUnload: (callback: () => void) => void;
  unregisterBeforeUnload: () => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

interface UnsavedChangesProviderProps {
  children: React.ReactNode;
}

export const UnsavedChangesProvider: React.FC<UnsavedChangesProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const beforeUnloadCallbackRef = useRef<(() => void) | null>(null);

  // Handle browser refresh/close
  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Call custom handler if provided
        if (beforeUnloadCallbackRef.current) {
          beforeUnloadCallbackRef.current();
        }
        
        // Standard browser warning
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const navigateWithConfirmation = useCallback(async (url: string) => {
    // Don't show dialog if navigating to the same page
    if (url === pathname) {
      return;
    }

    if (hasUnsavedChanges) {
      return new Promise<void>((resolve) => {
        setPendingNavigation(url);
        setShowDialog(true);
        // Store resolve function to be called from dialog handlers
        (window as any).__navigationResolve = resolve;
      });
    } else {
      router.push(url);
    }
  }, [hasUnsavedChanges, pathname, router]);

  const registerBeforeUnload = useCallback((callback: () => void) => {
    beforeUnloadCallbackRef.current = callback;
  }, []);

  const unregisterBeforeUnload = useCallback(() => {
    beforeUnloadCallbackRef.current = null;
  }, []);

  // Dialog handlers
  const handleDialogClose = () => {
    setShowDialog(false);
    setPendingNavigation(null);
    if ((window as any).__navigationResolve) {
      (window as any).__navigationResolve();
      delete (window as any).__navigationResolve;
    }
  };

  const handleConfirmLeave = () => {
    setShowDialog(false);
    setHasUnsavedChanges(false); // Clear unsaved changes
    
    if ((window as any).__navigationResolve) {
      (window as any).__navigationResolve();
      delete (window as any).__navigationResolve;
    }
    
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleSaveAndLeave = () => {
    // TODO: Implement save functionality if needed
    handleConfirmLeave();
  };

  const contextValue: UnsavedChangesContextType = {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    navigateWithConfirmation,
    registerBeforeUnload,
    unregisterBeforeUnload
  };

  return (
    <UnsavedChangesContext.Provider value={contextValue}>
      {children}
      
      {/* Global Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showDialog}
        onClose={handleDialogClose}
        onConfirmLeave={handleConfirmLeave}
        onSaveAndLeave={handleSaveAndLeave}
        canSave={false} // Can be changed to true if save functionality is implemented
      />
    </UnsavedChangesContext.Provider>
  );
};

export const useUnsavedChangesContext = () => {
  const context = useContext(UnsavedChangesContext);
  if (context === undefined) {
    throw new Error('useUnsavedChangesContext must be used within an UnsavedChangesProvider');
  }
  return context;
};

export default UnsavedChangesProvider;
