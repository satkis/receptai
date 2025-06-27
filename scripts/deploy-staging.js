#!/usr/bin/env node

// 🚀 Safe Staging Deployment Script (Node.js version for Windows)

const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options 
    });
  } catch (error) {
    if (!options.allowFailure) {
      console.error(`❌ Error running command: ${command}`);
      console.error(error.message);
      process.exit(1);
    }
    return null;
  }
}

function getCurrentBranch() {
  return runCommand('git branch --show-current', { silent: true }).trim();
}

function hasUncommittedChanges() {
  const status = runCommand('git status --porcelain', { silent: true });
  return status && status.trim().length > 0;
}

console.log('🚀 Starting staging deployment...');

// Check if we're on develop branch, switch if needed
const currentBranch = getCurrentBranch();
if (currentBranch !== 'develop') {
  console.log(`🔄 Currently on '${currentBranch}' branch, switching to 'develop'...`);
  runCommand('git checkout develop');
}

// Check for uncommitted changes
if (hasUncommittedChanges()) {
  console.error('❌ Error: You have uncommitted changes. Please commit or stash them first.');
  runCommand('git status --short');
  process.exit(1);
}

// Pull latest develop
console.log('📥 Pulling latest develop branch...');
runCommand('git pull origin develop');

// Switch to staging branch
console.log('🔄 Switching to staging branch...');
runCommand('git checkout staging');

// Pull latest staging
runCommand('git pull origin staging');

// Merge develop into staging
console.log('🔀 Merging develop into staging...');
runCommand('git merge develop --no-ff -m "chore: merge develop for staging deployment"');

// Push staging branch
console.log('📤 Pushing staging branch...');
runCommand('git push origin staging');

// Deploy to Vercel staging environment
console.log('🚀 Deploying to Vercel staging environment...');
const deployOutput = runCommand('vercel --yes', { silent: true });

// Extract deployment URL from output
const deploymentUrl = deployOutput.match(/https:\/\/[^\s]+\.vercel\.app/)?.[0];

if (deploymentUrl) {
  console.log(`📦 Deployment created: ${deploymentUrl}`);

  // Set custom alias for staging
  console.log('🔗 Setting up custom staging alias...');
  try {
    runCommand(`vercel alias set ${deploymentUrl} staging-ragaujam.vercel.app`);
    console.log('✅ Custom alias set successfully!');
  } catch (error) {
    console.log('⚠️  Could not set custom alias, but deployment succeeded');
  }
}

console.log('✅ Staging deployment complete!');
console.log('🌐 Staging URL: https://staging-ragaujam.vercel.app');
console.log('');
console.log('📋 Next steps:');
console.log('1. Test the staging environment thoroughly');
console.log('2. If everything works, run: npm run deploy:production');
console.log('3. If issues found, fix on develop branch and redeploy staging');

// Switch back to develop
runCommand('git checkout develop');
