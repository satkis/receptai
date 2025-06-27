#!/bin/bash

# 🚀 Safe Staging Deployment Script
# Usage: ./scripts/deploy-staging.sh

set -e  # Exit on any error

echo "🚀 Starting staging deployment..."

# Check if we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "❌ Error: Must be on 'develop' branch to deploy to staging"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Pull latest develop
echo "📥 Pulling latest develop branch..."
git pull origin develop

# Switch to staging branch
echo "🔄 Switching to staging branch..."
git checkout staging

# Pull latest staging
git pull origin staging

# Merge develop into staging
echo "🔀 Merging develop into staging..."
git merge develop --no-ff -m "chore: merge develop for staging deployment"

# Push staging branch
echo "📤 Pushing staging branch..."
git push origin staging

# Deploy to Vercel staging
echo "🚀 Deploying to Vercel staging environment..."
vercel --target preview --yes

echo "✅ Staging deployment complete!"
echo "🌐 Staging URL: https://staging-ragaujam.vercel.app"
echo ""
echo "📋 Next steps:"
echo "1. Test the staging environment thoroughly"
echo "2. If everything works, run: ./scripts/deploy-production.sh"
echo "3. If issues found, fix on develop branch and redeploy staging"

# Switch back to develop
git checkout develop
