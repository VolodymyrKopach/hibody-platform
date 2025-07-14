/**
 * === SOLID: SRP - History Provider ===
 * 
 * This provider manages the history state for the entire application,
 * integrating with the form system and providing undo/redo capabilities.
 */

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useCallback, 
  useEffect, 
  useRef
} from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HistoryService, 
  HistoryState, 
  HistoryStats, 
  HistoryEntry,
  HistoryOperationType,
  historyService 
} from '@/services/history/HistoryService';
import { FormValues, ValidationErrors } from '@/types/generation';

// === SOLID: ISP - Specific interfaces for history context ===
export interface HistoryContextValue {
  // State
  currentState: HistoryState;
  stats: HistoryStats;
  isTracking: boolean;
  
  // Actions
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // History management
  addFieldChange: (fieldName: string, oldValue: any, newValue: any, fieldType?: string) => void;
  addBulkChange: (changes: Record<string, { oldValue: any; newValue: any }>, description: string) => void;
  addFormLoad: (formValues: FormValues, ageGroupId?: string) => void;
  addFormReset: () => void;
  
  // Control
  startTracking: () => void;
  stopTracking: () => void;
  clearHistory: () => void;
  
  // Information
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
  getHistory: () => HistoryEntry[];
  
  // Keyboard shortcuts
  registerKeyboardShortcuts: () => void;
  unregisterKeyboardShortcuts: () => void;
}

// === SOLID: SRP - History reducer state ===
interface HistoryProviderState {
  currentState: HistoryState;
  stats: HistoryStats;
  isTracking: boolean;
}

// === SOLID: SRP - History reducer actions ===
type HistoryAction = 
  | { type: 'SET_CURRENT_STATE'; payload: HistoryState }
  | { type: 'UPDATE_STATS'; payload: HistoryStats }
  | { type: 'START_TRACKING' }
  | { type: 'STOP_TRACKING' }
  | { type: 'CLEAR_HISTORY' };

// === SOLID: SRP - History reducer ===
const historyReducer = (state: HistoryProviderState, action: HistoryAction): HistoryProviderState => {
  switch (action.type) {
    case 'SET_CURRENT_STATE':
      return {
        ...state,
        currentState: action.payload
      };
      
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: action.payload
      };
      
    case 'START_TRACKING':
      return {
        ...state,
        isTracking: true
      };
      
    case 'STOP_TRACKING':
      return {
        ...state,
        isTracking: false
      };
      
    case 'CLEAR_HISTORY':
      return {
        ...state,
        currentState: {
          formValues: {},
          errors: {},
          activeField: undefined,
          ageGroupId: undefined
        },
        stats: {
          totalEntries: 0,
          currentPosition: -1,
          canUndo: false,
          canRedo: false,
          memoryUsage: 0
        }
      };
      
    default:
      return state;
  }
};

// === SOLID: SRP - Initial state ===
const initialState: HistoryProviderState = {
  currentState: {
    formValues: {},
    errors: {},
    activeField: undefined,
    ageGroupId: undefined
  },
  stats: {
    totalEntries: 0,
    currentPosition: -1,
    canUndo: false,
    canRedo: false,
    memoryUsage: 0
  },
  isTracking: true
};

// === SOLID: SRP - Context creation ===
const HistoryContext = createContext<HistoryContextValue | null>(null);

// === SOLID: SRP - Provider props ===
interface HistoryProviderProps {
  children: React.ReactNode;
  initialFormValues?: FormValues;
  ageGroupId?: string;
  excludeFields?: string[];
  maxHistorySize?: number;
  debounceMs?: number;
}

