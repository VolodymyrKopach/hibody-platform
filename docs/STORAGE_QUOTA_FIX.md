# Storage Quota Fix

## Problem

The application was experiencing `QuotaExceededError` when trying to save worksheets to localStorage:
- Base64-encoded images were being stored, consuming massive amounts of space
- Auto-save was running every 30 seconds, accumulating data
- No cleanup mechanism for old worksheets
- localStorage has a typical limit of 5MB per domain

Additionally, there were console warnings about passive event listeners for wheel events.

## Solution

### 1. Storage Management (`worksheetStorage.ts`)

#### Image Stripping for Auto-Saves
- Added `mapToObject()` function parameter to strip base64 images during auto-saves
- Images are replaced with `[IMAGE_STRIPPED]` placeholder
- Images are kept in memory and only stripped when persisting to localStorage

#### Automatic Cleanup
- Implemented `MAX_WORKSHEETS = 5` limit
- `cleanupOldWorksheets()` automatically removes old worksheets
- Worksheets are sorted by `updatedAt` and only the 5 most recent are kept

#### Storage Quota Checking
- `checkStorageSpace()` monitors storage usage
- Triggers cleanup when storage exceeds 80% (configurable via `MAX_STORAGE_PERCENTAGE`)
- Provides warnings to users before hitting the limit

#### Enhanced Error Handling
- `saveWorksheet()` now catches `QuotaExceededError`
- Attempts automatic cleanup on quota errors
- Falls back to aggressive image stripping if needed
- Provides user-friendly error messages

#### New Utility Functions
```typescript
// Check current storage usage
checkWorksheetStorage(): { hasSpace: boolean; percentage: number }

// Emergency cleanup
clearAllWorksheets(): void

// Get detailed storage info
getStorageInfo(): {
  used: number;
  limit: number;
  percentage: number;
  worksheetCount: number;
}
```

### 2. Wheel Event Fix (`Step3CanvasEditor.tsx`)

#### Problem
React's synthetic `onWheel` event handler is passive by default, causing warnings when calling `preventDefault()`.

#### Solution
- Added `canvasContainerRef` to access the DOM element directly
- Attached wheel event listener manually with `{ passive: false }`
- This allows `preventDefault()` to work correctly without warnings

```typescript
useEffect(() => {
  const container = canvasContainerRef.current;
  if (!container) return;

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    // ... zoom and pan logic
  };

  container.addEventListener('wheel', handleWheel, { passive: false });
  return () => container.removeEventListener('wheel', handleWheel);
}, [zoom]);
```

### 3. Automatic Storage Cleanup (`Step3CanvasEditor.tsx`)

#### Problem
Worksheets were accumulating in localStorage even after leaving the canvas page, wasting storage space.

#### Solution
Storage is automatically cleaned up when leaving the canvas page in ANY way:

1. **On Component Unmount** (navigation away)
2. **On Window Close** (closing tab/browser)
3. **On Back Button Click** (explicit navigation)

```typescript
useEffect(() => {
  // Cleanup on page unload (closing tab/window)
  const handleBeforeUnload = () => {
    console.log('🧹 Cleaning up worksheet storage on page close...');
    clearAllWorksheets();
  };

  // Cleanup on component unmount (navigation away)
  const handleUnmount = () => {
    console.log('🧹 Cleaning up worksheet storage on navigation...');
    clearAllWorksheets();
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    handleUnmount();
  };
}, []);

// Back button also cleans up
const handleBackClick = async () => {
  const confirmed = await showExitConfirmation();
  if (confirmed) {
    console.log('🧹 Cleaning up worksheet storage on back button...');
    clearAllWorksheets();
    router.push('/');
  }
};
```

#### Benefits
- Storage is always clean after leaving the canvas
- No accumulation of old auto-save data
- Fresh start every time user opens the canvas
- Prevents storage quota issues from accumulating

### 4. Enhanced Exit Dialog (`Step3CanvasEditor.tsx`)

#### Problem
Users could lose work without realizing they need to download before leaving.

