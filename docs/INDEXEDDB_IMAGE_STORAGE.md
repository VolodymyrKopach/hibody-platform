# IndexedDB Image Storage Implementation

## 🎯 Problem Solved

Previously, images were stored as Base64 strings in `localStorage`, which caused:
- ❌ **QuotaExceededError** - Base64 is ~33% larger than original
- ❌ **Performance issues** - Large strings slow down serialization
- ❌ **Storage limitations** - localStorage limited to ~5MB

## ✅ Solution: IndexedDB

### Why IndexedDB?

| Feature | localStorage | IndexedDB |
|---------|--------------|-----------|
| **Storage Limit** | ~5MB | 50% of disk space (GB) |
| **Data Types** | Strings only | Blob, File, Objects |
| **Performance** | Synchronous | Asynchronous |
| **Overhead** | Base64 (+33%) | Direct binary (0%) |
| **API** | Simple | More complex |

### Example Comparison

**Same 2MB image:**
- localStorage (Base64): ~2.7MB string
- IndexedDB (Blob): 2MB binary

**Storage capacity:**
- localStorage: ~1-2 images before quota
- IndexedDB: Hundreds of images

## 🏗️ Architecture

### 1. Image Storage Utility (`imageStorage.ts`)

```typescript
// Store image
const imageId = await storeImage(blob, 'photo.jpg');
// Returns: "img_1696243200000_abc123"

// Retrieve image
const blob = await getImage(imageId);

// Get Blob URL for <img>
const blobUrl = await getImageURL(imageId);
// Returns: "blob:http://localhost:3000/abc-123-def"

// Clear all images
await clearAllImages();
```

### 2. Updated LocalImageService

```typescript
// OLD: Base64 Data URL
{
  url: 'data:image/jpeg;base64,/9j/4AAQ...', // Huge string
  fileName: 'photo.jpg',
  size: 2700000 // Base64 size
}

// NEW: Blob URL + IndexedDB ID
{
  url: 'blob:http://localhost:3000/abc-123',  // Small reference
  imageId: 'img_1696243200000_abc123',        // IndexedDB ID
  fileName: 'photo.jpg',
  size: 2000000 // Original file size
}
```

### 3. Automatic Cleanup

Images are automatically deleted when leaving the canvas:

```typescript
// On component unmount
useEffect(() => {
  return () => {
    clearAllWorksheets();
    await clearAllImages(); // Clear IndexedDB
  };
}, []);

// On window close
window.addEventListener('beforeunload', () => {
  clearAllImages();
});

// On back button
const handleBackClick = async () => {
  clearAllWorksheets();
  await clearAllImages();
  router.push('/');
};
```

## 📊 Technical Details

### IndexedDB Schema

```
Database: worksheet_images
Version: 1

ObjectStore: images
  KeyPath: id
  Indexes:
    - createdAt (non-unique)

Record Structure:
{
  id: string,           // "img_1696243200000_abc123"
  blob: Blob,          // Binary image data
  filename: string,     // "photo.jpg"
  mimeType: string,     // "image/jpeg"
  size: number,         // 2000000
  createdAt: number     // 1696243200000
}
```

### Storage Flow

```
User uploads image
      ↓
Compress if > 500KB
      ↓
Store Blob in IndexedDB
      ↓
Get IndexedDB ID
      ↓
Create Blob URL
      ↓
Return URL + ID to component
      ↓
Component uses Blob URL in <img src={url} />
```

### Compression

Images larger than 500KB are compressed:

```typescript
if (file.size > 500 * 1024) {
  // Compress using canvas
  const compressedDataUrl = await compressImage(file, maxWidth);
  
  // Convert back to Blob
  const response = await fetch(compressedDataUrl);
  const blob = await response.blob();
  
  // Store compressed Blob
  await storeImage(blob, filename);
}
```

Quality settings:
- Files > 2MB: 70% quality
- Files < 2MB: 85% quality

## 🎨 Usage Examples

### Store Image from File Input

```typescript
import { localImageService } from '@/services/images/LocalImageService';

const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const result = await localImageService.uploadLocalImage(file, {
    compress: true,
    maxWidth: 1920
  });

  if (result.success) {
    // Use result.url in <img>
    setImageUrl(result.url);
    
    // Save result.imageId for reference
    setImageId(result.imageId);
  }
};
```

### Display Image

```typescript
// Blob URLs work the same as regular URLs
<img src={imageUrl} alt="Uploaded" />
```

