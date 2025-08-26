# Simplified Preview Handling

## Changes Made

### Problem
- Thumbnails were not displaying in the save dialog, only fallback placeholders were shown
- Complex logic was trying to generate previews on-the-fly from LocalThumbnailStorage
- Different instances of LocalThumbnailStorage were being used

### Solution
Simplified the approach to use only existing previews from slides:

### 1. Removed Subject Field
- Completely removed the subject field from `SimplifiedSaveLessonDialog`
- Updated API call to use default `'General Education'` subject
- Removed subject mapping logic and UI components

### 2. Fixed Preview Collection
**Problem:** Slides in SlideStore don't have `previewUrl`/`thumbnailUrl` fields, but previews exist in LocalThumbnailStorage.

**Solution:**
```typescript
// Get all previews from LocalThumbnailStorage first
const allPreviews = thumbnailStorage.getAll();

slides.forEach(slide => {
  // Check LocalThumbnailStorage first (where previews are actually stored)
  if (allPreviews[slide.id]) {
    slidePreviews[slide.id] = allPreviews[slide.id];
  } 
  // Fallback to slide properties if available
  else if (slide.previewUrl) {
    slidePreviews[slide.id] = slide.previewUrl;
  } else if (slide.thumbnailUrl) {
    slidePreviews[slide.id] = slide.thumbnailUrl;
  }
});
```

### 3. Restored LocalThumbnailStorage Access
- **Re-added** `LocalThumbnailStorage` import and usage in Step3
- Uses the same global instance as `TemplateAPIAdapter`
- Accesses cached previews via `thumbnailStorage.getAll()`

### 4. Fixed Value Mapping
- Added mapping functions for age groups to match MUI select options
- Fixed MUI warnings about out-of-range values
- Mapped template values like `"2-3"` to select values like `"3-5 years"`

## Key Benefits

1. **Simplicity**: No complex preview generation or storage management
2. **Reliability**: Uses only existing, proven preview data
3. **Performance**: No on-the-fly generation delays
4. **Maintainability**: Much less code to maintain
5. **No MUI Warnings**: Proper value mapping for select components

## Current Flow

1. **Slide Generation**: TemplateAPIAdapter generates slides with previews
2. **Data Collection**: `prepareLessonSaveData` collects existing `previewUrl`/`thumbnailUrl` from slides
3. **Dialog Display**: `SimplifiedSaveLessonDialog` receives all data and displays previews
4. **Preview Selection**: User can select from available previews
5. **Save**: Dialog handles API call with selected data

## Files Modified

- `src/components/templates/steps/Step3SlideGeneration.tsx`
  - Simplified `prepareLessonSaveData`
  - Removed LocalThumbnailStorage dependency
  - Added simple logging

- `src/components/dialogs/SimplifiedSaveLessonDialog.tsx`
  - Removed subject field completely
  - Added age group value mapping
  - Simplified auto-fill logic
  - Fixed MUI select warnings

## Expected Behavior

- Previews should display if slides have `previewUrl` or `thumbnailUrl`
- If no previews available, PreviewSelector will generate fallback previews
- No complex generation or storage management
- Clean, simple data flow from Step3 → Dialog → API
