import { FormValues, AgeGroupId, FormState } from '@/types/generation';

// === SOLID: SRP - Persisted form data interface ===
export interface PersistedFormData {
  id: string;
  name: string;
  ageGroup: AgeGroupId;
  values: FormValues;
  timestamp: number;
  version: string;
  metadata?: {
    lastModified: number;
    saveCount: number;
    isAutoSave: boolean;
    description?: string;
  };
}

// === SOLID: SRP - Storage configuration ===
export interface StorageConfig {
  prefix: string;
  maxEntries: number;
  maxAge: number; // in milliseconds
  autoSaveInterval: number; // in milliseconds
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

// === SOLID: SRP - Storage result interface ===
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    size: number;
    compressed: boolean;
    encrypted: boolean;
  };
}

// === SOLID: SRP - Form persistence strategy interface ===
export interface FormPersistenceStrategy {
  save(id: string, data: PersistedFormData): Promise<StorageResult<boolean>>;
  load(id: string): Promise<StorageResult<PersistedFormData>>;
  remove(id: string): Promise<StorageResult<boolean>>;
  list(): Promise<StorageResult<PersistedFormData[]>>;
  clear(): Promise<StorageResult<boolean>>;
}

// === SOLID: SRP - LocalStorage implementation ===
export class LocalStorageFormPersistence implements FormPersistenceStrategy {
  private config: StorageConfig;
  
  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      prefix: 'hibody_form_',
      maxEntries: 50,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      autoSaveInterval: 30000, // 30 seconds
      compressionEnabled: true,
      encryptionEnabled: false,
      ...config
    };
  }
  
  // === SOLID: SRP - Save form data ===
  async save(id: string, data: PersistedFormData): Promise<StorageResult<boolean>> {
    try {
      const key = this.getStorageKey(id);
      let serializedData = JSON.stringify(data);
      
      // Compression
      if (this.config.compressionEnabled) {
        serializedData = this.compress(serializedData);
      }
      
      // Encryption
      if (this.config.encryptionEnabled) {
        serializedData = this.encrypt(serializedData);
      }
      
      // Check storage limits
      await this.enforceStorageLimits();
      
      localStorage.setItem(key, serializedData);
      
      return {
        success: true,
        data: true,
        metadata: {
          size: serializedData.length,
          compressed: this.config.compressionEnabled,
          encrypted: this.config.encryptionEnabled
        }
      };
    } catch (error) {
      console.error('Form save error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // === SOLID: SRP - Load form data ===
  async load(id: string): Promise<StorageResult<PersistedFormData>> {
    try {
      const key = this.getStorageKey(id);
      let serializedData = localStorage.getItem(key);
      
      if (!serializedData) {
        return {
          success: false,
          error: 'Form not found'
        };
      }
      
      // Decryption
      if (this.config.encryptionEnabled) {
        serializedData = this.decrypt(serializedData);
      }
      
      // Decompression
      if (this.config.compressionEnabled) {
        serializedData = this.decompress(serializedData);
      }
      
      const data: PersistedFormData = JSON.parse(serializedData);
      
      // Check if data is still valid (not expired)
      if (this.isExpired(data)) {
        await this.remove(id);
        return {
          success: false,
          error: 'Form data expired'
        };
      }
      
      return {
        success: true,
        data,
        metadata: {
          size: serializedData.length,
          compressed: this.config.compressionEnabled,
          encrypted: this.config.encryptionEnabled
        }
      };
    } catch (error) {
      console.error('Form load error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // === SOLID: SRP - Remove form data ===
  async remove(id: string): Promise<StorageResult<boolean>> {
    try {
      const key = this.getStorageKey(id);
      localStorage.removeItem(key);
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Form remove error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // === SOLID: SRP - List all forms ===
  async list(): Promise<StorageResult<PersistedFormData[]>> {
    try {
      const forms: PersistedFormData[] = [];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.config.prefix)) {
          const id = key.substring(this.config.prefix.length);
          const result = await this.load(id);
          if (result.success && result.data) {
            forms.push(result.data);
          }
        }
      }
      
      // Sort by timestamp (newest first)
      forms.sort((a, b) => b.timestamp - a.timestamp);
      
      return {
        success: true,
        data: forms
      };
    } catch (error) {
      console.error('Form list error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // === SOLID: SRP - Clear all forms ===
  async clear(): Promise<StorageResult<boolean>> {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.config.prefix)) {
          localStorage.removeItem(key);
        }
      }
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Form clear error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // === SOLID: SRP - Private helper methods ===
  private getStorageKey(id: string): string {
    return `${this.config.prefix}${id}`;
  }
  
  private isExpired(data: PersistedFormData): boolean {
    return Date.now() - data.timestamp > this.config.maxAge;
  }
  
  private async enforceStorageLimits(): Promise<void> {
    const result = await this.list();
    if (!result.success || !result.data) return;
    
    const forms = result.data;
    
    // Remove expired forms
    const expiredForms = forms.filter(form => this.isExpired(form));
    for (const form of expiredForms) {
      await this.remove(form.id);
    }
    
    // Remove oldest forms if we exceed max entries
    const validForms = forms.filter(form => !this.isExpired(form));
    if (validForms.length > this.config.maxEntries) {
      const formsToRemove = validForms.slice(this.config.maxEntries);
      for (const form of formsToRemove) {
        await this.remove(form.id);
      }
    }
  }
  
  private compress(data: string): string {
    // Simple compression simulation (in real app, use proper compression library)
    return data; // For now, return as-is
  }
  
  private decompress(data: string): string {
    // Simple decompression simulation
    return data; // For now, return as-is
  }
  
  private encrypt(data: string): string {
    // Simple encryption simulation (in real app, use proper encryption)
    return data; // For now, return as-is
  }
  
  private decrypt(data: string): string {
    // Simple decryption simulation
    return data; // For now, return as-is
  }
}

// === SOLID: SRP - Main form persistence service ===
export class FormPersistenceService {
  private storage: FormPersistenceStrategy;
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();
  private config: StorageConfig;
  
  constructor(
    storage: FormPersistenceStrategy = new LocalStorageFormPersistence(),
    config: Partial<StorageConfig> = {}
  ) {
    this.storage = storage;
    this.config = {
      prefix: 'hibody_form_',
      maxEntries: 50,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      autoSaveInterval: 30000,
      compressionEnabled: true,
      encryptionEnabled: false,
      ...config
    };
  }
  
  // === SOLID: SRP - Save form with metadata ===
  async saveForm(
    id: string,
    name: string,
    ageGroup: AgeGroupId,
    values: FormValues,
    isAutoSave: boolean = false,
    description?: string
  ): Promise<StorageResult<boolean>> {
    const existingForm = await this.loadForm(id);
    const saveCount = existingForm.success && existingForm.data 
      ? (existingForm.data.metadata?.saveCount || 0) + 1 
      : 1;
    
    const data: PersistedFormData = {
      id,
      name,
      ageGroup,
      values,
      timestamp: Date.now(),
      version: '1.0.0',
      metadata: {
        lastModified: Date.now(),
        saveCount,
        isAutoSave,
        description
      }
    };
    
    return await this.storage.save(id, data);
  }
  
  // === SOLID: SRP - Load form ===
  async loadForm(id: string): Promise<StorageResult<PersistedFormData>> {
    return await this.storage.load(id);
  }
  
  // === SOLID: SRP - Remove form ===
  async removeForm(id: string): Promise<StorageResult<boolean>> {
    this.stopAutoSave(id);
    return await this.storage.remove(id);
  }
  
  // === SOLID: SRP - List all forms ===
  async listForms(): Promise<StorageResult<PersistedFormData[]>> {
    return await this.storage.list();
  }
  
  // === SOLID: SRP - Clear all forms ===
  async clearForms(): Promise<StorageResult<boolean>> {
    // Stop all auto-save timers
    for (const [id] of this.autoSaveTimers) {
      this.stopAutoSave(id);
    }
    return await this.storage.clear();
  }
  
  // === SOLID: SRP - Auto-save functionality ===
  startAutoSave(
    id: string,
    name: string,
    ageGroup: AgeGroupId,
    getValues: () => FormValues
  ): void {
    this.stopAutoSave(id); // Clear existing timer
    
    const timer = setInterval(async () => {
      const values = getValues();
      if (Object.keys(values).length > 0) {
        await this.saveForm(id, name, ageGroup, values, true);
      }
    }, this.config.autoSaveInterval);
    
    this.autoSaveTimers.set(id, timer);
  }
  
  // === SOLID: SRP - Stop auto-save ===
  stopAutoSave(id: string): void {
    const timer = this.autoSaveTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(id);
    }
  }
  
  // === SOLID: SRP - Generate unique form ID ===
  generateFormId(): string {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // === SOLID: SRP - Get forms by age group ===
  async getFormsByAgeGroup(ageGroup: AgeGroupId): Promise<StorageResult<PersistedFormData[]>> {
    const result = await this.listForms();
    if (!result.success || !result.data) {
      return result;
    }
    
    const filteredForms = result.data.filter(form => form.ageGroup === ageGroup);
    return {
      success: true,
      data: filteredForms
    };
  }
  
  // === SOLID: SRP - Get recent forms ===
  async getRecentForms(limit: number = 10): Promise<StorageResult<PersistedFormData[]>> {
    const result = await this.listForms();
    if (!result.success || !result.data) {
      return result;
    }
    
    const recentForms = result.data.slice(0, limit);
    return {
      success: true,
      data: recentForms
    };
  }
  
  // === SOLID: SRP - Import/Export functionality ===
  async exportForm(id: string): Promise<StorageResult<string>> {
    const result = await this.loadForm(id);
    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'Form not found'
      };
    }
    
    try {
      const exportData = JSON.stringify(result.data, null, 2);
      return {
        success: true,
        data: exportData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }
  
  // === SOLID: SRP - Import form ===
  async importForm(data: string): Promise<StorageResult<string>> {
    try {
      const formData: PersistedFormData = JSON.parse(data);
      
      // Validate imported data
      if (!formData.id || !formData.name || !formData.ageGroup || !formData.values) {
        return {
          success: false,
          error: 'Invalid form data'
        };
      }
      
      // Generate new ID to avoid conflicts
      const newId = this.generateFormId();
      formData.id = newId;
      formData.timestamp = Date.now();
      
      const result = await this.storage.save(newId, formData);
      if (result.success) {
        return {
          success: true,
          data: newId
        };
      }
      
      return {
        success: false,
        error: 'Failed to import form'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed'
      };
    }
  }
  
  // === SOLID: SRP - Cleanup on destroy ===
  destroy(): void {
    for (const [id] of this.autoSaveTimers) {
      this.stopAutoSave(id);
    }
  }
}

// === SOLID: SRP - Export singleton instance ===
export const formPersistenceService = new FormPersistenceService(); 