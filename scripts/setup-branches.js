#!/usr/bin/env node

// 🌿 Git Branch Setup Script (Node.js version for Windows)
// Sets up proper branch structure for safe deployments

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
    if (options.allowFailure) {
      return null;
    }
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function branchExists(branchName) {
  try {
    const branches = runCommand('git branch', { silent: true });
    return branches.includes(branchName);
  } catch {
    return false;
  }
}

function getCurrentBranch() {
  return runCommand('git branch --show-current', { silent: true }).trim();
}

function hasUncommittedChanges() {
  const status = runCommand('git status --porcelain', { silent: true });
  return status && status.trim().length > 0;
}

console.log('🌿 Setting up Git branch structure...');
console.log('====================================');

// Check if we're in a git repository
if (!fs.existsSync('.git')) {
  console.error('❌ Error: Not in a Git repository');
  process.exit(1);
}

// Get current branch
const currentBranch = getCurrentBranch();
console.log(`📍 Current branch: ${currentBranch}`);

// Check for uncommitted changes
if (hasUncommittedChanges()) {
  console.error('❌ Error: You have uncommitted changes. Please commit or stash them first.');
  runCommand('git status --short');
  process.exit(1);
}

// Ensure we're on main branch
if (currentBranch !== 'main') {
  console.log('🔄 Switching to main branch...');
  runCommand('git checkout main');
}

// Pull latest main
console.log('📥 Pulling latest main branch...');
runCommand('git pull origin main');

// Create develop branch if it doesn't exist
console.log('🔍 Checking if develop branch exists...');
if (branchExists('develop')) {
  console.log('✅ develop branch already exists');
} else {
  console.log('🌿 Creating develop branch...');
  try {
    runCommand('git checkout -b develop');
    runCommand('git push origin develop');
    console.log('✅ develop branch created and pushed');
  } catch (error) {
    console.log('⚠️  Error creating develop branch, but continuing...');
  }
}

// Create staging branch if it doesn't exist
console.log('🔍 Checking if staging branch exists...');
if (branchExists('staging')) {
  console.log('✅ staging branch already exists');
} else {
  console.log('🌿 Creating staging branch...');
  try {
    runCommand('git checkout -b staging');
    runCommand('git push origin staging');
    console.log('✅ staging branch created and pushed');
  } catch (error) {
    console.log('⚠️  Error creating staging branch, but continuing...');
  }
}

// Switch back to develop for development
runCommand('git checkout develop');

console.log('');
console.log('✅ BRANCH SETUP COMPLETE');
console.log('========================');
console.log('📋 Branch structure:');
console.log('  🌿 main     - Production-ready code');
console.log('  🌿 staging  - Pre-production testing');
console.log('  🌿 develop  - Integration branch (current)');
console.log('');
console.log('📋 Workflow:');
console.log('1. 🔨 Develop features: npm run feature:new feature-name');
console.log('2. 🔀 Merge features: npm run feature:merge feature-name');
console.log('3. 🚀 Deploy to staging: npm run deploy:staging');
console.log('4. ✅ Test staging thoroughly');
console.log('5. 🚀 Deploy to production: npm run deploy:production');
console.log('');
console.log('🎯 You\'re now on \'develop\' branch - ready for development!');
