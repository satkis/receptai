# Production Documentation Index

## 📚 Complete Documentation for Ragaujam.lt

**Current Version**: v1.0.0-stable-2025-11-17  
**Status**: ✅ PRODUCTION LIVE  
**Last Updated**: November 17, 2025

---

## 🎯 Quick Start

### For Urgent Issues
1. **Website Down?** → See [DEPLOYMENT_RECOVERY_GUIDE.md](./DEPLOYMENT_RECOVERY_GUIDE.md)
2. **Redirect Loop?** → See [CRITICAL_ISSUES_AND_SOLUTIONS.md](./CRITICAL_ISSUES_AND_SOLUTIONS.md)
3. **Need to Rollback?** → See [DEPLOYMENT_RECOVERY_GUIDE.md](./DEPLOYMENT_RECOVERY_GUIDE.md#-emergency-rollback)

### For Understanding the System
1. Start with [PRODUCTION_SUMMARY_2025-11-17.md](./PRODUCTION_SUMMARY_2025-11-17.md)
2. Then read [PRODUCTION_ARCHITECTURE_DETAILS.md](./PRODUCTION_ARCHITECTURE_DETAILS.md)
3. Reference [PRODUCTION_SNAPSHOT_2025-11-17.md](./PRODUCTION_SNAPSHOT_2025-11-17.md) for details

---

## 📖 Documentation Files

### 1. PRODUCTION_SUMMARY_2025-11-17.md
**Purpose**: Executive summary of current production state  
**Contains**:
- Current status of all systems
- What was fixed today
- Features currently live
- Deployment details
- Performance metrics
- Emergency procedures
- Next steps

**Read this if**: You want a quick overview of the entire system

---

### 2. PRODUCTION_SNAPSHOT_2025-11-17.md
**Purpose**: Detailed snapshot of production configuration  
**Contains**:
- Deployment information
- Domain configuration
- Critical configuration files (vercel.json, next.config.js)
- Database configuration
- AWS S3 configuration
- Recent fixes applied
- Features currently live
- Environment variables
- Emergency recovery procedures
- Verification checklist

**Read this if**: You need specific configuration details

---

### 3. PRODUCTION_ARCHITECTURE_DETAILS.md
**Purpose**: Technical architecture and system design  
**Contains**:
- System architecture overview
- Technology stack
- Project structure
- Request flow diagrams
- Database schema
- Image pipeline
- Deployment process
- Monitoring and health checks
- ISR configuration

**Read this if**: You want to understand how the system works

---

### 4. CRITICAL_ISSUES_AND_SOLUTIONS.md
**Purpose**: Known issues and their solutions  
**Contains**:
- Issue #1: ERR_TOO_MANY_REDIRECTS (RESOLVED)
- Issue #2: Staging branch had same issues (RESOLVED)
- Issue #3: Image metadata non-ASCII characters
- Issue #4: Build conflicts with robots.txt
- Issue #5: Wikibooks disclaimer not clickable
- Common troubleshooting
- Pre-deployment checklist
- Emergency rollback procedure

**Read this if**: You encounter an issue or want to prevent problems

---

### 5. DEPLOYMENT_RECOVERY_GUIDE.md
**Purpose**: Step-by-step recovery and deployment procedures  
**Contains**:
- Current stable version information
- Version history
- Quick recovery steps
- Health check commands
- Configuration backup procedures
- Secure credentials reference
- Support contacts
- Verification checklist

**Read this if**: You need to deploy, recover, or troubleshoot

---

## 🔖 Git Tags & Commits

### Current Stable Version
```
Tag: v1.0.0-stable-2025-11-17
Commit: a1e2380
Date: November 17, 2025
Status: ✅ PRODUCTION LIVE
```

### How to Restore
```bash
git checkout v1.0.0-stable-2025-11-17
git push origin main --force
vercel --prod --yes
```

---

## 🚀 Common Tasks

### Deploy New Changes
1. Make changes on develop branch
2. Test locally: `npm run dev`
3. Push to staging: `git push origin staging`
4. Test on staging: https://staging-ragaujam.vercel.app
5. Merge to main: `git merge staging`
6. Deploy: `vercel --prod --yes`
7. Update aliases: `vercel alias set {url} ragaujam.lt`

### Rollback to Previous Version
1. See [DEPLOYMENT_RECOVERY_GUIDE.md](./DEPLOYMENT_RECOVERY_GUIDE.md#-emergency-rollback)
2. Or use: `git checkout v1.0.0-stable-2025-11-17`

### Check System Health
1. See [DEPLOYMENT_RECOVERY_GUIDE.md](./DEPLOYMENT_RECOVERY_GUIDE.md#-health-check-commands)
2. Run: `curl -I https://ragaujam.lt/`

### Fix Redirect Loop
1. See [CRITICAL_ISSUES_AND_SOLUTIONS.md](./CRITICAL_ISSUES_AND_SOLUTIONS.md#-issue-1-err_too_many_redirects-resolved)
2. Verify vercel.json has empty redirects
3. Verify next.config.js has i18n commented out

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    RAGAUJAM.LT                          │
│              Lithuanian Recipe Website                  │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼────┐        ┌────▼────┐
    │ Vercel │         │ MongoDB │        │ AWS S3  │
    │ (CDN)  │         │ (Data)  │        │(Images) │
    └────────┘         └─────────┘        └─────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  User Browser  │
                    └────────────────┘
```

---

## 🔐 Security Checklist

- [x] HTTPS only
- [x] Security headers configured
- [x] Environment variables secure
- [x] No sensitive data in git
- [x] MongoDB Atlas encryption
- [x] S3 bucket permissions configured
- [x] CORS headers configured
- [x] Rate limiting (if needed)

---

## 📞 Support Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| Vercel Dashboard | https://vercel.com/satkis-projects/receptai | Deployments, logs |
| MongoDB Atlas | https://cloud.mongodb.com | Database management |
| AWS S3 Console | https://s3.console.aws.amazon.com | Image storage |
| GitHub Repo | https://github.com/satkis/receptai | Source code |
| Domain Registrar | iv.lt | Domain management |

---

## ✅ Verification Checklist

After any deployment or change:
- [ ] Website loads at https://ragaujam.lt
- [ ] Website loads at https://www.ragaujam.lt
- [ ] No redirect loops (ERR_TOO_MANY_REDIRECTS)
- [ ] Recipes display correctly
- [ ] Images load from S3
- [ ] Database connected
- [ ] Sitemap accessible at /sitemap.xml
- [ ] SEO meta tags present
- [ ] No console errors
- [ ] Performance acceptable (<500ms)

---

## 📅 Documentation Maintenance

| Document | Last Updated | Next Review |
|----------|--------------|-------------|
| PRODUCTION_SUMMARY | 2025-11-17 | When deploying |
| PRODUCTION_SNAPSHOT | 2025-11-17 | When deploying |
| ARCHITECTURE_DETAILS | 2025-11-17 | When changing architecture |
| CRITICAL_ISSUES | 2025-11-17 | When new issues found |
| RECOVERY_GUIDE | 2025-11-17 | When procedures change |

---

## 🎯 Key Takeaways

1. **Website is LIVE**: https://ragaujam.lt ✅
2. **All systems operational**: Database, images, SEO ✅
3. **Redirect loops FIXED**: No more ERR_TOO_MANY_REDIRECTS ✅
4. **Stable version tagged**: v1.0.0-stable-2025-11-17 ✅
5. **Documentation complete**: All procedures documented ✅

---

## 🚨 Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://www.mongodb.com/support
- **AWS Support**: https://aws.amazon.com/support
- **GitHub Issues**: https://github.com/satkis/receptai/issues

---

**Status**: 🟢 **PRODUCTION LIVE AND STABLE**

**Current Version**: v1.0.0-stable-2025-11-17  
**Deployment**: receptai-17vvtjv26-satkis-projects.vercel.app  
**Website**: https://ragaujam.lt  
**Last Updated**: November 17, 2025

---

*For any questions or issues, refer to the appropriate documentation file above.*

