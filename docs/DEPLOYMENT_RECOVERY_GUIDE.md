# Deployment Recovery Guide

## 🔖 Current Stable Version

**Tag**: `v1.0.0-stable-2025-11-17`  
**Commit**: `a1e2380`  
**Date**: November 17, 2025  
**Status**: ✅ PRODUCTION LIVE

### Restore to This Version
```bash
git checkout v1.0.0-stable-2025-11-17
git push origin main --force
vercel --prod --yes
vercel alias set {new-deployment-url} ragaujam.lt
vercel alias set {new-deployment-url} www.ragaujam.lt
```

---

## 📊 Version History

### v1.0.0-stable-2025-11-17 (CURRENT)
- ✅ Fixed redirect loops
- ✅ Disabled i18n routing
- ✅ Wikibooks features live
- ✅ All systems operational
- **Deployment**: receptai-17vvtjv26-satkis-projects.vercel.app

### Previous Stable (0ef04b4)
- ✅ Redirect loop fix (307 temporary)
- ✅ i18n disabled
- **Deployment**: receptai-bjrgq6ss1-satkis-projects.vercel.app

### Previous Stable (2254725)
- ✅ Last version before Wikibooks work
- ✅ Known working baseline
- **Deployment**: receptai-i4mbl5bvz-satkis-projects.vercel.app

---

## 🚀 Quick Recovery Steps

### If Website Shows Redirect Loop
```bash
# 1. Check current configuration
git show HEAD:vercel.json | grep -A 5 redirects
git show HEAD:next.config.js | grep -A 10 "i18n:"

# 2. If broken, restore stable version
git checkout v1.0.0-stable-2025-11-17
git push origin main --force

# 3. Deploy
vercel --prod --yes

# 4. Update aliases
vercel alias set {new-deployment-url} ragaujam.lt
vercel alias set {new-deployment-url} www.ragaujam.lt

# 5. Verify
curl -I https://ragaujam.lt/
curl -I https://www.ragaujam.lt/receptai
```

### If Database Connection Fails
```bash
# 1. Check environment variables
vercel env ls

# 2. Verify MONGODB_URI is set
vercel env pull

# 3. Test locally
npm run dev

# 4. If still broken, check MongoDB Atlas
# - Verify IP whitelist includes Vercel IPs
# - Check cluster status in MongoDB dashboard
# - Verify credentials are correct
```

### If Images Not Loading
```bash
# 1. Check S3 bucket
aws s3 ls s3://receptu-images/receptai/ --region eu-north-1

# 2. Verify image URLs in database
# Connect to MongoDB and check recipe.image.src

# 3. Check S3 CORS configuration
aws s3api get-bucket-cors --bucket receptu-images --region eu-north-1

# 4. Verify S3 permissions
# - Bucket policy allows public read
# - CloudFront distribution (if used) is configured
```

---

## 🔍 Health Check Commands

### Full System Check
```bash
#!/bin/bash

echo "=== Website Health Check ==="

# 1. Homepage redirect
echo "1. Testing homepage redirect..."
curl -I https://ragaujam.lt/ 2>&1 | grep -E "HTTP|Location"

# 2. WWW redirect
echo "2. Testing www redirect..."
curl -I https://www.ragaujam.lt/ 2>&1 | grep -E "HTTP|Location"

# 3. Final page load
echo "3. Testing final page load..."
curl -I https://www.ragaujam.lt/receptai 2>&1 | grep "HTTP"

# 4. Database connectivity
echo "4. Testing database..."
curl -s https://ragaujam.lt/api/recipes | head -c 100

# 5. Sitemap
echo "5. Testing sitemap..."
curl -I https://ragaujam.lt/sitemap.xml 2>&1 | grep "HTTP"

echo "=== Health Check Complete ==="
```

---

## 📝 Configuration Backup

### Critical Files to Backup
```bash
# Backup current configuration
git show HEAD:vercel.json > backup/vercel-$(date +%Y%m%d).json
git show HEAD:next.config.js > backup/next.config-$(date +%Y%m%d).js
git show HEAD:package.json > backup/package-$(date +%Y%m%d).json

# Backup environment
vercel env pull > backup/env-$(date +%Y%m%d).local
```

### Restore from Backup
```bash
# Restore configuration
cp backup/vercel-20251117.json vercel.json
cp backup/next.config-20251117.js next.config.js
cp backup/package-20251117.json package.json

# Commit and deploy
git add .
git commit -m "restore: revert to backup configuration"
git push origin main
vercel --prod --yes
```

---

## 🔐 Secure Credentials

### Environment Variables (DO NOT COMMIT)
```
MONGODB_URI=mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
NEXT_PUBLIC_SITE_URL=https://ragaujam.lt
SITE_URL=https://ragaujam.lt
NODE_ENV=production
```

### AWS S3 Credentials (Local Only)
```
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
AWS_REGION=eu-north-1
```

### MongoDB Atlas
```
Connection String: mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
Database: receptai
Collections: recipes_new, categories_new, groups
```

---

## 📞 Support Contacts

### Services
- **Vercel**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **AWS S3**: https://s3.console.aws.amazon.com
- **Domain**: iv.lt (ragaujam.lt registrar)

### Monitoring
- **Vercel Analytics**: https://vercel.com/satkis-projects/receptai/analytics
- **MongoDB Monitoring**: https://cloud.mongodb.com/v2/
- **AWS CloudWatch**: https://console.aws.amazon.com/cloudwatch

---

## ✅ Verification Checklist

After any deployment:
- [ ] Website loads at https://ragaujam.lt
- [ ] Website loads at https://www.ragaujam.lt
- [ ] No redirect loops
- [ ] Recipes display correctly
- [ ] Images load from S3
- [ ] Database connected
- [ ] Sitemap accessible
- [ ] SEO meta tags present
- [ ] No console errors

---

**Last Updated**: November 17, 2025  
**Stable Version**: v1.0.0-stable-2025-11-17  
**Emergency Contact**: Check Vercel dashboard for deployment logs

