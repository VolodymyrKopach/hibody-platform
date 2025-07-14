/**
 * === SOLID: SRP - History Components Index ===
 * 
 * This file exports all history-related components for easy importing.
 */

export { default as UndoRedoControls } from './UndoRedoControls';
export { default as HistoryTimeline } from './HistoryTimeline';

// Re-export types from history service
export type {
  HistoryEntry,
  HistoryState,
  HistoryStats,
  HistoryOperationType,
  HistoryOptions,
  IHistoryOperation
} from '@/services/history/HistoryService';

// Re-export history provider hooks
export {
  useHistory,
  useFormHistory,
  useUndoRedo,
  HistoryProvider
} from '@/providers/HistoryProvider';

// Re-export history service
export { HistoryService, historyService } from '@/services/history/HistoryService'; 