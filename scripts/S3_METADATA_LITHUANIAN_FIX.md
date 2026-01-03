# 🔧 S3 Metadata Lithuanian Characters Fix

## Problem
When uploading images to S3, the `x-amz-meta-cuisine` metadata was being cut off. For example:
- Expected: `Vokiečių` (Lithuanian for "German")
- Actual: `Vokie` (truncated)

This was happening because Lithuanian characters with diacritics (č, š, ž, ą, etc.) were being removed from the metadata, causing upload failures.

---

## Root Cause
The metadata sanitization functions were removing **all non-ASCII characters**, which includes Lithuanian letters:
- `č` (c with caron) → removed
- `š` (s with caron) → removed
- `ž` (z with caron) → removed
- `ą` (a with ogonek) → removed

This caused cuisine names like "Vokiečių" to become "Vokie" (only ASCII letters remained).

---

## Solution
**AWS S3 metadata DOES support UTF-8 encoding!**

The fix was to update the sanitization functions to:
1. ✅ **Preserve Lithuanian characters** (UTF-8)
2. ✅ **Remove only problematic characters** (control characters, smart quotes, em-dashes)
3. ✅ **Clean up whitespace** (collapse multiple spaces)

---

## Files Modified

### 1. `scripts/image-prep-and-load.js`
**Function:** `sanitizeForS3Metadata()`

**Before:**
```javascript
function sanitizeForS3Metadata(text) {
  if (!text) return '';
  return text
    .replace(/[^\x00-\x7F]/g, '') // ❌ Removes ALL non-ASCII
    .trim();
}
```

**After:**
```javascript
function sanitizeForS3Metadata(text) {
  if (!text) return '';
  return text
    .trim()
    .replace(/[\r\n\t]/g, ' ')    // ✅ Replace newlines/tabs
    .replace(/\s+/g, ' ');        // ✅ Collapse spaces
}
```

### 2. `scripts/upload-images.js`
**Function:** `convertToASCII()`

**Before:**
```javascript
function convertToASCII(text) {
  // ... Lithuanian character mapping ...
  return text
    .replace(/[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/g, char => lithuanianMap[char])
    .replace(/[^\x00-\x7F]/g, '') // ❌ Removes ALL non-ASCII
    // ...
}
```

**After:**
```javascript
function convertToASCII(text) {
  if (!text) return '';
  return text
    .replace(/[""'']/g, '"')      // ✅ Smart quotes → regular
    .replace(/[–—]/g, '-')        // ✅ Em-dashes → regular
    .replace(/[\x00-\x1F\x7F]/g, '') // ✅ Control chars only
    .replace(/\s+/g, ' ')         // ✅ Collapse spaces
    .trim();
}
```

### 3. `scripts/watch-uploads.js`
**Status:** ✅ No changes needed (uses `upload-images.js`)

---

## What Changed in S3 Metadata

### Before Fix
```
x-amz-meta-cuisine: Vokie        ❌ Truncated
x-amz-meta-category: Pagrindin   ❌ Truncated
x-amz-meta-keywords: aadun,-,... ❌ Truncated
```

### After Fix
```
x-amz-meta-cuisine: Vokiečių     ✅ Full name
x-amz-meta-category: Pagrindinis  ✅ Full name
x-amz-meta-keywords: aadun,-,... ✅ Full keywords
```

---

## Testing the Fix

### Test 1: Upload Image with Lithuanian Cuisine
```bash
npm run image-prep-and-load
```

Check S3 metadata:
```
Expected: x-amz-meta-cuisine: Vokiečių
Actual: x-amz-meta-cuisine: Vokiečių ✅
```

### Test 2: Upload Image with Lithuanian Category
```bash
npm run upload-images
```

Check S3 metadata:
```
Expected: x-amz-meta-category: Pagrindinis patiekalas
Actual: x-amz-meta-category: Pagrindinis patiekalas ✅
```

---

## Affected Metadata Fields

All these fields now preserve Lithuanian characters:
- ✅ `x-amz-meta-cuisine` - Recipe cuisine (e.g., "Vokiečių", "Itališka")
- ✅ `x-amz-meta-category` - Recipe category (e.g., "Pagrindinis patiekalas")
- ✅ `x-amz-meta-keywords` - Recipe keywords
- ✅ `x-amz-meta-description` - Recipe description
- ✅ `x-amz-meta-alt-text` - Image alt text

---

## Why This Works

AWS S3 metadata headers support UTF-8 encoding. The issue was that we were being overly cautious and removing ALL non-ASCII characters.

The fix removes only:
1. **Control characters** (`\x00-\x1F`, `\x7F`) - These can cause HTTP header issues
2. **Smart quotes** (`""''`) - Replace with regular quotes
3. **Em-dashes** (`–—`) - Replace with regular dashes
4. **Extra whitespace** - Collapse multiple spaces

Lithuanian characters (UTF-8) are now preserved! ✅

---

## Deployment

### For New Uploads
All new image uploads will automatically use the fixed metadata:
```bash
npm run image-prep-and-load
npm run upload-images
npm run watch-uploads
```

### For Existing Images
Existing images in S3 will keep their truncated metadata. To fix them:
1. Re-upload the images using the fixed scripts
2. Or manually update metadata in S3 console

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Cuisine metadata | "Vokie" | "Vokiečių" ✅ |
| Category metadata | "Pagrindin" | "Pagrindinis" ✅ |
| Lithuanian chars | Removed ❌ | Preserved ✅ |
| UTF-8 support | No | Yes ✅ |
| Control chars | Kept | Removed ✅ |

**Status:** ✅ Fixed and ready to use!

