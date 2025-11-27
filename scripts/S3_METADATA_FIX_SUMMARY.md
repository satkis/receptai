# 🔧 S3 Image Metadata Fix - Summary

**Date**: 2025-11-26  
**Issue**: Recent image uploads to S3 missing user-defined metadata (x-amz-meta-* headers)  
**Status**: ✅ **FIXED**

---

## 🐛 Root Cause

The `image-prep-and-load.js` script was **not setting user-defined metadata** when uploading images to S3.

### **Affected Script**
- `scripts/image-prep-and-load.js` - Used for Wikibooks recipe image uploads

### **Working Scripts** (for reference)
- `scripts/upload-images.js` - Already had proper metadata handling ✅
- `scripts/watch-uploads.js` - Uses upload-images.js, so already working ✅

---

## ✅ What Was Fixed

### **Added Functions**

1. **`sanitizeForS3Metadata(text)`** (Line 351-356)
   - Removes non-ASCII characters (Lithuanian letters, etc.)
   - S3 metadata headers cannot contain non-ASCII characters
   - Prevents upload errors with Lithuanian recipe data

2. **`generateImageMetadata(filename, recipe)`** (Line 361-402)
   - Extracts recipe data from MongoDB document
   - Generates all required metadata fields
   - Sanitizes text fields to prevent S3 errors
   - Returns both system-defined and user-defined metadata

### **Updated Function**

**`uploadImageToS3(filename, compressedPath, recipe)`** (Line 422-454)
- Now accepts `recipe` parameter
- Calls `generateImageMetadata()` to generate metadata
- Sets all user-defined metadata in S3 upload params:
  - `x-amz-meta-alt-text`
  - `x-amz-meta-recipe-slug`
  - `x-amz-meta-width`
  - `x-amz-meta-height`
  - `x-amz-meta-keywords`
  - `x-amz-meta-upload-date`
  - `x-amz-meta-category`
  - `x-amz-meta-cuisine`
  - `x-amz-meta-description`

### **Updated Call Site**

Line 581: Updated to pass recipe object
```javascript
const s3Url = await uploadImageToS3(finalFileName, compressedPath, recipe);
```

---

## 📊 Metadata Comparison

### **Before Fix** (Recent uploads)
```
Type: System defined
- Cache-Control: public, max-age=31536000
- Content-Disposition: inline
- Content-Type: image/jpeg
```

### **After Fix** (New uploads)
```
Type: System defined
- Cache-Control: public, max-age=31536000, immutable
- Content-Disposition: inline; filename="..."
- Content-Type: image/jpeg

Type: User defined
- x-amz-meta-alt-text: Recipe title
- x-amz-meta-recipe-slug: recipe-slug
- x-amz-meta-width: 1200
- x-amz-meta-height: 800
- x-amz-meta-keywords: keyword1,keyword2,...
- x-amz-meta-upload-date: 2025-11-26
- x-amz-meta-category: Category name
- x-amz-meta-cuisine: Cuisine type
- x-amz-meta-description: Recipe description
```

---

## 🚀 Testing

To verify the fix works:

1. Run the image prep and load script:
   ```bash
   npm run image-prep-and-load
   ```

2. Check S3 console for newly uploaded images
3. Verify metadata is present in S3 object properties

---

## 📝 Notes

- All text fields are sanitized to remove Lithuanian characters
- Metadata is extracted directly from MongoDB recipe documents
- Consistent with `upload-images.js` implementation
- No breaking changes to existing functionality

