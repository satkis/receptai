#!/usr/bin/env node

// 🔧 Vercel Environment Variables Setup Script
// Sets up required environment variables for staging (preview) environment

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
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    return null;
  }
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

async function setVercelEnv(name, value, environment) {
  console.log(`📝 Setting ${name} for ${environment}...`);
  try {
    runCommand(`vercel env add ${name} ${environment}`, { input: value });
    console.log(`✅ ${name} set successfully`);
  } catch (error) {
    console.log(`⚠️  ${name} might already exist or there was an error`);
  }
}

async function main() {
  console.log('🔧 Vercel Environment Variables Setup');
  console.log('=====================================');
  console.log('This script will set up environment variables for your staging environment.');
  console.log('');

  // Check if vercel CLI is available
  try {
    runCommand('vercel --version', { silent: true });
  } catch (error) {
    console.error('❌ Vercel CLI not found. Please install it first:');
    console.error('npm i -g vercel');
    process.exit(1);
  }

  console.log('📋 Current environment variables:');
  runCommand('vercel env ls');
  console.log('');

  const proceed = await askQuestion('Do you want to set up staging environment variables? (y/N): ');
  if (!proceed.toLowerCase().startsWith('y')) {
    console.log('❌ Setup cancelled');
    process.exit(0);
  }

  console.log('');
  console.log('🔧 Setting up PREVIEW environment variables...');
  console.log('');

  // Core variables that are definitely needed
  const coreVariables = [
    {
      name: 'MONGODB_URI',
      description: 'MongoDB connection string',
      defaultValue: 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority'
    },
    {
      name: 'MONGODB_DB', 
      description: 'MongoDB database name',
      defaultValue: 'receptai'
    },
    {
      name: 'NEXT_PUBLIC_SITE_URL',
      description: 'Public site URL for staging',
      defaultValue: 'https://staging-ragaujam.vercel.app'
    },
    {
      name: 'SITE_URL',
      description: 'Site URL for staging',
      defaultValue: 'https://staging-ragaujam.vercel.app'
    },
    {
      name: 'SITE_NAME',
      description: 'Site name',
      defaultValue: 'Ragaujam.lt (Staging)'
    },
    {
      name: 'RATE_LIMIT_MAX',
      description: 'Rate limit maximum requests',
      defaultValue: '1000'
    },
    {
      name: 'RATE_LIMIT_WINDOW',
      description: 'Rate limit window in milliseconds',
      defaultValue: '3600000'
    },
    {
      name: 'AWS_REGION',
      description: 'AWS region',
      defaultValue: 'eu-north-1'
    },
    {
      name: 'AWS_S3_BUCKET',
      description: 'AWS S3 bucket name',
      defaultValue: 'receptu-images'
    }
  ];

  for (const variable of coreVariables) {
    console.log(`\n📝 Setting up ${variable.name}`);
    console.log(`Description: ${variable.description}`);
    
    const value = await askQuestion(`Enter value (default: ${variable.defaultValue}): `);
    const finalValue = value.trim() || variable.defaultValue;
    
    // Set the environment variable
    console.log(`Setting ${variable.name}=${finalValue.substring(0, 30)}...`);
    
    try {
      // Use echo to pipe the value to vercel env add
      runCommand(`echo "${finalValue}" | vercel env add ${variable.name} preview`);
      console.log(`✅ ${variable.name} set successfully`);
    } catch (error) {
      console.log(`⚠️  ${variable.name} might already exist`);
    }
  }

  console.log('');
  console.log('✅ STAGING ENVIRONMENT SETUP COMPLETE');
  console.log('======================================');
  console.log('📋 What was set up:');
  console.log('  🔧 Database connection for staging');
  console.log('  🌐 Staging site URLs');
  console.log('  🛡️  Security configurations');
  console.log('  ☁️  AWS S3 configuration');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. 🚀 Run: npm run deploy:staging');
  console.log('2. ✅ Test staging site: https://staging-ragaujam.vercel.app');
  console.log('3. 🚀 If good, run: npm run deploy:production');
  console.log('');
  console.log('🎯 Your staging environment is ready for safe deployments!');
}

main().catch(console.error);
