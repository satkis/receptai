# Production Snapshot - November 17, 2025

## 🚀 Current Production Status

**Deployment Date**: November 17, 2025  
**Production URL**: https://ragaujam.lt  
**Vercel Deployment**: `receptai-17vvtjv26-satkis-projects.vercel.app`  
**Git Commit**: `a1e2380` (HEAD -> main)  
**Status**: ✅ LIVE AND STABLE

---

## 📋 Key Production Details

### Domain Configuration
- **Primary Domain**: ragaujam.lt
- **WWW Domain**: www.ragaujam.lt
- **Both domains**: Aliased to same Vercel deployment
- **Redirect Flow**: 
  - `ragaujam.lt/` → `www.ragaujam.lt/` (307)
  - `www.ragaujam.lt/` → `/receptai` (307)
  - Final page: `www.ragaujam.lt/receptai` (200 OK)

### Critical Configuration Files

#### vercel.json
```json
{
  "version": 2,
  "github": { "autoAlias": false },
  "env": { "NODE_ENV": "production" },
  "build": {
    "env": { "NEXT_PUBLIC_SITE_URL": "https://ragaujam.lt" }
  },
  "functions": {
    "pages/api/**/*.ts": { "maxDuration": 30 },
    "pages/sitemap*.tsx": { "maxDuration": 30 }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ],
  "redirects": []
}
```

**CRITICAL**: `redirects` array is EMPTY - all redirects handled by Next.js

#### next.config.js Key Settings
- **i18n**: DISABLED (commented out) - prevents `/lt/` prefix
- **Redirect**: `/` → `/receptai` (307 temporary)
- **Image Optimization**: Enabled for AWS S3 (receptu-images bucket)
- **Remote Patterns**: 
  - `ragaujam.s3.amazonaws.com`
  - `ragaujam-cdn.s3.amazonaws.com`
  - `receptu-images.s3.eu-north-1.amazonaws.com`

### Database Configuration
- **MongoDB**: mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
- **Collections**: recipes_new, categories_new, groups
- **Status**: Connected and operational

### AWS S3 Configuration
- **Bucket**: receptu-images
- **Region**: eu-north-1
- **Folders**: 
  - `/receptai/` - Recipe images
  - `/static/` - Logos, favicons, icons

---

## 🔧 Recent Fixes Applied

### Issue: ERR_TOO_MANY_REDIRECTS
**Root Cause**: 
1. i18n routing enabled (auto-prepended `/lt/`)
2. www → non-www redirect in vercel.json
3. Both domains aliased to same deployment

**Solution Applied**:
1. ✅ Disabled i18n in next.config.js
2. ✅ Removed www redirect from vercel.json
3. ✅ Moved redirect logic to next.config.js (307 temporary)
4. ✅ Kept both domain aliases pointing to same deployment

**Commits**:
- `049a1c7`: Disable i18n routing
- `6a0b8d9`: Remove www redirect from vercel.json
- `0ef04b4`: Change redirect to 307 temporary
- `f58ec5f`: Apply same fixes to staging
- `a1e2380`: Merge staging → main

---

## 📦 Features Currently Live

### Wikibooks Integration
- WikibooksDisclaimer component for recipe attribution
- CC BY-SA 4.0 license compliance
- Automated recipe extraction from Wikibooks
- Image processing and upload workflow

### Image Management
- Automated image upload to AWS S3
- Image compression before upload
- Metadata extraction from database
- Responsive image optimization

### SEO Features
- Schema.org structured data
- Dynamic sitemap generation
- Meta tags optimization
- Recipe rich snippets

### Recipe Features
- Recipe cards with vital ingredients
- Time overlay display
- Ingredient categorization
- Step-by-step instructions
- Tips/Patarimai section

---

## 🔐 Environment Variables (Production)

Required in Vercel:
```
MONGODB_URI=mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
NEXT_PUBLIC_SITE_URL=https://ragaujam.lt
SITE_URL=https://ragaujam.lt
NODE_ENV=production
```

---

## 🆘 Emergency Recovery

### If Redirect Loop Occurs Again
1. Check `vercel.json` - ensure `redirects: []` is empty
2. Check `next.config.js` - ensure i18n is commented out
3. Verify both domains aliased to SAME deployment
4. Deploy with: `vercel --prod --yes`

### Rollback to Previous Version
```bash
git checkout 0ef04b4  # Last stable before merge
git push origin main --force
vercel --prod --yes
vercel alias set receptai-bjrgq6ss1-satkis-projects.vercel.app ragaujam.lt
vercel alias set receptai-bjrgq6ss1-satkis-projects.vercel.app www.ragaujam.lt
```

### Quick Health Check
```bash
# Test redirect chain
curl -I https://ragaujam.lt/
curl -I https://www.ragaujam.lt/
curl -I https://www.ragaujam.lt/receptai

# All should return 307 or 200, never 308 or redirect loops
```

---

## 📊 Deployment History

| Commit | Date | Change | Status |
|--------|------|--------|--------|
| a1e2380 | 2025-11-17 | Merge staging with fixes | ✅ LIVE |
| f58ec5f | 2025-11-17 | Fix staging i18n/redirects | ✅ Tested |
| 0ef04b4 | 2025-11-17 | Change to 307 redirect | ✅ Stable |
| 6a0b8d9 | 2025-11-17 | Remove www redirect | ✅ Stable |
| 049a1c7 | 2025-11-17 | Disable i18n | ✅ Stable |

---

## ✅ Verification Checklist

- [x] Website loads at https://ragaujam.lt
- [x] Website loads at https://www.ragaujam.lt
- [x] No redirect loops (ERR_TOO_MANY_REDIRECTS)
- [x] Recipes display correctly
- [x] Images load from S3
- [x] Database connected
- [x] Wikibooks features working
- [x] SEO meta tags present
- [x] Sitemap accessible

---

**Last Updated**: November 17, 2025  
**Next Review**: When deploying new features  
**Backup Location**: This file + git history

