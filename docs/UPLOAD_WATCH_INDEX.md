# 📚 **npm run upload:watch - Documentation Index**

## 🎯 **Quick Navigation**

### **I want to...**

| Goal | Document | Time |
|------|----------|------|
| **Understand what it does** | [UPLOAD_WATCH_SUMMARY.md](./UPLOAD_WATCH_SUMMARY.md) | 5 min |
| **Get started quickly** | [UPLOAD_WATCH_QUICK_REFERENCE.md](./UPLOAD_WATCH_QUICK_REFERENCE.md) | 2 min |
| **Learn detailed steps** | [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md) | 15 min |
| **Understand the code** | [UPLOAD_WATCH_CODE_REFERENCE.md](./UPLOAD_WATCH_CODE_REFERENCE.md) | 10 min |

---

## 📄 **Document Descriptions**

### **1. UPLOAD_WATCH_SUMMARY.md** 📋
**Best for**: Getting complete overview

**Contains**:
- ✅ Answers to your 3 main questions
- ✅ Complete workflow diagram
- ✅ Metadata extraction example
- ✅ Quick start guide
- ✅ File organization
- ✅ Important rules

**Read this if**: You want to understand the entire system

---

### **2. UPLOAD_WATCH_QUICK_REFERENCE.md** ⚡
**Best for**: Quick lookup while working

**Contains**:
- ✅ TL;DR summary
- ✅ Folder structure
- ✅ Image naming rules
- ✅ What happens automatically
- ✅ Where keywords come from
- ✅ S3 metadata format
- ✅ Usage commands
- ✅ Common issues

**Read this if**: You need quick answers while using the system

---

### **3. UPLOAD_WATCH_GUIDE.md** 📖
**Best for**: Detailed step-by-step learning

**Contains**:
- ✅ What it does (overview)
- ✅ Where to add photos
- ✅ File naming convention
- ✅ Step-by-step workflow (6 steps)
- ✅ Image compression details
- ✅ SEO keyword extraction
- ✅ ASCII conversion explanation
- ✅ S3 upload process
- ✅ File organization
- ✅ How to use (3 steps)
- ✅ Metadata extraction priority
- ✅ Troubleshooting guide

**Read this if**: You want to understand every detail

---

### **4. UPLOAD_WATCH_CODE_REFERENCE.md** 🔧
**Best for**: Developers and technical reference

**Contains**:
- ✅ File structure
- ✅ Key functions explained
- ✅ Code snippets
- ✅ Metadata extraction code
- ✅ S3 upload code
- ✅ Environment variables
- ✅ Metadata backup JSON format
- ✅ File movement process
- ✅ Debugging tips

**Read this if**: You need to understand or modify the code

---

## 🎓 **Learning Path**

### **For First-Time Users**
1. Start: [UPLOAD_WATCH_SUMMARY.md](./UPLOAD_WATCH_SUMMARY.md) (5 min)
2. Quick ref: [UPLOAD_WATCH_QUICK_REFERENCE.md](./UPLOAD_WATCH_QUICK_REFERENCE.md) (2 min)
3. Use it: Start `npm run upload:watch`

### **For Detailed Understanding**
1. Start: [UPLOAD_WATCH_SUMMARY.md](./UPLOAD_WATCH_SUMMARY.md) (5 min)
2. Learn: [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md) (15 min)
3. Reference: [UPLOAD_WATCH_QUICK_REFERENCE.md](./UPLOAD_WATCH_QUICK_REFERENCE.md) (as needed)

### **For Developers**
1. Overview: [UPLOAD_WATCH_SUMMARY.md](./UPLOAD_WATCH_SUMMARY.md) (5 min)
2. Code: [UPLOAD_WATCH_CODE_REFERENCE.md](./UPLOAD_WATCH_CODE_REFERENCE.md) (10 min)
3. Details: [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md) (15 min)

---

## ❓ **Your Questions Answered**

### **Q1: Where do I add photos?**
**Answer**: `uploads/to-upload/` folder

