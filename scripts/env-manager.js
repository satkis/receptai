#!/usr/bin/env node

// Environment Manager Script
// Manages different environment configurations for development, test, and production

const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = {
  development: '.env.development',
  test: '.env.test',
  production: '.env.production',
  local: '.env.local'
};

const ENV_TARGET = '.env.local';

function showHelp() {
  console.log('🔧 Environment Manager');
  console.log('======================');
  console.log('');
  console.log('Usage: node scripts/env-manager.js [command] [environment]');
  console.log('');
  console.log('Commands:');
  console.log('  switch <env>    - Switch to specified environment');
  console.log('  show [env]      - Show environment configuration');
  console.log('  validate [env]  - Validate environment configuration');
  console.log('  backup          - Backup current .env.local');
  console.log('  restore         - Restore .env.local from backup');
  console.log('  list            - List available environments');
  console.log('  help            - Show this help message');
  console.log('');
  console.log('Environments:');
  console.log('  development     - Local development with relaxed security');
  console.log('  test           - Staging environment for testing');
  console.log('  production     - Live production environment');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/env-manager.js switch development');
  console.log('  node scripts/env-manager.js show production');
  console.log('  node scripts/env-manager.js validate test');
}

function switchEnvironment(env) {
  if (!ENVIRONMENTS[env]) {
    console.error(`❌ Unknown environment: ${env}`);
    console.log('Available environments:', Object.keys(ENVIRONMENTS).filter(e => e !== 'local').join(', '));
    return;
  }

  const sourceFile = ENVIRONMENTS[env];
  const targetFile = ENV_TARGET;

  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Environment file not found: ${sourceFile}`);
    return;
  }

  try {
    // Backup current .env.local if it exists
    if (fs.existsSync(targetFile)) {
      const backupFile = `${targetFile}.backup.${Date.now()}`;
      fs.copyFileSync(targetFile, backupFile);
      console.log(`📦 Backed up current environment to: ${backupFile}`);
    }

    // Copy environment file
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✅ Switched to ${env} environment`);
    console.log(`📄 Configuration loaded from: ${sourceFile}`);
    
    // Show key configuration
    showEnvironmentSummary(env);
    
  } catch (error) {
    console.error(`❌ Failed to switch environment: ${error.message}`);
  }
}

