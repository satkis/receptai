# 🚀 Production-Safe Deployment Guide

## 🎯 **Overview**
This guide replaces your current `git push → vercel --prod` workflow with a production-safe deployment strategy that includes staging, testing, and easy rollbacks.

## 📋 **One-Time Setup**

### **1. Initial Branch Setup**
```bash
# Run once to set up proper branch structure
chmod +x scripts/*.sh
./scripts/setup-branches.sh
```

This creates:
- `main` - Production-ready code
- `staging` - Pre-production testing
- `develop` - Integration branch

### **2. Vercel Environment Setup**
```bash
# Set up staging environment variables
vercel env add MONGODB_URI preview
vercel env add NEXT_PUBLIC_SITE_URL preview

# Verify production environment variables
vercel env ls
```

## 🔨 **Daily Development Workflow**

### **Starting a New Feature**
```bash
# Create new feature branch
./scripts/new-feature.sh recipe-rating-system

# This automatically:
# 1. Switches to develop branch
# 2. Pulls latest changes
# 3. Creates feature/recipe-rating-system branch
# 4. Pushes to remote
```

### **Working on Feature**
```bash
# Make your changes
git add .
git commit -m "feat: add star rating component"
git push origin feature/recipe-rating-system

# Continue development...
git add .
git commit -m "feat: integrate rating with database"
git push origin feature/recipe-rating-system
```

### **Completing Feature**
```bash
# Merge feature back to develop
./scripts/merge-feature.sh recipe-rating-system

# This automatically:
# 1. Merges to develop branch
# 2. Pushes updated develop
# 3. Deletes feature branch (local and remote)
```

## 🚀 **Deployment Workflow**

### **Step 1: Deploy to Staging**
```bash
# Deploy to staging for testing
./scripts/deploy-staging.sh

# This automatically:
# 1. Merges develop → staging
# 2. Deploys to Vercel staging
# 3. Provides staging URL for testing
```

**Staging URL**: `https://staging-ragaujam.vercel.app`

### **Step 2: Test Staging Environment**
✅ **Test Checklist:**
- [ ] Homepage loads correctly
- [ ] Recipe pages work (test ISR)
- [ ] Category pages load fast
- [ ] Search functionality works
- [ ] Mobile performance is good
- [ ] No console errors

### **Step 3: Deploy to Production**
```bash
# Only after staging tests pass
./scripts/deploy-production.sh

# This automatically:
# 1. Merges staging → main
# 2. Creates release tag (v20241227-1430)
# 3. Deploys to production
# 4. Provides post-deployment checklist
```

## 🚨 **Emergency Procedures**

### **If Production Breaks**
```bash
# Emergency rollback
./scripts/rollback-production.sh

# Choose rollback method:
# 1. Automatic (previous deployment)
# 2. Manual (choose specific deployment)
# 3. Git-based (revert to specific commit)
```

### **Hotfix for Critical Issues**
```bash
# Create emergency fix
git checkout main
git checkout -b hotfix/critical-fix

# Make minimal fix
git add .
git commit -m "hotfix: fix critical production issue"

# Deploy immediately
git checkout main
git merge hotfix/critical-fix
git push origin main
vercel --prod
```

## 📊 **Comparison: Old vs New Workflow**

### **❌ Old Workflow (Risky)**
```bash
git add .
git commit -m "changes"
git push origin main
vercel --prod
```
**Problems:**
- No testing before production
- No rollback mechanism
- Direct main branch deployment
- Risk of breaking live site

### **✅ New Workflow (Safe)**
```bash
# Development
./scripts/new-feature.sh my-feature
# ... develop ...
./scripts/merge-feature.sh my-feature

# Deployment
./scripts/deploy-staging.sh
# ... test staging ...
./scripts/deploy-production.sh
```
**Benefits:**
- Staging environment for testing
- Easy rollback mechanisms
- Protected production branch
- Release tagging for tracking

## 🛡️ **Safety Features**

### **Automatic Checks**
- ✅ Prevents deployment with uncommitted changes
- ✅ Requires confirmation for production deployment
- ✅ Creates release tags for tracking
- ✅ Provides rollback options

### **Branch Protection**
- ✅ `main` branch only updated via staging
- ✅ Feature branches isolated
- ✅ Develop branch for integration

### **Environment Separation**
- ✅ Staging: `https://staging-ragaujam.vercel.app`
- ✅ Production: `https://ragaujam.lt`
- ✅ Different environment variables

## 📋 **Quick Reference**

### **Common Commands**
```bash
# Start new feature
./scripts/new-feature.sh feature-name

# Finish feature
./scripts/merge-feature.sh feature-name

# Deploy to staging
./scripts/deploy-staging.sh

# Deploy to production
./scripts/deploy-production.sh

# Emergency rollback
./scripts/rollback-production.sh
```

### **Branch Overview**
- `develop` - Your daily work branch
- `staging` - Pre-production testing
- `main` - Production code only
- `feature/*` - Individual features

## 🎯 **Benefits for Your Website**

### **Safety**
- ✅ Never break production accidentally
- ✅ Test ISR changes before going live
- ✅ Easy rollback if issues found

### **Performance**
- ✅ Staging environment to test performance
- ✅ Verify ISR works correctly
- ✅ Test Lithuanian user experience

### **SEO**
- ✅ Ensure new recipes are indexed properly
- ✅ Test sitemap generation
- ✅ Verify structured data

**Ready to implement this safer deployment strategy? Your ISR changes will be much safer to deploy! 🛡️🚀**
