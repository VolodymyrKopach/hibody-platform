# Preview System Implementation

## Overview

The preview system has been successfully implemented for lesson slides with HTML-to-canvas conversion, allowing users to generate thumbnails and save them for display in the materials page.

## Features Implemented

### 1. HTML to Canvas Preview Generation
- **File**: `src/utils/slidePreview.ts`
- **Main Functions**:
  - `generateSlidePreview()` - Converts HTML to canvas using html2canvas
  - `generateSlidePreviewAlt()` - Alternative method using html-to-image
  - `generateSlideThumbnail()` - Creates smaller thumbnails from full previews
  - `generateLessonPreviews()` - Batch processes multiple slides
  - `generateFallbackPreview()` - Creates fallback when generation fails
  - `savePreviewAsFile()` - Saves preview to public directory via API

### 2. Preview Selector Component
- **File**: `src/components/PreviewSelector.tsx`
- **Features**:
  - Large main preview display at top
  - Grid of thumbnail selectors below
  - Loading states and error handling
  - Slide type icons and numbering
  - Selection indicators and hover effects
  - Responsive CSS Grid layout

### 3. Enhanced Save Dialog
- **File**: `src/app/chat/page.tsx`
- **Updates**:
  - Extended `SaveLessonDialogData` interface with `selectedPreviewId` and `previewUrl`
  - Added `handlePreviewSelect()` function for preview selection
  - Integrated `PreviewSelector` component into dialog
  - Changed dialog size from "sm" to "md" to accommodate previews

### 4. API Endpoint for Preview Storage
- **File**: `src/app/api/images/preview/route.ts`
- **Features**:
  - POST method saves base64 image data as PNG files
  - Creates organized directory structure: `/public/images/lessons/{lessonId}/previews/`
  - Returns public URLs for saved images
  - Includes GET method for future preview retrieval

### 5. Enhanced Save Functionality
- **Updates in** `saveSelectedSlides()` **function**:
  - Generates unique lesson ID before saving
  - Saves preview as file via API if base64 data provided
  - Uses saved file URL as lesson thumbnail
  - Handles errors gracefully with fallbacks

### 6. Material Cards with Thumbnails
- **File**: `src/app/materials/page.tsx`
- **Features**:
  - Displays preview thumbnails at top of each lesson card
  - 120px height thumbnail section with cover fit
  - Fallback placeholder with BookOpen icon if image fails to load
  - Status overlay on thumbnail
  - Error handling for missing images

## Data Flow

1. **Creating Lesson**:
   - User selects multiple slides in chat interface
   - Clicks "Save Selected Slides" button
   - Save dialog opens with lesson metadata fields

2. **Preview Generation**:
   - `PreviewSelector` component automatically generates previews for all selected slides
   - Uses `generateSlideThumbnail()` to convert HTML to canvas
   - Displays large preview and thumbnail grid
   - User can select which slide to use as lesson thumbnail

3. **Saving Process**:
   - User fills out lesson details and selects preview
   - Clicks "Save Lesson" button
   - Preview is saved as PNG file via `/api/images/preview` endpoint
   - Lesson is saved to localStorage with thumbnail URL
   - Success message is displayed

4. **Materials Display**:
   - Materials page loads lessons from localStorage
   - Each lesson card displays the saved thumbnail
   - Thumbnails are loaded from the public directory URLs

## Technical Implementation Details

### HTML to Canvas Conversion
- Uses `html2canvas` library for primary conversion
- Implements iframe-based rendering to isolate slide content
- Fallback to `html-to-image` library if needed
- Optimizes HTML by removing interactive elements for static preview

### Storage Strategy
- Preview images saved to `/public/images/lessons/{lessonId}/previews/`
- Organized by lesson ID for easy management
- PNG format with configurable quality settings
- Base64 to binary conversion via API endpoint

### Error Handling
- Fallback preview generation when HTML conversion fails
- Graceful degradation to placeholder images
- Error states in UI components
- Console logging for debugging

### Performance Considerations
- Thumbnail generation with configurable max dimensions (300x200 default)
- Quality settings to balance file size and visual quality
- Async processing to avoid blocking UI
- Cleanup of temporary DOM elements

## File Structure

```
src/
├── utils/
│   └── slidePreview.ts          # Core preview generation utilities
├── components/
│   └── PreviewSelector.tsx      # Preview selection UI component
├── app/
│   ├── chat/
│   │   └── page.tsx            # Enhanced save dialog
│   ├── materials/
│   │   └── page.tsx            # Updated material cards with thumbnails
│   └── api/
│       └── images/
│           └── preview/
│               └── route.ts     # Preview storage API endpoint
└── types/
    └── lesson.ts               # Updated interfaces with thumbnail support
```

## Usage

### For Developers
1. Import preview utilities: `import { generateSlideThumbnail } from '@/utils/slidePreview'`
2. Use PreviewSelector component in any form that needs slide preview selection
3. Call preview generation functions with HTML content and options

### For Users
1. Create lesson slides in chat interface
2. Select multiple slides for saving
3. Open save dialog and choose preview thumbnail
4. Fill out lesson metadata and save
5. View lessons with thumbnails in materials page

## Configuration Options

### Preview Generation Options
```typescript
interface SlidePreviewOptions {
  width?: number;         // Default: 1024
  height?: number;        // Default: 768
  quality?: number;       // Default: 0.8
  scale?: number;         // Default: 1
  background?: string;    // Default: '#ffffff'
}

interface ThumbnailOptions extends SlidePreviewOptions {
  maxWidth?: number;      // Default: 300
  maxHeight?: number;     // Default: 200
}
```

## Future Enhancements

1. **Preview Caching**: Cache generated previews to avoid regeneration
2. **Batch Operations**: Generate previews for multiple lessons simultaneously
3. **Advanced Thumbnails**: Support for custom thumbnail crops and styles
4. **Preview Templates**: Predefined preview styles and layouts
5. **Image Optimization**: WebP support and responsive images
6. **Preview Analytics**: Track which previews are most effective

## Dependencies

- `html2canvas`: Primary HTML to canvas conversion
- `html-to-image`: Alternative conversion method
- `@mui/material`: UI components for preview selector
- `lucide-react`: Icons for preview interface

## Testing

The system has been tested with:
- ✅ HTML slide content conversion to canvas
- ✅ Thumbnail generation and selection
- ✅ API endpoint for preview storage
- ✅ Material cards displaying thumbnails
- ✅ Error handling and fallbacks
- ✅ Build process compilation

## Status: ✅ COMPLETE

The preview system is fully implemented and functional. Users can now:
- Generate previews from HTML slide content
- Select which slide to use as lesson thumbnail
- Save lessons with preview thumbnails
- View lesson cards with preview images in materials page 