function showEnvironment(env = null) {
  if (!env) {
    // Show current environment
    if (!fs.existsSync(ENV_TARGET)) {
      console.log('❌ No .env.local file found');
      return;
    }
    
    console.log('📄 Current Environment Configuration (.env.local):');
    console.log('================================================');
    
    const content = fs.readFileSync(ENV_TARGET, 'utf8');
    console.log(content);
    return;
  }

  if (!ENVIRONMENTS[env]) {
    console.error(`❌ Unknown environment: ${env}`);
    return;
  }

  const envFile = ENVIRONMENTS[env];
  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file not found: ${envFile}`);
    return;
  }

  console.log(`📄 ${env.toUpperCase()} Environment Configuration (${envFile}):`);
  console.log('='.repeat(50 + env.length));
  
  const content = fs.readFileSync(envFile, 'utf8');
  console.log(content);
}

function showEnvironmentSummary(env) {
  const envFile = ENVIRONMENTS[env];
  if (!fs.existsSync(envFile)) return;

  const content = fs.readFileSync(envFile, 'utf8');
  const lines = content.split('\n');
  
  console.log('\n📋 Key Configuration:');
  console.log('=====================');
  
  const keyVars = [
    'NODE_ENV',
    'SITE_URL',
    'MONGODB_URI',
    'AWS_S3_BUCKET',
    'RATE_LIMIT_MAX',
    'DEBUG'
  ];

  keyVars.forEach(varName => {
    const line = lines.find(l => l.startsWith(`${varName}=`));
    if (line) {
      let value = line.split('=')[1];
      // Hide sensitive values
      if (varName === 'MONGODB_URI' && value.includes('://')) {
        value = value.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      }
      console.log(`   ${varName}: ${value}`);
    }
  });
}

function validateEnvironment(env = 'current') {
  let envFile;
  
  if (env === 'current') {
    envFile = ENV_TARGET;
    if (!fs.existsSync(envFile)) {
      console.error('❌ No .env.local file found to validate');
      return;
    }
  } else {
    if (!ENVIRONMENTS[env]) {
      console.error(`❌ Unknown environment: ${env}`);
      return;
    }
    envFile = ENVIRONMENTS[env];
  }

  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file not found: ${envFile}`);
    return;
  }

  console.log(`🔍 Validating ${env} environment...`);
  
  const content = fs.readFileSync(envFile, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const requiredVars = [
    'NODE_ENV',
    'SITE_URL',
    'MONGODB_URI',
    'RATE_LIMIT_MAX',
    'RATE_LIMIT_WINDOW'
  ];

  const missingVars = [];
  const invalidVars = [];
  
  requiredVars.forEach(varName => {
    const line = lines.find(l => l.startsWith(`${varName}=`));
    if (!line) {
      missingVars.push(varName);
    } else {
      const value = line.split('=')[1];
      if (!value || value.trim() === '') {
        invalidVars.push(varName);
      }
    }
  });

  if (missingVars.length === 0 && invalidVars.length === 0) {
    console.log('✅ Environment validation passed');
    console.log(`📊 Found ${lines.length} environment variables`);
  } else {
    console.log('❌ Environment validation failed');
    if (missingVars.length > 0) {
      console.log('Missing variables:', missingVars.join(', '));
    }
    if (invalidVars.length > 0) {
      console.log('Empty variables:', invalidVars.join(', '));
    }
  }
}

function backupEnvironment() {
  if (!fs.existsSync(ENV_TARGET)) {
    console.log('❌ No .env.local file to backup');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `.env.local.backup.${timestamp}`;
  
  try {
    fs.copyFileSync(ENV_TARGET, backupFile);
    console.log(`✅ Environment backed up to: ${backupFile}`);
  } catch (error) {
    console.error(`❌ Backup failed: ${error.message}`);
  }
}

function restoreEnvironment() {
  const backupFiles = fs.readdirSync('.')
    .filter(file => file.startsWith('.env.local.backup.'))
    .sort()
    .reverse();

  if (backupFiles.length === 0) {
    console.log('❌ No backup files found');
    return;
  }

  const latestBackup = backupFiles[0];
  console.log(`🔄 Restoring from latest backup: ${latestBackup}`);
  
  try {
    fs.copyFileSync(latestBackup, ENV_TARGET);
    console.log('✅ Environment restored successfully');
  } catch (error) {
    console.error(`❌ Restore failed: ${error.message}`);
  }
}

function listEnvironments() {
  console.log('📋 Available Environments:');
  console.log('==========================');
  
  Object.entries(ENVIRONMENTS).forEach(([env, file]) => {
    if (env === 'local') return;
    
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`   ${status} ${env.padEnd(12)} - ${file}`);
  });
  
  console.log('\n📄 Current Environment:');
  const currentExists = fs.existsSync(ENV_TARGET);
  const currentStatus = currentExists ? '✅' : '❌';
  console.log(`   ${currentStatus} current      - ${ENV_TARGET}`);
}

// Main execution
const [,, command, environment] = process.argv;

switch (command) {
  case 'switch':
    if (!environment) {
      console.error('❌ Environment required for switch command');
      console.log('Usage: node scripts/env-manager.js switch <environment>');
      break;
    }
    switchEnvironment(environment);
    break;
    
  case 'show':
    showEnvironment(environment);
    break;
    
  case 'validate':
    validateEnvironment(environment);
    break;
    
  case 'backup':
    backupEnvironment();
    break;
    
  case 'restore':
    restoreEnvironment();
    break;
    
  case 'list':
    listEnvironments();
    break;
    
  case 'help':
  default:
    showHelp();
}
