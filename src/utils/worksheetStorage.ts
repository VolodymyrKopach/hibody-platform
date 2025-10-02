import { PageContent } from '@/types/canvas-element';

export interface SavedWorksheet {
  id: string;
  title: string;
  pages: Array<{
    id: string;
    pageNumber: number;
    title: string;
  }>;
  pageContents: Map<string, PageContent>;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'worksheets';
const CURRENT_WORKSHEET_KEY = 'current_worksheet';
const MAX_WORKSHEETS = 5; // Keep only last 5 worksheets
const MAX_STORAGE_PERCENTAGE = 80; // Warn at 80% usage

/**
 * Convert Map to plain object for JSON storage
 * Optionally strip base64 images to reduce size
 */
function mapToObject(
  map: Map<string, PageContent>, 
  stripImages = false
): Record<string, PageContent> {
  const obj: Record<string, PageContent> = {};
  map.forEach((value, key) => {
    if (stripImages) {
      // Strip base64 images from elements to reduce storage size
      const strippedValue = {
        ...value,
        elements: value.elements.map(el => {
          if (el.type === 'image' && el.src?.startsWith('data:image')) {
            return {
              ...el,
              src: '[IMAGE_STRIPPED]', // Placeholder
              originalSrc: el.src.substring(0, 50) + '...' // Keep preview
            };
          }
          return el;
        })
      };
      obj[key] = strippedValue;
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

/**
 * Convert plain object back to Map
 */
function objectToMap(obj: Record<string, PageContent>): Map<string, PageContent> {
  const map = new Map<string, PageContent>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
}

/**
 * Check if storage has enough space
 */
function checkStorageSpace(): { hasSpace: boolean; percentage: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || '';
    const used = new Blob([data]).size;
    const limit = 5 * 1024 * 1024; // 5MB typical limit
    const percentage = (used / limit) * 100;
    
    return {
      hasSpace: percentage < MAX_STORAGE_PERCENTAGE,
      percentage
    };
  } catch (error) {
    return { hasSpace: true, percentage: 0 };
  }
}

/**
 * Export storage space check for external use
 */
export function checkWorksheetStorage(): { hasSpace: boolean; percentage: number } {
  return checkStorageSpace();
}

/**
 * Cleanup old worksheets to free space
 */
function cleanupOldWorksheets(): void {
  try {
    const worksheets = getSavedWorksheets();
    
    if (worksheets.length <= MAX_WORKSHEETS) {
      return;
    }

    // Sort by updatedAt and keep only the most recent ones
    const sorted = worksheets.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    const toKeep = sorted.slice(0, MAX_WORKSHEETS);
    
    const storageData = toKeep.map(ws => ({
      ...ws,
      pageContents: mapToObject(ws.pageContents, true), // Strip images
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    
    console.log(`Cleaned up ${worksheets.length - MAX_WORKSHEETS} old worksheets`);
  } catch (error) {
    console.error('Failed to cleanup old worksheets:', error);
  }
}

/**
 * Get all saved worksheets
 */
export function getSavedWorksheets(): SavedWorksheet[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const worksheets = JSON.parse(data);
    
    // Convert pageContents back to Map
    return worksheets.map((ws: any) => ({
      ...ws,
      pageContents: objectToMap(ws.pageContents),
    }));
  } catch (error) {
    console.error('Failed to load worksheets:', error);
    return [];
  }
}

/**
 * Save worksheet to localStorage
 */
export function saveWorksheet(
  title: string,
  pages: Array<{ id: string; pageNumber: number; title: string }>,
  pageContents: Map<string, PageContent>,
  existingId?: string,
  options: { stripImages?: boolean; isAutoSave?: boolean } = {}
): SavedWorksheet {
  try {
    // Check storage space before saving
    const { hasSpace, percentage } = checkStorageSpace();
    
    if (!hasSpace) {
      console.warn(`Storage is ${percentage.toFixed(1)}% full. Cleaning up old worksheets...`);
      cleanupOldWorksheets();
    }

    const worksheets = getSavedWorksheets();
    const now = new Date().toISOString();

    const worksheet: SavedWorksheet = {
      id: existingId || `worksheet_${Date.now()}`,
      title,
      pages,
      pageContents,
      createdAt: existingId 
        ? worksheets.find(w => w.id === existingId)?.createdAt || now
        : now,
      updatedAt: now,
    };

    // Update or add worksheet
    const index = worksheets.findIndex(w => w.id === worksheet.id);
    if (index >= 0) {
      worksheets[index] = worksheet;
    } else {
      worksheets.push(worksheet);
    }

    // For auto-saves, strip images to save space
    const shouldStripImages = options.stripImages ?? options.isAutoSave ?? false;

    // Convert Maps to objects for JSON storage
    const storageData = worksheets.map(ws => ({
      ...ws,
      pageContents: mapToObject(ws.pageContents, shouldStripImages),
    }));

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (quotaError) {
      if (quotaError instanceof DOMException && quotaError.name === 'QuotaExceededError') {
        // Try aggressive cleanup
        console.warn('Storage quota exceeded. Attempting aggressive cleanup...');
        cleanupOldWorksheets();
        
        // Try again with images stripped
        const strippedData = worksheets.map(ws => ({
          ...ws,
          pageContents: mapToObject(ws.pageContents, true),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(strippedData));
        
        throw new Error('Storage quota exceeded. Images have been stripped to save space. Please download your worksheet to avoid data loss.');
      }
      throw quotaError;
    }

    return worksheet;
  } catch (error) {
    console.error('Failed to save worksheet:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save worksheet. Storage might be full.');
  }
}

/**
 * Delete worksheet
 */
export function deleteWorksheet(id: string): void {
  try {
    const worksheets = getSavedWorksheets();
    const filtered = worksheets.filter(w => w.id !== id);
    
    const storageData = filtered.map(ws => ({
      ...ws,
      pageContents: mapToObject(ws.pageContents),
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

    // Clear current worksheet if it was deleted
    const currentId = getCurrentWorksheetId();
    if (currentId === id) {
      clearCurrentWorksheet();
    }
  } catch (error) {
    console.error('Failed to delete worksheet:', error);
    throw new Error('Failed to delete worksheet.');
  }
}

/**
 * Get worksheet by ID
 */
export function getWorksheet(id: string): SavedWorksheet | null {
  const worksheets = getSavedWorksheets();
  return worksheets.find(w => w.id === id) || null;
}

/**
 * Save current worksheet ID
 */
export function setCurrentWorksheetId(id: string): void {
  try {
    localStorage.setItem(CURRENT_WORKSHEET_KEY, id);
  } catch (error) {
    console.error('Failed to set current worksheet:', error);
  }
}

/**
 * Get current worksheet ID
 */
export function getCurrentWorksheetId(): string | null {
  try {
    return localStorage.getItem(CURRENT_WORKSHEET_KEY);
  } catch (error) {
    console.error('Failed to get current worksheet:', error);
    return null;
  }
}

/**
 * Clear current worksheet
 */
export function clearCurrentWorksheet(): void {
  try {
    localStorage.removeItem(CURRENT_WORKSHEET_KEY);
  } catch (error) {
    console.error('Failed to clear current worksheet:', error);
  }
}

/**
 * Auto-save current worksheet
 * Images are stripped to save space
 */
export function autoSaveWorksheet(
  pages: Array<{ id: string; pageNumber: number; title: string }>,
  pageContents: Map<string, PageContent>
): SavedWorksheet | null {
  try {
    const currentId = getCurrentWorksheetId();
    
    // Generate title from first page or use default
    const title = pages[0]?.title || 'Untitled Worksheet';

    // Auto-save with images stripped to save space
    const worksheet = saveWorksheet(title, pages, pageContents, currentId, { 
      isAutoSave: true,
      stripImages: true 
    });
    
    // Set as current worksheet
    setCurrentWorksheetId(worksheet.id);

    return worksheet;
  } catch (error) {
    console.error('Auto-save failed:', error);
    return null;
  }
}

/**
 * Get storage info
 */
export function getStorageInfo(): {
  used: number;
  limit: number;
  percentage: number;
  worksheetCount: number;
} {
  try {
    const worksheets = getSavedWorksheets();
    const data = localStorage.getItem(STORAGE_KEY) || '';
    const used = new Blob([data]).size;
    const limit = 5 * 1024 * 1024; // 5MB typical limit
    
    return {
      used,
      limit,
      percentage: (used / limit) * 100,
      worksheetCount: worksheets.length,
    };
  } catch (error) {
    return {
      used: 0,
      limit: 5 * 1024 * 1024,
      percentage: 0,
      worksheetCount: 0,
    };
  }
}

/**
 * Clear all worksheet storage (emergency cleanup)
 */
export function clearAllWorksheets(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_WORKSHEET_KEY);
    console.log('All worksheets cleared from storage');
  } catch (error) {
    console.error('Failed to clear worksheets:', error);
  }
}