### Get Storage Statistics

```typescript
import { getStorageStats } from '@/utils/imageStorage';

const stats = await getStorageStats();
console.log(`${stats.count} images using ${stats.formattedSize}`);
// Example: "5 images using 12.4MB"
```

### Clear All Images

```typescript
import { clearAllImages } from '@/utils/imageStorage';

await clearAllImages();
console.log('All images cleared from IndexedDB');
```

## 🔄 Migration from Base64

### Backward Compatibility

The service maintains backward compatibility:

```typescript
// Check if URL is Blob or Base64
if (localImageService.isBlobUrl(url)) {
  // Modern: Blob URL from IndexedDB
  console.log('Using IndexedDB storage');
} else if (localImageService.isBase64DataUrl(url)) {
  // Legacy: Base64 Data URL
  console.log('Using old Base64 format');
}
```

### Migration Path

1. **Old worksheets** with Base64 images will continue to work
2. **New uploads** automatically use IndexedDB
3. **No data loss** during transition

## 🚀 Benefits

### Performance

- ✅ **Faster uploads**: No Base64 encoding overhead
- ✅ **Faster retrieval**: Binary is faster than string parsing
- ✅ **Less memory**: Blob objects are more efficient

### Storage

- ✅ **10-100x more capacity**: GBs instead of MBs
- ✅ **No quota errors**: Much higher limits
- ✅ **Better compression**: Store compressed Blobs

### User Experience

- ✅ **Smoother editing**: No storage warnings
- ✅ **More images**: Upload dozens of images
- ✅ **Faster exports**: Direct Blob to PDF conversion

## 🔧 API Reference

### imageStorage.ts

```typescript
// Store image in IndexedDB
storeImage(blob: Blob, filename: string): Promise<string>

// Retrieve image from IndexedDB
getImage(id: string): Promise<Blob | null>

// Get Blob URL for display
getImageURL(id: string): Promise<string | null>

// Delete specific image
deleteImage(id: string): Promise<void>

// Get all stored images
getAllImages(): Promise<ImageRecord[]>

// Clear all images
clearAllImages(): Promise<void>

// Get storage statistics
getStorageStats(): Promise<{
  count: number;
  totalSize: number;
  formattedSize: string;
}>

// Delete entire database
deleteDatabase(): Promise<void>
```

### LocalImageService

```typescript
// Upload image (stores in IndexedDB)
uploadLocalImage(
  file: File,
  options?: {
    compress?: boolean;
    maxWidth?: number;
  }
): Promise<LocalImageUploadResult>

// Check URL types
isBlobUrl(url: string): boolean
isBase64DataUrl(url: string): boolean

// Get storage stats
estimateStorageUsage(): Promise<{
  imageCount: number;
  totalSize: number;
  formattedSize: string;
}>

// Clear storage
clearStorage(): Promise<void>
```

## 🧪 Testing

### Manual Test

1. Open Canvas Editor
2. Upload several large images (2-3MB each)
3. Check console: "✅ Image stored in IndexedDB"
4. Verify no QuotaExceededError
5. Close canvas - images should be cleared
6. Reopen - storage should be empty

### Storage Verification

```javascript
// In browser console
const stats = await getStorageStats();
console.log(stats);
// { count: 5, totalSize: 12400000, formattedSize: "12.4MB" }
```

### Clear Storage

```javascript
// In browser console
await clearAllImages();
console.log('Cleared!');
```

## 📝 Notes

### Browser Support

- ✅ Chrome, Edge, Firefox, Safari
- ✅ iOS Safari, Chrome Mobile
- ❌ IE11 (not supported anyway)

### Security

- IndexedDB is origin-specific (same as localStorage)
- Data is stored locally on user's device
- Cleared when user clears browser data
- Automatically cleared when leaving canvas

### Limitations

- Blob URLs need to be revoked to free memory
- IndexedDB is asynchronous (requires await)
- Can't be accessed across tabs easily

### Future Improvements

1. **Automatic Blob URL cleanup**: Track and revoke unused URLs
2. **Thumbnail generation**: Store small previews
3. **Background sync**: Sync to Supabase in background
4. **Quota monitoring**: Warn users before hitting limits
5. **Compression options**: Let users choose quality

---

**Status**: ✅ Implemented and tested  
**Date**: October 2, 2025  
**Version**: 1.0.0  
**Breaking Changes**: None (backward compatible)

