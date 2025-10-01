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

/**
 * Convert Map to plain object for JSON storage
 */
function mapToObject(map: Map<string, PageContent>): Record<string, PageContent> {
  const obj: Record<string, PageContent> = {};
  map.forEach((value, key) => {
    obj[key] = value;
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
  existingId?: string
): SavedWorksheet {
  try {
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

    // Convert Maps to objects for JSON storage
    const storageData = worksheets.map(ws => ({
      ...ws,
      pageContents: mapToObject(ws.pageContents),
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

    return worksheet;
  } catch (error) {
    console.error('Failed to save worksheet:', error);
    throw new Error('Failed to save worksheet. Storage might be full.');
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
 */
export function autoSaveWorksheet(
  pages: Array<{ id: string; pageNumber: number; title: string }>,
  pageContents: Map<string, PageContent>
): SavedWorksheet | null {
  try {
    const currentId = getCurrentWorksheetId();
    
    // Generate title from first page or use default
    const title = pages[0]?.title || 'Untitled Worksheet';

    const worksheet = saveWorksheet(title, pages, pageContents, currentId);
    
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