**See**: 
- [UPLOAD_WATCH_SUMMARY.md](./UPLOAD_WATCH_SUMMARY.md#q1-where-do-i-add-photos)
- [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#-where-to-add-photos)
- [UPLOAD_WATCH_QUICK_REFERENCE.md](./UPLOAD_WATCH_QUICK_REFERENCE.md#-folder-structure)

---

### **Q2: Where do SEO keywords come from?**
**Answer**: Automatically extracted from MongoDB recipe data

**Sources**:
1. Recipe title (first 3 words)
2. seo.keywords array
3. tags array
4. vital ingredients
5. seo.recipeCuisine
6. seo.recipeCategory

**See**:
- [UPLOAD_WATCH_SUMMARY.md](./UPLOAD_WATCH_SUMMARY.md#q2-where-do-seo-keywords-come-from)
- [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#step-3-extract-seo-keywords-from-mongodb-)
- [UPLOAD_WATCH_CODE_REFERENCE.md](./UPLOAD_WATCH_CODE_REFERENCE.md#-metadata-extraction-code)

---

### **Q3: How are keywords added to S3?**
**Answer**: As metadata headers in the S3 object

**Process**:
1. Extract from MongoDB
2. Combine all sources
3. Convert to ASCII
4. Add as S3 metadata header

**See**:
- [UPLOAD_WATCH_SUMMARY.md](./UPLOAD_WATCH_SUMMARY.md#q3-how-are-keywords-added-to-s3)
- [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#step-5-upload-to-s3-with-metadata-)
- [UPLOAD_WATCH_CODE_REFERENCE.md](./UPLOAD_WATCH_CODE_REFERENCE.md#-s3-upload-code)

---

## 🔍 **Key Concepts**

### **Filename Matching**
- Filename must match recipe slug exactly
- Example: `tikroji-svogunu-sriuba.jpg`
- See: [UPLOAD_WATCH_QUICK_REFERENCE.md](./UPLOAD_WATCH_QUICK_REFERENCE.md#-image-naming)

### **Metadata Extraction**
- Automatic from MongoDB
- Multiple sources combined
- ASCII conversion for S3
- See: [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#step-3-extract-seo-keywords-from-mongodb-)

### **Image Compression**
- Sharp library: 1200x800px max
- Quality: 85%
- ~50% size reduction
- See: [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#step-2-compress-image-)

### **File Organization**
- Original → `uploads/uploaded/`
- Metadata → `uploads/metadata/`
- Temp → deleted
- See: [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#step-6-organize-files-)

---

## 🚀 **Quick Start**

```bash
# 1. Start watcher
npm run upload:watch

# 2. In another terminal, add image
cp my-photo.jpg uploads/to-upload/recipe-slug.jpg

# 3. Watch the magic happen!
```

**See**: [UPLOAD_WATCH_QUICK_REFERENCE.md](./UPLOAD_WATCH_QUICK_REFERENCE.md#-usage)

---

## 📊 **Visual Diagrams**

The following diagrams are included in the documentation:

1. **Complete Flow** - How the system works end-to-end
2. **Metadata Extraction** - Where keywords come from
3. **Data Flow** - Local → MongoDB → S3

**See**: Individual documents for diagrams

---

## 🔧 **Troubleshooting**

### **Image Not Uploading**
See: [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#-troubleshooting)

### **Metadata Not Extracted**
See: [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#-troubleshooting)

### **Upload Fails**
See: [UPLOAD_WATCH_GUIDE.md](./UPLOAD_WATCH_GUIDE.md#-troubleshooting)

---

## 📝 **File Locations**

| Document | Path |
|----------|------|
| Summary | `docs/UPLOAD_WATCH_SUMMARY.md` |
| Quick Reference | `docs/UPLOAD_WATCH_QUICK_REFERENCE.md` |
| Detailed Guide | `docs/UPLOAD_WATCH_GUIDE.md` |
| Code Reference | `docs/UPLOAD_WATCH_CODE_REFERENCE.md` |
| Index (this file) | `docs/UPLOAD_WATCH_INDEX.md` |

---

## ✨ **Summary**

| Document | Best For | Time | Depth |
|----------|----------|------|-------|
| Summary | Overview | 5 min | Medium |
| Quick Ref | Quick lookup | 2 min | Low |
| Guide | Learning | 15 min | High |
| Code Ref | Development | 10 min | Very High |

---

## 🎯 **Next Steps**

1. **Choose your document** based on your needs
2. **Read the relevant section**
3. **Start using** `npm run upload:watch`
4. **Reference** as needed

---

**Status**: ✅ **All Documentation Complete**


