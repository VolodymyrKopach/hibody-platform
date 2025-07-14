/**
 * === SOLID: SRP - History Service ===
 * 
 * This service manages the history of changes for undo/redo functionality.
 * It follows the Command pattern and supports different types of operations.
 */

import { FormValues, ValidationErrors } from '@/types/generation';

// === SOLID: ISP - Specific interfaces for different history operations ===
export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: HistoryOperationType;
  description: string;
  before: HistoryState;
  after: HistoryState;
  metadata?: Record<string, any>;
}

export interface HistoryState {
  formValues: FormValues;
  errors?: ValidationErrors;
  activeField?: string;
  ageGroupId?: string;
}

export type HistoryOperationType = 
  | 'field_change'
  | 'bulk_change'
  | 'form_load'
  | 'form_reset'
  | 'validation_fix'
  | 'template_apply';

export interface HistoryOptions {
  maxHistorySize?: number;
  debounceMs?: number;
  excludeFields?: string[];
  groupRelatedChanges?: boolean;
}

export interface HistoryStats {
  totalEntries: number;
  currentPosition: number;
  canUndo: boolean;
  canRedo: boolean;
  memoryUsage: number;
}

// === SOLID: SRP - History operation interface ===
export interface IHistoryOperation {
  execute(state: HistoryState): HistoryState;
  undo(state: HistoryState): HistoryState;
  canMerge(other: IHistoryOperation): boolean;
  merge(other: IHistoryOperation): IHistoryOperation;
  getDescription(): string;
}

// === SOLID: SRP - Field change operation ===
export class FieldChangeOperation implements IHistoryOperation {
  constructor(
    private fieldName: string,
    private oldValue: any,
    private newValue: any,
    private fieldType: string
  ) {}

  execute(state: HistoryState): HistoryState {
    return {
      ...state,
      formValues: {
        ...state.formValues,
        [this.fieldName]: this.newValue
      },
      activeField: this.fieldName
    };
  }

  undo(state: HistoryState): HistoryState {
    return {
      ...state,
      formValues: {
        ...state.formValues,
        [this.fieldName]: this.oldValue
      },
      activeField: this.fieldName
    };
  }

  canMerge(other: IHistoryOperation): boolean {
    return (
      other instanceof FieldChangeOperation &&
      other.fieldName === this.fieldName &&
      other.fieldType === this.fieldType
    );
  }

  merge(other: IHistoryOperation): IHistoryOperation {
    if (other instanceof FieldChangeOperation && this.canMerge(other)) {
      return new FieldChangeOperation(
        this.fieldName,
        this.oldValue,
        other.newValue,
        this.fieldType
      );
    }
    return this;
  }

  getDescription(): string {
    return `Changed ${this.fieldName} from "${this.oldValue}" to "${this.newValue}"`;
  }
}

// === SOLID: SRP - Bulk change operation ===
export class BulkChangeOperation implements IHistoryOperation {
  constructor(
    private changes: Record<string, { oldValue: any; newValue: any }>,
    private description: string
  ) {}

  execute(state: HistoryState): HistoryState {
    const newValues = { ...state.formValues };
    Object.entries(this.changes).forEach(([field, { newValue }]) => {
      newValues[field] = newValue;
    });
    
    return {
      ...state,
      formValues: newValues
    };
  }

  undo(state: HistoryState): HistoryState {
    const newValues = { ...state.formValues };
    Object.entries(this.changes).forEach(([field, { oldValue }]) => {
      newValues[field] = oldValue;
    });
    
    return {
      ...state,
      formValues: newValues
    };
  }

  canMerge(other: IHistoryOperation): boolean {
    return false; // Bulk operations are not merged
  }

  merge(other: IHistoryOperation): IHistoryOperation {
    return this;
  }

  getDescription(): string {
    return this.description;
  }
}

// === SOLID: SRP - History Service Implementation ===
export class HistoryService {
  private history: HistoryEntry[] = [];
  private currentPosition = -1;
  private options: Required<HistoryOptions>;
  private debounceTimer?: NodeJS.Timeout;

  constructor(options: HistoryOptions = {}) {
    this.options = {
      maxHistorySize: options.maxHistorySize || 100,
      debounceMs: options.debounceMs || 500,
      excludeFields: options.excludeFields || [],
      groupRelatedChanges: options.groupRelatedChanges !== false
    };
  }

  // === SOLID: SRP - Add history entry ===
  addEntry(
    type: HistoryOperationType,
    before: HistoryState,
    after: HistoryState,
    description?: string,
    metadata?: Record<string, any>
  ): void {
    // Clear debounce timer if exists
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Skip if no actual changes
    if (this.isStateEqual(before, after)) {
      return;
    }

    // Create new entry
    const entry: HistoryEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      type,
      description: description || this.generateDescription(type, before, after),
      before,
      after,
      metadata
    };

