#!/usr/bin/env node

// AWS S3 Bucket Setup Script
// Creates and configures S3 buckets for different environments

require('dotenv').config({ path: '.env.local' });

const S3_CONFIGURATIONS = {
  development: {
    bucketName: 'ragaujam-dev-images',
    region: 'eu-north-1',
    description: 'Development images bucket',
    publicRead: true,
    cors: true,
    lifecycle: false
  },
  test: {
    bucketName: 'ragaujam-test-images',
    region: 'eu-north-1',
    description: 'Test/staging images bucket',
    publicRead: true,
    cors: true,
    lifecycle: true
  },
  production: {
    bucketName: 'ragaujam-images',
    region: 'eu-north-1',
    description: 'Production images bucket',
    publicRead: true,
    cors: true,
    lifecycle: true,
    cdn: true
  }
};

function showHelp() {
  console.log('☁️ AWS S3 Bucket Setup Tool');
  console.log('============================');
  console.log('');
  console.log('This script helps you set up S3 buckets for different environments.');
  console.log('Note: You need AWS CLI configured or AWS credentials set up.');
  console.log('');
  console.log('Usage: node scripts/setup-s3-buckets.js [command] [environment]');
  console.log('');
  console.log('Commands:');
  console.log('  plan <env>     - Show what will be created');
  console.log('  create <env>   - Create S3 bucket for environment');
  console.log('  configure <env> - Configure existing bucket');
  console.log('  list           - List all bucket configurations');
  console.log('  test <env>     - Test bucket access');
  console.log('  help           - Show this help message');
  console.log('');
  console.log('Environments:');
  console.log('  development    - Local development bucket');
  console.log('  test          - Test/staging bucket');
  console.log('  production    - Production bucket');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/setup-s3-buckets.js plan production');
  console.log('  node scripts/setup-s3-buckets.js create development');
  console.log('  node scripts/setup-s3-buckets.js test production');
}

function showBucketPlan(env) {
  const config = S3_CONFIGURATIONS[env];
  if (!config) {
    console.error(`❌ Unknown environment: ${env}`);
    return;
  }

  console.log(`📋 S3 Bucket Plan for ${env.toUpperCase()}:`);
  console.log('='.repeat(30 + env.length));
  console.log('');
  console.log(`🪣 Bucket Name: ${config.bucketName}`);
  console.log(`🌍 Region: ${config.region}`);
  console.log(`📝 Description: ${config.description}`);
  console.log('');
  console.log('📋 Configuration:');
  console.log(`   Public Read Access: ${config.publicRead ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   CORS Configuration: ${config.cors ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   Lifecycle Rules: ${config.lifecycle ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   CDN Integration: ${config.cdn ? '✅ Enabled' : '❌ Disabled'}`);
  console.log('');
  
  if (config.cors) {
    console.log('🔗 CORS Configuration:');
    console.log('   Allowed Origins: https://ragaujam.lt, http://localhost:3000');
    console.log('   Allowed Methods: GET, PUT, POST, DELETE');
    console.log('   Allowed Headers: Content-Type, Authorization');
    console.log('   Max Age: 3600 seconds');
    console.log('');
  }

  if (config.lifecycle) {
    console.log('♻️ Lifecycle Rules:');
    console.log('   Delete incomplete multipart uploads after 7 days');
    console.log('   Transition to IA storage after 30 days');
    console.log('   Transition to Glacier after 90 days');
    console.log('');
  }

  console.log('🔧 Required AWS CLI Commands:');
  console.log('==============================');
  console.log('');
  
  // Create bucket command
  console.log('1. Create bucket:');
  console.log(`   aws s3 mb s3://${config.bucketName} --region ${config.region}`);
  console.log('');

  // Public access policy
  if (config.publicRead) {
    console.log('2. Set public read policy:');
    console.log(`   aws s3api put-bucket-policy --bucket ${config.bucketName} --policy file://bucket-policy.json`);
    console.log('');
  }

  // CORS configuration
  if (config.cors) {
    console.log('3. Configure CORS:');
    console.log(`   aws s3api put-bucket-cors --bucket ${config.bucketName} --cors-configuration file://cors-config.json`);
    console.log('');
  }

  // Lifecycle configuration
  if (config.lifecycle) {
    console.log('4. Configure lifecycle:');
    console.log(`   aws s3api put-bucket-lifecycle-configuration --bucket ${config.bucketName} --lifecycle-configuration file://lifecycle-config.json`);
    console.log('');
  }

  console.log('📄 Configuration Files Needed:');
  console.log('===============================');
  console.log('');
  console.log('Create these files in your project root:');
  console.log('');
  
  if (config.publicRead) {
    console.log('📄 bucket-policy.json:');
    console.log(JSON.stringify({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": `arn:aws:s3:::${config.bucketName}/*`
        }
      ]
    }, null, 2));
    console.log('');
  }

  if (config.cors) {
    console.log('📄 cors-config.json:');
    console.log(JSON.stringify({
      "CORSRules": [
        {
          "AllowedOrigins": ["https://ragaujam.lt", "https://www.ragaujam.lt", "http://localhost:3000"],
          "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
          "AllowedHeaders": ["Content-Type", "Authorization", "x-amz-date", "x-amz-content-sha256"],
          "MaxAgeSeconds": 3600
        }
      ]
    }, null, 2));
    console.log('');
  }

  if (config.lifecycle) {
    console.log('📄 lifecycle-config.json:');
    console.log(JSON.stringify({
      "Rules": [
        {
          "ID": "DeleteIncompleteMultipartUploads",
          "Status": "Enabled",
          "AbortIncompleteMultipartUpload": {
            "DaysAfterInitiation": 7
          }
        },
        {
          "ID": "TransitionToIA",
          "Status": "Enabled",
          "Transitions": [
            {
              "Days": 30,
              "StorageClass": "STANDARD_IA"
            },
            {
              "Days": 90,
              "StorageClass": "GLACIER"
            }
          ]
        }
      ]
    }, null, 2));
    console.log('');
  }
}

