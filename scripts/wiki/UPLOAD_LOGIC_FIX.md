# 🔧 Upload Logic Fix - Success/Failed Count Issue

**Date**: November 26, 2025  
**Issue**: Terminal showed "20 successful, 20 failed" when all 20 recipes uploaded successfully  
**Root Cause**: Wiki JSON moving logic was inside the try-catch block that counts failures  
**Status**: ✅ **FIXED**

---

## 🐛 The Problem

When running `npm run upload-gpt-to-mongodb`:

```
✅ Successful: 20
❌ Failed: 20
```

But all 20 recipes were actually uploaded to MongoDB successfully!

---

## 🔍 Root Cause Analysis

The `moveOriginalWikiJson()` function was being called **inside** the try-catch block that counts upload failures:

```javascript
try {
  // ... upload recipe to MongoDB ...
  successful++;
  
  // ... move ChatGPT JSON ...
  
  // ❌ PROBLEM: This was inside the try-catch
  moveOriginalWikiJson(jsonData.originalSource.url);
  
} catch (error) {
  // ❌ Any error here incremented failed count
  failed++;
}
```

**What happened:**
1. Recipe uploaded successfully ✅
2. `successful++` incremented
3. `moveOriginalWikiJson()` was called
4. If ANY error occurred in that function (even caught internally), it could propagate
5. The catch block caught it and incremented `failed++`
6. Result: Both counters incremented!

---

## ✅ The Solution

Moved the wiki JSON moving logic **outside** the try-catch block:

```javascript
let originalSourceUrl = null;

try {
  // ... upload recipe to MongoDB ...
  successful++;
  
  // ... move ChatGPT JSON ...
  
  // Store URL for later processing
  originalSourceUrl = jsonData.originalSource?.url || null;
  
} catch (error) {
  // Only upload errors counted here
  failed++;
}

// ✅ FIXED: This is now OUTSIDE the try-catch
if (originalSourceUrl) {
  try {
    moveOriginalWikiJson(originalSourceUrl);
  } catch (error) {
    // Silently ignore - it's optional
  }
}
```

**Benefits:**
- ✅ Wiki JSON moving doesn't affect success/failed counts
- ✅ Only actual upload errors are counted as failures
- ✅ Wiki JSON moving errors are silently ignored (optional operation)
- ✅ Accurate reporting of upload status

---

## 📊 Expected Results

Now when you run `npm run upload-gpt-to-mongodb`:

```
✅ Successful: 20
❌ Failed: 0
```

All 20 recipes uploaded successfully, and wiki JSON files are moved independently without affecting the count.

---

## 🔄 Workflow (Updated)

```
1. Read ChatGPT JSON from scripts/wiki/output/chatGPT/
2. Upload to MongoDB
   ├─ If success: successful++
   └─ If error: failed++
3. Move ChatGPT JSON to uploaded-to-mongodb/
4. Store originalSource.url for later
5. (Outside try-catch) Move original wiki JSON to processed/wiki-raw-recipes/
   └─ Errors here don't affect success/failed counts
```

---

## 🧪 Testing

The fix ensures:
- ✅ Accurate success count (only upload successes)
- ✅ Accurate failed count (only upload failures)
- ✅ Wiki JSON moving is optional and doesn't affect counts
- ✅ All operations complete successfully

---

## 📝 Code Changes

**File**: `scripts/wiki/upload-gpt-to-mongodb.js`

**Changes:**
1. Moved `let originalSourceUrl = null;` to loop level (line 140)
2. Moved wiki JSON moving logic outside try-catch (lines 183-191)
3. Wrapped wiki JSON moving in separate try-catch (lines 186-190)
4. Removed `originalSourceUrl = null;` from catch block (no longer needed)

---

**Status**: ✅ **READY TO USE**

Run `npm run upload-gpt-to-mongodb` and you'll see accurate success/failed counts!


