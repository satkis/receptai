#!/bin/bash

# 🚀 Safe Production Deployment Script
# Usage: ./scripts/deploy-production.sh

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Check if we're on staging branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "❌ Error: Must be on 'staging' branch to deploy to production"
    echo "Current branch: $CURRENT_BRANCH"
    echo "💡 Run ./scripts/deploy-staging.sh first"
    exit 1
fi

# Confirmation prompt
echo "⚠️  You are about to deploy to PRODUCTION"
echo "🌐 This will update: https://ragaujam.lt"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Production deployment cancelled"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes. Please commit them first."
    git status --short
    exit 1
fi

# Pull latest staging
echo "📥 Pulling latest staging branch..."
git pull origin staging

# Switch to main branch
echo "🔄 Switching to main branch..."
git checkout main

# Pull latest main
git pull origin main

# Merge staging into main
echo "🔀 Merging staging into main..."
git merge staging --no-ff -m "chore: merge staging for production deployment"

# Create release tag
echo "🏷️  Creating release tag..."
CURRENT_DATE=$(date +"%Y%m%d-%H%M")
TAG_NAME="v${CURRENT_DATE}"
git tag -a "$TAG_NAME" -m "Production release: $TAG_NAME"

# Push main branch and tags
echo "📤 Pushing main branch and tags..."
git push origin main
git push origin "$TAG_NAME"

# Deploy to Vercel production
echo "🚀 Deploying to Vercel production..."
vercel --prod --yes

echo "✅ Production deployment complete!"
echo "🌐 Production URL: https://ragaujam.lt"
echo "🏷️  Release tag: $TAG_NAME"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. ✅ Verify website loads correctly"
echo "2. ✅ Test key functionality (recipe pages, search, categories)"
echo "3. ✅ Check Core Web Vitals in PageSpeed Insights"
echo "4. ✅ Monitor Vercel Analytics for any errors"
echo ""
echo "🚨 If issues found, run: ./scripts/rollback-production.sh"

# Switch back to develop for continued development
git checkout develop
