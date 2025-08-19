# Standardized Storage Structure

This document describes the unified storage structure implemented for both thumbnails and slide images in the hibody-platform.

## 📁 **Folder Structure**

All lesson-related assets are now organized under a consistent hierarchy:

```
lesson-assets/                          # Supabase Storage Bucket
└── lessons/                           # Root folder for all lessons
    └── {lessonId}/                    # Individual lesson folder
        ├── thumbnails/                # Lesson thumbnails (previews)
        │   └── {slideId}_{timestamp}.webp
        └── images/                    # Slide content images
            └── slide-{n}-{timestamp}.webp
```

## 🔄 **Migration from Previous Structure**

### **Before (Inconsistent)**
```
lesson-assets/
├── lesson-thumbnails/                 # API Route thumbnails
│   └── {lessonId}/
│       └── {slideId}-{type}-{timestamp}.webp
├── lessons/                          # LocalThumbnailService
│   └── {lessonId}/
│       └── thumbnails/
│           └── {slideId}_{timestamp}.png
└── temp-images/                      # Temporary images
    └── temp/{userId}/{sessionId}/
        └── img_{index}_{timestamp}.webp
```

### **After (Standardized)**
```
lesson-assets/
└── lessons/                          # ✅ Unified structure
    └── {lessonId}/
        ├── thumbnails/               # ✅ All thumbnails here
        │   └── {slideId}_{timestamp}.webp
        └── images/                   # ✅ All slide images here
            └── slide-{n}-{timestamp}.webp
```

## 🛠️ **Implementation Details**

### **Thumbnails**
- **Location:** `lessons/{lessonId}/thumbnails/`
- **Format:** WebP (optimized for web)
- **Naming:** `{slideId}_{timestamp}.webp`
- **Used by:**
  - `/api/images/preview` route
  - `LocalThumbnailService`
  - Lesson preview cards

### **Slide Images**
- **Location:** `lessons/{lessonId}/images/`
- **Format:** WebP (optimized for web)
- **Naming:** `slide-{n}-{timestamp}.webp`
- **Used by:**
  - `TemporaryImageService` (after migration)
  - Slide content rendering
  - Image generation system

## 🔐 **Security & Permissions**

### **RLS Policies**
The existing Row Level Security policies support the new structure:

```sql
-- Supports both old and new structures for backward compatibility
CREATE POLICY "Users can upload lesson assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-assets' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    (storage.foldername(name))[1] = 'lesson-thumbnails' OR  -- Legacy support
    (storage.foldername(name))[1] = 'lessons'               -- ✅ New structure
  )
);
```

### **Access Control**
- ✅ Users can upload to their own lessons
- ✅ Public read access for published lessons
- ✅ Authenticated users can manage their content
- ✅ Temporary images are user-scoped

## 📊 **Benefits**

### **1. Consistency**
- Single folder structure for all lesson assets
- Predictable file organization
- Easier maintenance and debugging

### **2. Performance**
- WebP format for better compression (30-50% smaller files)
- Organized folder structure for faster listing
- Reduced storage costs

### **3. Scalability**
- Clear separation between thumbnails and content images
- Easy to implement folder-level operations
- Better organization for large lessons

### **4. Developer Experience**
- Unified API patterns
- Consistent naming conventions
- Clear documentation and examples

## 🔄 **Migration Process**

### **Temporary to Permanent**
When a lesson is saved, temporary images are migrated:

```javascript
// From: temp/{userId}/{sessionId}/img_{index}_{timestamp}.webp
// To:   lessons/{lessonId}/images/slide-{n}-{timestamp}.webp
```

### **Thumbnail Selection**
When a thumbnail is selected for a lesson:

```javascript
// From: LocalThumbnailService memory cache
// To:   lessons/{lessonId}/thumbnails/{slideId}_{timestamp}.webp
```

## 🧪 **Testing**

Run the standardized structure test:

```bash
node scripts/test-standardized-storage-structure.js
```

This test verifies:
- ✅ Thumbnail upload to `lessons/{lessonId}/thumbnails/`
- ✅ Slide image upload to `lessons/{lessonId}/images/`
- ✅ Folder structure creation
- ✅ File listing and access
- ✅ Cleanup functionality

## 📝 **Usage Examples**

### **Uploading a Thumbnail**
```javascript
const filePath = `lessons/${lessonId}/thumbnails/${slideId}_${Date.now()}.webp`;
await supabase.storage
  .from('lesson-assets')
  .upload(filePath, blob, { contentType: 'image/webp' });
```

### **Uploading a Slide Image**
```javascript
const filePath = `lessons/${lessonId}/images/slide-${index}-${Date.now()}.webp`;
await supabase.storage
  .from('lesson-assets')
  .upload(filePath, buffer, { contentType: 'image/webp' });
```

### **Listing Lesson Assets**
```javascript
// List all thumbnails
const { data: thumbnails } = await supabase.storage
  .from('lesson-assets')
  .list(`lessons/${lessonId}/thumbnails`);

// List all images
const { data: images } = await supabase.storage
  .from('lesson-assets')
  .list(`lessons/${lessonId}/images`);
```

## 🚀 **Future Enhancements**

### **Potential Improvements**
1. **Automatic cleanup** of old versions
2. **Image optimization** pipeline
3. **CDN integration** for better performance
4. **Batch operations** for multiple files
5. **Metadata storage** for image information

### **Monitoring**
- Track storage usage per lesson
- Monitor upload/download performance
- Analyze file format adoption
- Measure storage cost optimization

## ⚠️ **Important Notes**

1. **Backward Compatibility:** Old folder structures are still supported by RLS policies
2. **Format Migration:** PNG files are being migrated to WebP for better compression
3. **Temporary Storage:** Still uses separate `temp-images` bucket during generation
4. **File Naming:** Timestamps ensure unique filenames and prevent conflicts

## 🔗 **Related Files**

- `src/app/api/images/preview/route.ts` - Thumbnail API
- `src/services/slides/LocalThumbnailService.ts` - Thumbnail management
- `src/services/images/TemporaryImageService.ts` - Image migration
- `supabase/migrations/20250131000001_create_storage_bucket.sql` - Storage setup
- `scripts/test-standardized-storage-structure.js` - Testing script