    // Try to merge with last entry if grouping is enabled
    if (this.options.groupRelatedChanges && this.canMergeWithLast(entry)) {
      this.mergeWithLast(entry);
      return;
    }

    // Remove any entries after current position (for redo)
    this.history = this.history.slice(0, this.currentPosition + 1);

    // Add new entry
    this.history.push(entry);
    this.currentPosition++;

    // Enforce max history size
    if (this.history.length > this.options.maxHistorySize) {
      this.history.shift();
      this.currentPosition--;
    }

    console.log('📝 HISTORY: Added entry', { type, description: entry.description });
  }

  // === SOLID: SRP - Add field change with debouncing ===
  addFieldChange(
    fieldName: string,
    oldValue: any,
    newValue: any,
    currentState: HistoryState,
    fieldType: string = 'text'
  ): void {
    // Skip excluded fields
    if (this.options.excludeFields.includes(fieldName)) {
      return;
    }

    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer
    this.debounceTimer = setTimeout(() => {
      const beforeState = {
        ...currentState,
        formValues: {
          ...currentState.formValues,
          [fieldName]: oldValue
        }
      };

      const afterState = {
        ...currentState,
        formValues: {
          ...currentState.formValues,
          [fieldName]: newValue
        }
      };

      this.addEntry(
        'field_change',
        beforeState,
        afterState,
        `Changed ${fieldName}`,
        { fieldName, fieldType }
      );
    }, this.options.debounceMs);
  }

  // === SOLID: SRP - Undo operation ===
  undo(): HistoryState | null {
    if (!this.canUndo()) {
      return null;
    }

    const entry = this.history[this.currentPosition];
    this.currentPosition--;

    console.log('↶ HISTORY: Undo', { description: entry.description });
    return entry.before;
  }

  // === SOLID: SRP - Redo operation ===
  redo(): HistoryState | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentPosition++;
    const entry = this.history[this.currentPosition];

    console.log('↷ HISTORY: Redo', { description: entry.description });
    return entry.after;
  }

  // === SOLID: SRP - Check if undo is possible ===
  canUndo(): boolean {
    return this.currentPosition >= 0;
  }

  // === SOLID: SRP - Check if redo is possible ===
  canRedo(): boolean {
    return this.currentPosition < this.history.length - 1;
  }

  // === SOLID: SRP - Get current history stats ===
  getStats(): HistoryStats {
    return {
      totalEntries: this.history.length,
      currentPosition: this.currentPosition,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      memoryUsage: this.calculateMemoryUsage()
    };
  }

  // === SOLID: SRP - Get history entries for UI ===
  getHistory(): HistoryEntry[] {
    return [...this.history];
  }

  // === SOLID: SRP - Clear history ===
  clear(): void {
    this.history = [];
    this.currentPosition = -1;
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    console.log('🗑️ HISTORY: Cleared');
  }

  // === SOLID: SRP - Get undo/redo descriptions ===
  getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    return this.history[this.currentPosition].description;
  }

  getRedoDescription(): string | null {
    if (!this.canRedo()) return null;
    return this.history[this.currentPosition + 1].description;
  }

  // === SOLID: SRP - Private helper methods ===
  private isStateEqual(state1: HistoryState, state2: HistoryState): boolean {
    return JSON.stringify(state1.formValues) === JSON.stringify(state2.formValues);
  }

  private canMergeWithLast(entry: HistoryEntry): boolean {
    if (this.history.length === 0) return false;
    
    const lastEntry = this.history[this.history.length - 1];
    
    // Only merge field changes of the same field within time window
    return (
      entry.type === 'field_change' &&
      lastEntry.type === 'field_change' &&
      entry.metadata?.fieldName === lastEntry.metadata?.fieldName &&
      entry.timestamp - lastEntry.timestamp < this.options.debounceMs * 2
    );
  }

  private mergeWithLast(entry: HistoryEntry): void {
    if (this.history.length === 0) return;
    
    const lastEntry = this.history[this.history.length - 1];
    
    // Update the last entry's after state and timestamp
    lastEntry.after = entry.after;
    lastEntry.timestamp = entry.timestamp;
    lastEntry.description = entry.description;
    
    console.log('🔄 HISTORY: Merged with last entry');
  }

  private generateDescription(
    type: HistoryOperationType,
    before: HistoryState,
    after: HistoryState
  ): string {
    switch (type) {
      case 'field_change':
        return 'Field changed';
      case 'bulk_change':
        return 'Multiple fields changed';
      case 'form_load':
        return 'Form loaded';
      case 'form_reset':
        return 'Form reset';
      case 'validation_fix':
        return 'Validation errors fixed';
      case 'template_apply':
        return 'Template applied';
      default:
        return 'Unknown operation';
    }
  }

  private generateId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateMemoryUsage(): number {
    // Rough estimate of memory usage in bytes
    return JSON.stringify(this.history).length * 2;
  }
}

// === SOLID: SRP - Default history service instance ===
export const historyService = new HistoryService(); 