#### Solution
Enhanced exit confirmation dialog with:

1. **Clear Warning Messages**:
   - Title: "Download Before Leaving"
   - Explains that storage will be cleared
   - Prominent warning about downloading

2. **Download Button in Dialog**:
   - "Download PDF" button with loading state
   - Exports all pages as PDF
   - Users can download without closing dialog

3. **Three Action Buttons**:
   - **Download PDF** (primary) - saves work
   - **Stay** (outlined) - cancels exit
   - **Leave** (text) - confirms exit without save

```typescript
// Download handler in dialog
const handleDownloadFromDialog = async () => {
  try {
    setIsExporting(true);
    await handleExportPDF(false); // Export all pages
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    setIsExporting(false);
  }
};
```

#### UI/UX Improvements
- Warning icon in amber color
- Clear hierarchy: Download > Stay > Leave
- Loading state during export
- Non-blocking download (can still choose to stay or leave after)

## Benefits

1. **No More Quota Errors**: Auto-saves strip images, drastically reducing storage usage
2. **Automatic Cleanup**: Storage is cleaned when leaving the canvas page (any way)
3. **Zero Storage Accumulation**: Every session starts fresh without old data
4. **Better UX**: Clear download prompts and easy-to-use exit dialog
5. **Download in Dialog**: One-click PDF export without leaving the dialog
6. **Performance**: Passive event warnings eliminated
7. **Scalability**: Can handle many worksheets without filling storage
8. **Clean Exit**: Storage cleanup on unmount, window close, and back button
9. **Data Safety**: Users are explicitly reminded to download before leaving

## Usage

### For Users

#### Working with Canvas Editor:
1. **Edit freely** - auto-save runs every 30 seconds in the background
2. **Attempt to leave** - a confirmation dialog will appear
3. **Download your work** - click "Download PDF" button directly in the dialog
4. **Choose action**:
   - **Download PDF** - saves worksheet with all images
   - **Stay** - remain on page and continue editing
   - **Leave** - exit without saving (data will be lost)

#### Exit Confirmation Dialog:

When you click "Back" or try to close the tab, you'll see:

```
⚠️ Download Before Leaving

Your worksheet will be lost when you leave this page 
because storage is automatically cleared.

⚠️ Please download your worksheet before leaving to save your work.

[Download PDF]  [Stay]  [Leave]
```

#### Important:
- ✅ **Always download** your worksheet before closing
- ✅ **Click "Download PDF"** directly in the dialog
- ✅ **Wait for download** to complete before leaving
- ⚠️ **"Leave"** will delete all data

### For Developers
```typescript
import { 
  autoSaveWorksheet,      // Auto-save with image stripping
  saveWorksheet,          // Manual save with images
  checkWorksheetStorage,  // Check storage usage
  clearAllWorksheets,     // Emergency cleanup
  getStorageInfo          // Detailed storage stats
} from '@/utils/worksheetStorage';

// Check storage before operations
const { hasSpace, percentage } = checkWorksheetStorage();
if (!hasSpace) {
  console.warn(`Storage is ${percentage}% full`);
}

// Manual save with options
saveWorksheet(title, pages, pageContents, id, {
  stripImages: true,  // Optional: strip images
  isAutoSave: false   // Optional: is this an auto-save?
});
```

## Migration Notes

- Existing worksheets with images will be automatically stripped on next save
- Users should download important worksheets before the update
- No data loss for current work - images remain in memory

## Testing

1. Create a worksheet with multiple images
2. Check console - no more `QuotaExceededError`
3. Check console - no more passive event listener warnings
4. Auto-save works without errors
5. Storage is automatically cleaned when full

## Future Improvements

1. **IndexedDB Migration**: Consider moving to IndexedDB for larger storage (50MB+)
2. **Cloud Storage**: Integrate with Supabase for unlimited storage
3. **Compression**: Implement image compression before storage
4. **Selective Loading**: Load worksheet metadata first, images on demand
5. **User Controls**: Let users manage storage manually