// === SOLID: SRP - History Provider Component ===
export const HistoryProvider: React.FC<HistoryProviderProps> = ({
  children,
  initialFormValues = {},
  ageGroupId,
  excludeFields = [],
  maxHistorySize = 100,
  debounceMs = 500
}) => {
  const { t } = useTranslation(['common', 'generation']);
  const [state, dispatch] = useReducer(historyReducer, {
    ...initialState,
    currentState: {
      ...initialState.currentState,
      formValues: initialFormValues,
      ageGroupId
    }
  });
  
  // === SOLID: SRP - Service reference ===
  const serviceRef = useRef<HistoryService>(
    new HistoryService({
      maxHistorySize,
      debounceMs,
      excludeFields,
      groupRelatedChanges: true
    })
  );
  
  // === SOLID: SRP - Keyboard shortcuts reference ===
  const keyboardHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  
  // === SOLID: SRP - Update stats ===
  const updateStats = useCallback(() => {
    const newStats = serviceRef.current.getStats();
    dispatch({ type: 'UPDATE_STATS', payload: newStats });
  }, []);
  
  // === SOLID: SRP - Undo operation ===
  const undo = useCallback(() => {
    if (!state.isTracking) return;
    
    const newState = serviceRef.current.undo();
    if (newState) {
      dispatch({ type: 'SET_CURRENT_STATE', payload: newState });
      updateStats();
      
      console.log('↶ PROVIDER: Undo performed');
    }
  }, [state.isTracking, updateStats]);
  
  // === SOLID: SRP - Redo operation ===
  const redo = useCallback(() => {
    if (!state.isTracking) return;
    
    const newState = serviceRef.current.redo();
    if (newState) {
      dispatch({ type: 'SET_CURRENT_STATE', payload: newState });
      updateStats();
      
      console.log('↷ PROVIDER: Redo performed');
    }
  }, [state.isTracking, updateStats]);
  
  // === SOLID: SRP - Add field change ===
  const addFieldChange = useCallback((
    fieldName: string,
    oldValue: any,
    newValue: any,
    fieldType: string = 'text'
  ) => {
    if (!state.isTracking) return;
    
    serviceRef.current.addFieldChange(
      fieldName,
      oldValue,
      newValue,
      state.currentState,
      fieldType
    );
    
    // Update current state
    const newState = {
      ...state.currentState,
      formValues: {
        ...state.currentState.formValues,
        [fieldName]: newValue
      },
      activeField: fieldName
    };
    
    dispatch({ type: 'SET_CURRENT_STATE', payload: newState });
    updateStats();
  }, [state.isTracking, state.currentState, updateStats]);
  
  // === SOLID: SRP - Add bulk change ===
  const addBulkChange = useCallback((
    changes: Record<string, { oldValue: any; newValue: any }>,
    description: string
  ) => {
    if (!state.isTracking) return;
    
    const beforeState = state.currentState;
    const newFormValues = { ...beforeState.formValues };
    
    Object.entries(changes).forEach(([field, { newValue }]) => {
      newFormValues[field] = newValue;
    });
    
    const afterState = {
      ...beforeState,
      formValues: newFormValues
    };
    
    serviceRef.current.addEntry(
      'bulk_change',
      beforeState,
      afterState,
      description,
      { changeCount: Object.keys(changes).length }
    );
    
    dispatch({ type: 'SET_CURRENT_STATE', payload: afterState });
    updateStats();
  }, [state.isTracking, state.currentState, updateStats]);
  
  // === SOLID: SRP - Add form load ===
  const addFormLoad = useCallback((formValues: FormValues, newAgeGroupId?: string) => {
    if (!state.isTracking) return;
    
    const beforeState = state.currentState;
    const afterState = {
      ...beforeState,
      formValues,
      ageGroupId: newAgeGroupId || beforeState.ageGroupId
    };
    
    serviceRef.current.addEntry(
      'form_load',
      beforeState,
      afterState,
      t('generation:history.formLoaded', 'Form loaded'),
      { fieldCount: Object.keys(formValues).length }
    );
    
    dispatch({ type: 'SET_CURRENT_STATE', payload: afterState });
    updateStats();
  }, [state.isTracking, state.currentState, updateStats, t]);
  
  // === SOLID: SRP - Add form reset ===
  const addFormReset = useCallback(() => {
    if (!state.isTracking) return;
    
    const beforeState = state.currentState;
    const afterState = {
      ...beforeState,
      formValues: {},
      errors: {},
      activeField: undefined
    };
    
    serviceRef.current.addEntry(
      'form_reset',
      beforeState,
      afterState,
      t('generation:history.formReset', 'Form reset')
    );
    
    dispatch({ type: 'SET_CURRENT_STATE', payload: afterState });
    updateStats();
  }, [state.isTracking, state.currentState, updateStats, t]);
  
  // === SOLID: SRP - Control functions ===
  const startTracking = useCallback(() => {
    dispatch({ type: 'START_TRACKING' });
    console.log('▶️ PROVIDER: History tracking started');
  }, []);
  
  const stopTracking = useCallback(() => {
    dispatch({ type: 'STOP_TRACKING' });
    console.log('⏸️ PROVIDER: History tracking stopped');
  }, []);
  
  const clearHistory = useCallback(() => {
    serviceRef.current.clear();
    dispatch({ type: 'CLEAR_HISTORY' });
    console.log('🗑️ PROVIDER: History cleared');
  }, []);
  
  // === SOLID: SRP - Information functions ===
  const getUndoDescription = useCallback(() => {
    return serviceRef.current.getUndoDescription();
  }, []);
  
  const getRedoDescription = useCallback(() => {
    return serviceRef.current.getRedoDescription();
  }, []);
  
  const getHistory = useCallback(() => {
    return serviceRef.current.getHistory();
  }, []);
  
  // === SOLID: SRP - Keyboard shortcuts ===
  const registerKeyboardShortcuts = useCallback(() => {
    if (keyboardHandlerRef.current) {
      document.removeEventListener('keydown', keyboardHandlerRef.current);
    }
    
    keyboardHandlerRef.current = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };
    
    document.addEventListener('keydown', keyboardHandlerRef.current);
    console.log('⌨️ PROVIDER: Keyboard shortcuts registered');
  }, [undo, redo]);
  
  const unregisterKeyboardShortcuts = useCallback(() => {
    if (keyboardHandlerRef.current) {
      document.removeEventListener('keydown', keyboardHandlerRef.current);
      keyboardHandlerRef.current = null;
      console.log('⌨️ PROVIDER: Keyboard shortcuts unregistered');
    }
  }, []);
  
  // === SOLID: SRP - Auto-register keyboard shortcuts ===
  useEffect(() => {
    registerKeyboardShortcuts();
    
    return () => {
      unregisterKeyboardShortcuts();
    };
  }, [registerKeyboardShortcuts, unregisterKeyboardShortcuts]);
  
  // === SOLID: SRP - Update stats on mount ===
  useEffect(() => {
    updateStats();
  }, [updateStats]);
  
  // === SOLID: SRP - Context value ===
  const contextValue: HistoryContextValue = {
    // State
    currentState: state.currentState,
    stats: state.stats,
    isTracking: state.isTracking,
    
    // Actions
    undo,
    redo,
    canUndo: state.stats.canUndo,
    canRedo: state.stats.canRedo,
    
    // History management
    addFieldChange,
    addBulkChange,
    addFormLoad,
    addFormReset,
    
    // Control
    startTracking,
    stopTracking,
    clearHistory,
    
    // Information
    getUndoDescription,
    getRedoDescription,
    getHistory,
    
    // Keyboard shortcuts
    registerKeyboardShortcuts,
    unregisterKeyboardShortcuts
  };
  
  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
};

// === SOLID: SRP - Custom hooks ===
export const useHistory = (): HistoryContextValue => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

// === SOLID: SRP - Hook for form integration ===
export const useFormHistory = () => {
  const history = useHistory();
  
  // === SOLID: SRP - Handle form field change ===
  const handleFieldChange = useCallback((
    fieldName: string,
    oldValue: any,
    newValue: any,
    fieldType?: string
  ) => {
    history.addFieldChange(fieldName, oldValue, newValue, fieldType);
  }, [history]);
  
  // === SOLID: SRP - Handle bulk form change ===
  const handleBulkChange = useCallback((
    changes: Record<string, { oldValue: any; newValue: any }>,
    description: string
  ) => {
    history.addBulkChange(changes, description);
  }, [history]);
  
  return {
    ...history,
    handleFieldChange,
    handleBulkChange
  };
};

// === SOLID: SRP - Hook for undo/redo controls ===
export const useUndoRedo = () => {
  const history = useHistory();
  
  return {
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undoDescription: history.getUndoDescription(),
    redoDescription: history.getRedoDescription(),
    stats: history.stats
  };
}; 