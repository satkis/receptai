#!/bin/bash

# 🔀 Merge Feature Branch Script
# Usage: ./scripts/merge-feature.sh feature-name

set -e  # Exit on any error

# Check if feature name is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide a feature name"
    echo "Usage: ./scripts/merge-feature.sh feature-name"
    echo "Example: ./scripts/merge-feature.sh recipe-rating-system"
    exit 1
fi

FEATURE_NAME=$1
BRANCH_NAME="feature/$FEATURE_NAME"

echo "🔀 Merging feature branch: $BRANCH_NAME"
echo "======================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Check if feature branch exists
if ! git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "❌ Error: Feature branch '$BRANCH_NAME' does not exist"
    echo "Available feature branches:"
    git branch | grep "feature/" || echo "No feature branches found"
    exit 1
fi

# Check if we're on the feature branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    echo "🔄 Switching to feature branch..."
    git checkout "$BRANCH_NAME"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes. Please commit them first."
    git status --short
    exit 1
fi

# Push latest feature changes
echo "📤 Pushing latest feature changes..."
git push origin "$BRANCH_NAME"

# Switch to develop branch
echo "🔄 Switching to develop branch..."
git checkout develop

# Pull latest develop
echo "📥 Pulling latest develop branch..."
git pull origin develop

# Merge feature branch
echo "🔀 Merging $BRANCH_NAME into develop..."
git merge "$BRANCH_NAME" --no-ff -m "feat: merge $FEATURE_NAME feature"

# Push updated develop
echo "📤 Pushing updated develop branch..."
git push origin develop

# Delete local feature branch
echo "🗑️  Deleting local feature branch..."
git branch -d "$BRANCH_NAME"

# Delete remote feature branch
echo "🗑️  Deleting remote feature branch..."
git push origin --delete "$BRANCH_NAME"

echo ""
echo "✅ FEATURE MERGE COMPLETE"
echo "========================="
echo "🔀 Feature '$FEATURE_NAME' merged into develop"
echo "🗑️  Feature branch deleted (local and remote)"
echo "📍 You are now on develop branch"
echo ""
echo "📋 Next steps:"
echo "1. 🚀 Deploy to staging: ./scripts/deploy-staging.sh"
echo "2. ✅ Test staging environment thoroughly"
echo "3. 🚀 Deploy to production: ./scripts/deploy-production.sh"
echo ""
echo "🎯 Ready for next feature or deployment! 🚀"
