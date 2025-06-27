#!/bin/bash

# 🌿 Git Branch Setup Script
# Sets up proper branch structure for safe deployments

set -e  # Exit on any error

echo "🌿 Setting up Git branch structure..."
echo "===================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Ensure we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Switching to main branch..."
    git checkout main
fi

# Pull latest main
echo "📥 Pulling latest main branch..."
git pull origin main

# Create develop branch if it doesn't exist
if git show-ref --verify --quiet refs/heads/develop; then
    echo "✅ develop branch already exists"
else
    echo "🌿 Creating develop branch..."
    git checkout -b develop
    git push origin develop
    echo "✅ develop branch created and pushed"
fi

# Create staging branch if it doesn't exist
if git show-ref --verify --quiet refs/heads/staging; then
    echo "✅ staging branch already exists"
else
    echo "🌿 Creating staging branch..."
    git checkout -b staging
    git push origin staging
    echo "✅ staging branch created and pushed"
fi

# Switch back to develop for development
git checkout develop

echo ""
echo "✅ BRANCH SETUP COMPLETE"
echo "========================"
echo "📋 Branch structure:"
echo "  🌿 main     - Production-ready code"
echo "  🌿 staging  - Pre-production testing"
echo "  🌿 develop  - Integration branch (current)"
echo ""
echo "📋 Workflow:"
echo "1. 🔨 Develop features on: feature/feature-name branches"
echo "2. 🔀 Merge features to: develop"
echo "3. 🚀 Deploy to staging: ./scripts/deploy-staging.sh"
echo "4. ✅ Test staging thoroughly"
echo "5. 🚀 Deploy to production: ./scripts/deploy-production.sh"
echo ""
echo "🎯 You're now on 'develop' branch - ready for development!"
