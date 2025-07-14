import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { 
  FormPersistenceService, 
  PersistedFormData, 
  StorageResult,
  formPersistenceService 
} from '@/services/persistence/FormPersistenceService';
import { FormValues, AgeGroupId } from '@/types/generation';

// === SOLID: SRP - Persistence context state ===
interface PersistenceState {
  savedForms: PersistedFormData[];
  currentFormId: string | null;
  isAutoSaving: boolean;
  lastSaved: number | null;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  error: string | null;
}

// === SOLID: SRP - Form persistence context interface ===
interface FormPersistenceContextType {
  // State
  state: PersistenceState;
  
  // Form management
  saveForm: (id: string, name: string, ageGroup: AgeGroupId, values: FormValues, description?: string) => Promise<boolean>;
  loadForm: (id: string) => Promise<PersistedFormData | null>;
  removeForm: (id: string) => Promise<boolean>;
  clearAllForms: () => Promise<boolean>;
  
  // Auto-save management
  startAutoSave: (id: string, name: string, ageGroup: AgeGroupId, getValues: () => FormValues) => void;
  stopAutoSave: (id: string) => void;
  
  // Form listing and filtering
  refreshForms: () => Promise<void>;
  getFormsByAgeGroup: (ageGroup: AgeGroupId) => PersistedFormData[];
  getRecentForms: (limit?: number) => PersistedFormData[];
  
  // Form utilities
  generateFormId: () => string;
  duplicateForm: (id: string, newName: string) => Promise<string | null>;
  
  // Import/Export
  exportForm: (id: string) => Promise<string | null>;
  importForm: (data: string) => Promise<string | null>;
  
  // Current form tracking
  setCurrentFormId: (id: string | null) => void;
  getCurrentForm: () => PersistedFormData | null;
  
  // Storage stats
  getStorageStats: () => {
    totalForms: number;
    totalSize: number;
    oldestForm: PersistedFormData | null;
    newestForm: PersistedFormData | null;
  };
}

// === SOLID: SRP - Create persistence context ===
const FormPersistenceContext = createContext<FormPersistenceContextType | null>(null);

// === SOLID: SRP - Persistence provider props ===
interface FormPersistenceProviderProps {
  children: React.ReactNode;
  service?: FormPersistenceService;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// === SOLID: SRP - Persistence provider component ===
export const FormPersistenceProvider: React.FC<FormPersistenceProviderProps> = ({
  children,
  service = formPersistenceService,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
}) => {
  // === SOLID: SRP - Component state ===
  const [state, setState] = useState<PersistenceState>({
    savedForms: [],
    currentFormId: null,
    isAutoSaving: false,
    lastSaved: null,
    saveStatus: 'idle',
    error: null
  });
  
  // === SOLID: SRP - Save form ===
  const saveForm = useCallback(async (
    id: string,
    name: string,
    ageGroup: AgeGroupId,
    values: FormValues,
    description?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, saveStatus: 'saving', error: null }));
    
