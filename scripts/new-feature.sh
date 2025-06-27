#!/bin/bash

# 🔨 New Feature Branch Script
# Usage: ./scripts/new-feature.sh feature-name

set -e  # Exit on any error

# Check if feature name is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide a feature name"
    echo "Usage: ./scripts/new-feature.sh feature-name"
    echo "Example: ./scripts/new-feature.sh recipe-rating-system"
    exit 1
fi

FEATURE_NAME=$1
BRANCH_NAME="feature/$FEATURE_NAME"

echo "🔨 Creating new feature branch: $BRANCH_NAME"
echo "============================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Switch to develop branch
echo "🔄 Switching to develop branch..."
git checkout develop

# Pull latest develop
echo "📥 Pulling latest develop branch..."
git pull origin develop

# Create feature branch
echo "🌿 Creating feature branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

# Push feature branch
echo "📤 Pushing feature branch to remote..."
git push origin "$BRANCH_NAME"

echo ""
echo "✅ FEATURE BRANCH CREATED"
echo "========================="
echo "🌿 Branch: $BRANCH_NAME"
echo "📍 You are now on the feature branch"
echo ""
echo "📋 Development workflow:"
echo "1. 🔨 Make your changes"
echo "2. 📝 Commit regularly: git add . && git commit -m 'feat: description'"
echo "3. 📤 Push changes: git push origin $BRANCH_NAME"
echo "4. 🔀 When done: ./scripts/merge-feature.sh $FEATURE_NAME"
echo ""
echo "🎯 Happy coding! 🚀"
