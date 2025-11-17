# Critical Issues and Solutions Reference

## 🚨 Issue #1: ERR_TOO_MANY_REDIRECTS (RESOLVED)

### Symptoms
- Website shows "ERR_TOO_MANY_REDIRECTS" error
- Affects all browsers and devices
- Persists even on new devices (not browser cache)
- Network inspector shows 307/308 redirect loops

### Root Causes
1. **i18n Routing Enabled**: Next.js auto-prepends `/lt/` to all routes
2. **Conflicting Redirects**: Both vercel.json and next.config.js had redirect rules
3. **www Redirect Loop**: vercel.json redirected www → non-www while both aliased to same deployment
4. **Domain Alias Conflict**: Both domains pointing to same deployment with redirect rule

### Solution Applied
```javascript
// next.config.js
// DISABLE i18n
// i18n: { locales: ['lt'], defaultLocale: 'lt', localeDetection: false }

// ADD redirect
async redirects() {
  return [{
    source: '/',
    destination: '/receptai',
    permanent: false,  // 307 temporary (not 301)
  }];
}
```

```json
// vercel.json
"redirects": []  // EMPTY - let Next.js handle all redirects
```

### Verification
```bash
# Test redirect chain
curl -I https://ragaujam.lt/
# Should return: 307 https://www.ragaujam.lt/

curl -I https://www.ragaujam.lt/
# Should return: 307 /receptai

curl -I https://www.ragaujam.lt/receptai
# Should return: 200 OK
```

### Prevention
- ✅ Never enable i18n for single-language sites
- ✅ Keep vercel.json redirects empty
- ✅ Use next.config.js for all redirects
- ✅ Use 307 (temporary) not 301 (permanent) for redirects
- ✅ Alias both www and non-www to same deployment

---

## 🚨 Issue #2: Staging Branch Had Same Issues

### Problem
When moving staging to production, discovered staging branch had:
- i18n enabled
- www redirect in vercel.json
- Would cause same redirect loop in production

### Solution
Fixed staging branch BEFORE merging to main:
1. Disabled i18n in next.config.js
2. Removed www redirect from vercel.json
3. Added / → /receptai redirect in next.config.js
4. Committed and pushed staging
5. Merged staging → main
6. Deployed to production

### Lesson Learned
Always verify staging branch configuration before merging to production.

---

## 🚨 Issue #3: Image Metadata Contains Non-ASCII Characters

### Symptoms
- Image upload fails with cryptic error
- AWS S3 metadata headers reject upload
- Lithuanian characters in metadata cause issues

### Root Cause
S3 metadata headers cannot contain non-ASCII characters (Lithuanian letters).

### Solution
Sanitize all metadata before uploading:
```javascript
// Remove Lithuanian characters from metadata
const sanitizeMetadata = (text) => {
  return text
    .replace(/[ąčęėįšųūūžĄČĘĖĮŠŲŪŽ]/g, '')
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .trim();
};
```

---

## 🚨 Issue #4: Build Conflicts with robots.txt

### Symptoms
- Build fails with "robots.txt conflict"
- Next.js 15 doesn't support dynamic robots.txt

### Solution
Convert from dynamic to static:
- Moved `pages/robots.txt.tsx` → `public/robots.txt`
- Made it static file instead of dynamic route
- Build now succeeds

---

## 🚨 Issue #5: Wikibooks Disclaimer Not Clickable

### Symptoms
- Creative Commons license name not clickable
- Users can't access license details

### Solution
Made license name a clickable link:
```jsx
<a href="https://creativecommons.org/licenses/by-sa/4.0/" 
   target="_blank" rel="noopener noreferrer"
   className="text-blue-600 hover:underline">
  Creative Commons Attribution-ShareAlike 4.0
</a>
```

---

## 🔧 Common Troubleshooting

### Website Won't Load
1. Check Vercel deployment status: `vercel list --prod`
2. Verify domain aliases: `vercel alias list`
3. Test direct Vercel URL: `https://receptai-17vvtjv26-satkis-projects.vercel.app/`
4. Check environment variables in Vercel dashboard

### Redirect Loop Appears
1. Check vercel.json - ensure `redirects: []`
2. Check next.config.js - ensure i18n commented out
3. Verify both domains aliased to SAME deployment
4. Clear browser cache and try new device

### Images Not Loading
1. Check AWS S3 bucket permissions
2. Verify image URLs in database
3. Check CORS headers in S3
4. Verify image exists in S3: `receptu-images/receptai/{slug}.jpg`

### Database Connection Failed
1. Check MONGODB_URI in Vercel environment
2. Verify MongoDB Atlas IP whitelist includes Vercel IPs
3. Test connection locally: `npm run dev`
4. Check MongoDB Atlas dashboard for connection issues

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] ESLint clean: `npm run lint`
- [ ] vercel.json has empty redirects array
- [ ] next.config.js has i18n commented out
- [ ] Environment variables set in Vercel
- [ ] Staging tested and working
- [ ] Git commits pushed to main
- [ ] Domain aliases updated after deployment

---

## 🆘 Emergency Rollback

If production breaks:
```bash
# Rollback to previous stable version
git log --oneline | head -5
git checkout {previous-commit}
git push origin main --force
vercel --prod --yes
vercel alias set {new-deployment-url} ragaujam.lt
vercel alias set {new-deployment-url} www.ragaujam.lt
```

---

**Last Updated**: November 17, 2025  
**Status**: All issues resolved and documented