    try {
      const result = await service.saveForm(id, name, ageGroup, values, false, description);
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          saveStatus: 'success', 
          lastSaved: Date.now() 
        }));
        
        // Refresh forms list
        await refreshForms();
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          saveStatus: 'error', 
          error: result.error || 'Failed to save form' 
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        saveStatus: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
      return false;
    }
  }, [service]);
  
  // === SOLID: SRP - Load form ===
  const loadForm = useCallback(async (id: string): Promise<PersistedFormData | null> => {
    try {
      const result = await service.loadForm(id);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to load form' 
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
      return null;
    }
  }, [service]);
  
  // === SOLID: SRP - Remove form ===
  const removeForm = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await service.removeForm(id);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          currentFormId: prev.currentFormId === id ? null : prev.currentFormId
        }));
        await refreshForms();
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to remove form' 
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
      return false;
    }
  }, [service]);
  
  // === SOLID: SRP - Clear all forms ===
  const clearAllForms = useCallback(async (): Promise<boolean> => {
    try {
      const result = await service.clearForms();
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          savedForms: [],
          currentFormId: null
        }));
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to clear forms' 
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
      return false;
    }
  }, [service]);
  
  // === SOLID: SRP - Start auto-save ===
  const startAutoSave = useCallback((
    id: string,
    name: string,
    ageGroup: AgeGroupId,
    getValues: () => FormValues
  ) => {
    setState(prev => ({ ...prev, isAutoSaving: true }));
    service.startAutoSave(id, name, ageGroup, getValues);
  }, [service]);
  
  // === SOLID: SRP - Stop auto-save ===
  const stopAutoSave = useCallback((id: string) => {
    setState(prev => ({ ...prev, isAutoSaving: false }));
    service.stopAutoSave(id);
  }, [service]);
  
  // === SOLID: SRP - Refresh forms list ===
  const refreshForms = useCallback(async () => {
    try {
      const result = await service.listForms();
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          savedForms: result.data || [],
          error: null
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to refresh forms' 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [service]);
  
  // === SOLID: SRP - Get forms by age group ===
  const getFormsByAgeGroup = useCallback((ageGroup: AgeGroupId): PersistedFormData[] => {
    return state.savedForms.filter(form => form.ageGroup === ageGroup);
  }, [state.savedForms]);
  
  // === SOLID: SRP - Get recent forms ===
  const getRecentForms = useCallback((limit: number = 10): PersistedFormData[] => {
    return state.savedForms.slice(0, limit);
  }, [state.savedForms]);
  
  // === SOLID: SRP - Generate form ID ===
  const generateFormId = useCallback((): string => {
    return service.generateFormId();
  }, [service]);
  
  // === SOLID: SRP - Duplicate form ===
  const duplicateForm = useCallback(async (id: string, newName: string): Promise<string | null> => {
    try {
      const originalForm = await loadForm(id);
      if (!originalForm) return null;
      
      const newId = generateFormId();
      const success = await saveForm(newId, newName, originalForm.ageGroup, originalForm.values);
      
      return success ? newId : null;
    } catch (error) {
      console.error('Duplicate form error:', error);
      return null;
    }
  }, [loadForm, generateFormId, saveForm]);
  
  // === SOLID: SRP - Export form ===
  const exportForm = useCallback(async (id: string): Promise<string | null> => {
    try {
      const result = await service.exportForm(id);
      return result.success ? result.data || null : null;
    } catch (error) {
      console.error('Export form error:', error);
      return null;
    }
  }, [service]);
  
  // === SOLID: SRP - Import form ===
  const importForm = useCallback(async (data: string): Promise<string | null> => {
    try {
      const result = await service.importForm(data);
      if (result.success) {
        await refreshForms();
        return result.data || null;
      }
      return null;
    } catch (error) {
      console.error('Import form error:', error);
      return null;
    }
  }, [service, refreshForms]);
  
  // === SOLID: SRP - Set current form ID ===
  const setCurrentFormId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, currentFormId: id }));
  }, []);
  
  // === SOLID: SRP - Get current form ===
  const getCurrentForm = useCallback((): PersistedFormData | null => {
    if (!state.currentFormId) return null;
    return state.savedForms.find(form => form.id === state.currentFormId) || null;
  }, [state.currentFormId, state.savedForms]);
  
  // === SOLID: SRP - Get storage stats ===
  const getStorageStats = useCallback(() => {
    const forms = state.savedForms;
    const totalForms = forms.length;
    const totalSize = forms.reduce((sum, form) => sum + JSON.stringify(form).length, 0);
    const oldestForm = forms.reduce((oldest, form) => 
      !oldest || form.timestamp < oldest.timestamp ? form : oldest, null as PersistedFormData | null);
    const newestForm = forms.reduce((newest, form) => 
      !newest || form.timestamp > newest.timestamp ? form : newest, null as PersistedFormData | null);
    
    return {
      totalForms,
      totalSize,
      oldestForm,
      newestForm
    };
  }, [state.savedForms]);
  
  // === SOLID: SRP - Initialize forms on mount ===
  useEffect(() => {
    refreshForms();
  }, [refreshForms]);
  
  // === SOLID: SRP - Auto-refresh forms ===
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshForms();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshForms]);
  
  // === SOLID: SRP - Cleanup on unmount ===
  useEffect(() => {
    return () => {
      service.destroy();
    };
  }, [service]);
  
  // === SOLID: SRP - Context value ===
  const contextValue = useMemo<FormPersistenceContextType>(() => ({
    state,
    saveForm,
    loadForm,
    removeForm,
    clearAllForms,
    startAutoSave,
    stopAutoSave,
    refreshForms,
    getFormsByAgeGroup,
    getRecentForms,
    generateFormId,
    duplicateForm,
    exportForm,
    importForm,
    setCurrentFormId,
    getCurrentForm,
    getStorageStats
  }), [
    state,
    saveForm,
    loadForm,
    removeForm,
    clearAllForms,
    startAutoSave,
    stopAutoSave,
    refreshForms,
    getFormsByAgeGroup,
    getRecentForms,
    generateFormId,
    duplicateForm,
    exportForm,
    importForm,
    setCurrentFormId,
    getCurrentForm,
    getStorageStats
  ]);
  
  return (
    <FormPersistenceContext.Provider value={contextValue}>
      {children}
    </FormPersistenceContext.Provider>
  );
};

// === SOLID: SRP - Custom hook for form persistence ===
export const useFormPersistence = (): FormPersistenceContextType => {
  const context = useContext(FormPersistenceContext);
  if (!context) {
    throw new Error('useFormPersistence must be used within a FormPersistenceProvider');
  }
  return context;
};

// === SOLID: SRP - Custom hook for auto-save ===
export const useAutoSave = (
  formId: string,
  formName: string,
  ageGroup: AgeGroupId,
  getValues: () => FormValues,
  enabled: boolean = true
) => {
  const persistence = useFormPersistence();
  
  useEffect(() => {
    if (enabled && formId) {
      persistence.startAutoSave(formId, formName, ageGroup, getValues);
      return () => {
        persistence.stopAutoSave(formId);
      };
    }
  }, [enabled, formId, formName, ageGroup, getValues, persistence]);
  
  return {
    isAutoSaving: persistence.state.isAutoSaving,
    lastSaved: persistence.state.lastSaved,
    saveStatus: persistence.state.saveStatus
  };
};

// === SOLID: SRP - Custom hook for form operations ===
export const useFormOperations = (formId?: string) => {
  const persistence = useFormPersistence();
  
  return useMemo(() => ({
    save: (name: string, ageGroup: AgeGroupId, values: FormValues, description?: string) => 
      persistence.saveForm(formId || persistence.generateFormId(), name, ageGroup, values, description),
    load: () => formId ? persistence.loadForm(formId) : Promise.resolve(null),
    remove: () => formId ? persistence.removeForm(formId) : Promise.resolve(false),
    duplicate: (newName: string) => formId ? persistence.duplicateForm(formId, newName) : Promise.resolve(null),
    export: () => formId ? persistence.exportForm(formId) : Promise.resolve(null),
    isCurrentForm: formId === persistence.state.currentFormId,
    setCurrent: () => persistence.setCurrentFormId(formId || null)
  }), [formId, persistence]);
};

// === SOLID: SRP - Export persistence context type ===
export type { FormPersistenceContextType, PersistenceState }; 