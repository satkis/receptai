#!/bin/bash

# 🚨 Emergency Production Rollback Script
# Usage: ./scripts/rollback-production.sh

set -e  # Exit on any error

echo "🚨 EMERGENCY PRODUCTION ROLLBACK"
echo "================================"

# Confirmation prompt
echo "⚠️  This will rollback the production deployment"
echo "🌐 Website: https://ragaujam.lt"
echo ""
read -p "Are you sure you want to rollback? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

echo "🔍 Finding previous deployments..."

# List recent Vercel deployments
echo "📋 Recent deployments:"
vercel ls --limit 10

echo ""
echo "🔄 Choose rollback method:"
echo "1. Automatic rollback to previous deployment"
echo "2. Manual rollback (you choose deployment)"
echo "3. Git-based rollback (revert commits)"
echo ""
read -p "Enter choice (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        echo "🔄 Rolling back to previous deployment..."
        # Get the second most recent deployment (first is current)
        PREV_DEPLOYMENT=$(vercel ls --limit 2 | tail -n 1 | awk '{print $2}')
        if [ -n "$PREV_DEPLOYMENT" ]; then
            vercel rollback "$PREV_DEPLOYMENT" --yes
            echo "✅ Rollback complete to: $PREV_DEPLOYMENT"
        else
            echo "❌ Could not find previous deployment"
            exit 1
        fi
        ;;
    2)
        echo "📋 Available deployments:"
        vercel ls --limit 10
        echo ""
        read -p "Enter deployment URL to rollback to: " DEPLOYMENT_URL
        vercel rollback "$DEPLOYMENT_URL" --yes
        echo "✅ Rollback complete to: $DEPLOYMENT_URL"
        ;;
    3)
        echo "🔄 Git-based rollback..."
        git checkout main
        
        echo "📋 Recent commits:"
        git log --oneline -10
        echo ""
        read -p "Enter commit hash to rollback to: " COMMIT_HASH
        
        # Create emergency rollback branch
        ROLLBACK_BRANCH="hotfix/emergency-rollback-$(date +%Y%m%d-%H%M)"
        git checkout -b "$ROLLBACK_BRANCH"
        git reset --hard "$COMMIT_HASH"
        git push origin "$ROLLBACK_BRANCH"
        
        # Merge to main and deploy
        git checkout main
        git merge "$ROLLBACK_BRANCH" --no-ff -m "hotfix: emergency rollback to $COMMIT_HASH"
        git push origin main
        
        # Deploy
        vercel --prod --yes
        
        echo "✅ Git rollback complete to commit: $COMMIT_HASH"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ ROLLBACK COMPLETE"
echo "==================="
echo "🌐 Check website: https://ragaujam.lt"
echo "📊 Monitor: https://vercel.com/dashboard"
echo ""
echo "📋 Post-rollback actions:"
echo "1. ✅ Verify website is working"
echo "2. ✅ Check error logs in Vercel"
echo "3. ✅ Fix issues on develop branch"
echo "4. ✅ Test thoroughly on staging before next deployment"