function listBucketConfigurations() {
  console.log('☁️ S3 Bucket Configurations:');
  console.log('============================');
  console.log('');

  Object.entries(S3_CONFIGURATIONS).forEach(([env, config]) => {
    console.log(`🔧 ${env.toUpperCase()}:`);
    console.log(`   Bucket: ${config.bucketName}`);
    console.log(`   Region: ${config.region}`);
    console.log(`   URL: https://${config.bucketName}.s3.${config.region}.amazonaws.com/`);
    console.log(`   Description: ${config.description}`);
    console.log('');
  });

  console.log('📋 Environment Variables:');
  console.log('=========================');
  console.log('');
  console.log('Add these to your environment files:');
  console.log('');

  Object.entries(S3_CONFIGURATIONS).forEach(([env, config]) => {
    console.log(`# ${env.toUpperCase()} Environment`);
    console.log(`AWS_S3_BUCKET=${config.bucketName}`);
    console.log(`AWS_REGION=${config.region}`);
    console.log('');
  });
}

function testBucketAccess(env) {
  const config = S3_CONFIGURATIONS[env];
  if (!config) {
    console.error(`❌ Unknown environment: ${env}`);
    return;
  }

  console.log(`🧪 Testing S3 Bucket Access for ${env.toUpperCase()}:`);
  console.log('==================================================');
  console.log('');
  console.log(`🪣 Bucket: ${config.bucketName}`);
  console.log(`🌍 Region: ${config.region}`);
  console.log('');
  
  console.log('🔧 Test Commands:');
  console.log('=================');
  console.log('');
  
  console.log('1. Check if bucket exists:');
  console.log(`   aws s3 ls s3://${config.bucketName}`);
  console.log('');
  
  console.log('2. Test upload (create test file first):');
  console.log(`   echo "test" > test.txt`);
  console.log(`   aws s3 cp test.txt s3://${config.bucketName}/test.txt`);
  console.log('');
  
  console.log('3. Test public access:');
  console.log(`   curl -I https://${config.bucketName}.s3.${config.region}.amazonaws.com/test.txt`);
  console.log('');
  
  console.log('4. Clean up test file:');
  console.log(`   aws s3 rm s3://${config.bucketName}/test.txt`);
  console.log(`   rm test.txt`);
  console.log('');

  console.log('✅ Expected Results:');
  console.log('===================');
  console.log('');
  console.log('1. Bucket listing should show contents or empty result');
  console.log('2. Upload should return success message');
  console.log('3. Public access should return HTTP 200 OK');
  console.log('4. Cleanup should complete without errors');
  console.log('');

  console.log('❌ Common Issues:');
  console.log('=================');
  console.log('');
  console.log('• "NoSuchBucket" - Bucket doesn\'t exist, run create command');
  console.log('• "AccessDenied" - Check AWS credentials and permissions');
  console.log('• "403 Forbidden" - Check bucket policy for public access');
  console.log('• "CORS error" - Check CORS configuration');
}

function generateConfigFiles(env) {
  const config = S3_CONFIGURATIONS[env];
  if (!config) {
    console.error(`❌ Unknown environment: ${env}`);
    return;
  }

  console.log(`📄 Generating configuration files for ${env}...`);
  console.log('');

  // This would generate actual files in a real implementation
  console.log('ℹ️ This is a planning tool. To actually create the files, run:');
  console.log('');
  console.log(`node scripts/setup-s3-buckets.js plan ${env} > s3-setup-${env}.txt`);
  console.log('');
  console.log('Then copy the JSON configurations to separate files as shown in the plan.');
}

// Main execution
const [,, command, environment] = process.argv;

switch (command) {
  case 'plan':
    if (!environment) {
      console.error('❌ Environment required for plan command');
      console.log('Usage: node scripts/setup-s3-buckets.js plan <environment>');
      break;
    }
    showBucketPlan(environment);
    break;
    
  case 'create':
    if (!environment) {
      console.error('❌ Environment required for create command');
      console.log('Usage: node scripts/setup-s3-buckets.js create <environment>');
      break;
    }
    console.log('ℹ️ This script provides AWS CLI commands to run manually.');
    console.log('For automated creation, you would need AWS SDK integration.');
    console.log('');
    showBucketPlan(environment);
    break;
    
  case 'configure':
    if (!environment) {
      console.error('❌ Environment required for configure command');
      break;
    }
    generateConfigFiles(environment);
    break;
    
  case 'list':
    listBucketConfigurations();
    break;
    
  case 'test':
    if (!environment) {
      console.error('❌ Environment required for test command');
      break;
    }
    testBucketAccess(environment);
    break;
    
  case 'help':
  default:
    showHelp();
}
