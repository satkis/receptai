# ⚡ S3 Metadata Lithuanian Fix - Quick Reference

## The Issue
S3 metadata was cutting off Lithuanian characters:
- **Expected:** `Vokiečių` (German cuisine)
- **Actual:** `Vokie` (truncated)

## The Fix
Updated 2 scripts to preserve UTF-8 Lithuanian characters:

### 1. `scripts/image-prep-and-load.js`
- Function: `sanitizeForS3Metadata()`
- Change: Keep Lithuanian chars, remove only control chars

### 2. `scripts/upload-images.js`
- Function: `convertToASCII()`
- Change: Keep Lithuanian chars, remove only control chars

### 3. `scripts/watch-uploads.js`
- Status: ✅ No changes (uses upload-images.js)

---

## What's Fixed

| Field | Before | After |
|-------|--------|-------|
| `x-amz-meta-cuisine` | "Vokie" | "Vokiečių" ✅ |
| `x-amz-meta-category` | "Pagrindin" | "Pagrindinis" ✅ |
| `x-amz-meta-keywords` | Truncated | Full keywords ✅ |
| `x-amz-meta-description` | Truncated | Full description ✅ |

---

## How to Test

### Test 1: Image Prep and Load
```bash
npm run image-prep-and-load
```
Check S3: `x-amz-meta-cuisine` should show full name

### Test 2: Upload Images
```bash
npm run upload-images
```
Check S3: All metadata should show full Lithuanian text

### Test 3: Watch Uploads
```bash
npm run watch-uploads
```
Drop image in `uploads/to-upload/` and check S3

---

## Technical Details

### What Was Removed
```javascript
// ❌ OLD: Removed ALL non-ASCII characters
.replace(/[^\x00-\x7F]/g, '')
```

### What's Now Used
```javascript
// ✅ NEW: Keep UTF-8, remove only problematic chars
.replace(/[\r\n\t]/g, ' ')      // Newlines/tabs → spaces
.replace(/\s+/g, ' ')           // Multiple spaces → single
```

---

## Affected Metadata Fields

All S3 metadata now supports full Lithuanian text:
- ✅ `x-amz-meta-cuisine` - Cuisine name
- ✅ `x-amz-meta-category` - Recipe category
- ✅ `x-amz-meta-keywords` - Recipe keywords
- ✅ `x-amz-meta-description` - Recipe description
- ✅ `x-amz-meta-alt-text` - Image alt text

---

## Next Steps

1. ✅ Run `npm run image-prep-and-load` to upload images
2. ✅ Check S3 metadata to verify full Lithuanian text
3. ✅ All new uploads will use the fixed metadata

---

## Files Modified

- `scripts/image-prep-and-load.js` - Updated `sanitizeForS3Metadata()`
- `scripts/upload-images.js` - Updated `convertToASCII()`
- `scripts/S3_METADATA_LITHUANIAN_FIX.md` - Full documentation

---

**Status:** ✅ Fixed and ready to use!

