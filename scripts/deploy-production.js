#!/usr/bin/env node

// 🚀 Safe Production Deployment Script (Node.js version for Windows)

const { execSync } = require('child_process');
const readline = require('readline');

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

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🚀 Starting production deployment...');

  // Check if we're on staging branch
  const currentBranch = getCurrentBranch();
  if (currentBranch !== 'staging') {
    console.error('❌ Error: Must be on \'staging\' branch to deploy to production');
    console.error(`Current branch: ${currentBranch}`);
    console.error('💡 Run npm run deploy:staging first');
    process.exit(1);
  }

  // Confirmation prompt
  console.log('⚠️  You are about to deploy to PRODUCTION');
  console.log('🌐 This will update: https://ragaujam.lt');
  console.log('');
  
  const answer = await askQuestion('Are you sure you want to continue? (y/N): ');
  if (!answer.toLowerCase().startsWith('y')) {
    console.log('❌ Production deployment cancelled');
    process.exit(1);
  }

  // Check for uncommitted changes
  if (hasUncommittedChanges()) {
    console.error('❌ Error: You have uncommitted changes. Please commit them first.');
    runCommand('git status --short');
    process.exit(1);
  }

  // Pull latest staging
  console.log('📥 Pulling latest staging branch...');
  runCommand('git pull origin staging');

  // Switch to main branch
  console.log('🔄 Switching to main branch...');
  runCommand('git checkout main');

  // Pull latest main
  runCommand('git pull origin main');

  // Merge staging into main
  console.log('🔀 Merging staging into main...');
  runCommand('git merge staging --no-ff -m "chore: merge staging for production deployment"');

  // Create release tag
  console.log('🏷️  Creating release tag...');
  const currentDate = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/(\d{8})(\d{4})/, '$1-$2');
  const tagName = `v${currentDate}`;
  runCommand(`git tag -a "${tagName}" -m "Production release: ${tagName}"`);

  // Push main branch and tags
  console.log('📤 Pushing main branch and tags...');
  runCommand('git push origin main');
  runCommand(`git push origin "${tagName}"`);

  // Deploy to Vercel production
  console.log('🚀 Deploying to Vercel production...');
  runCommand('vercel --prod --yes');

  console.log('✅ Production deployment complete!');
  console.log('🌐 Production URL: https://ragaujam.lt');
  console.log(`🏷️  Release tag: ${tagName}`);
  console.log('');
  console.log('📋 Post-deployment checklist:');
  console.log('1. ✅ Verify website loads correctly');
  console.log('2. ✅ Test key functionality (recipe pages, search, categories)');
  console.log('3. ✅ Check Core Web Vitals in PageSpeed Insights');
  console.log('4. ✅ Monitor Vercel Analytics for any errors');
  console.log('');
  console.log('🚨 If issues found, run: npm run rollback');

  // Switch back to develop for continued development
  runCommand('git checkout develop');
}

main().catch(console.error);
