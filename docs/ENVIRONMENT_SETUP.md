# 🔧 Environment Setup Guide

This guide covers setting up different environments (development, test, production) for the Ragaujam.lt recipe website.

## 🌍 Environment Overview

The project supports three distinct environments:

| Environment | Purpose | Database | S3 Bucket | Security |
|-------------|---------|----------|-----------|----------|
| **Development** | Local development | Local MongoDB | Dev bucket | Relaxed |
| **Test** | Staging/testing | Test Atlas | Test bucket | Production-like |
| **Production** | Live website | Prod Atlas | Prod bucket | Maximum |

## 🚀 Quick Setup

### 1. **Switch to Development Environment**
```bash
npm run env:dev
npm run db:setup:dev
npm run dev
```

### 2. **Switch to Test Environment**
```bash
npm run env:test
npm run db:setup:test
npm run build
```

### 3. **Switch to Production Environment**
```bash
npm run env:prod
npm run db:setup:prod
npm run build
npm start
```

## 📋 Environment Management

### **Available Commands**

#### Environment Switching:
```bash
npm run env:dev      # Switch to development
npm run env:test     # Switch to test
npm run env:prod     # Switch to production
npm run env:show     # Show current environment
npm run env:validate # Validate current environment
npm run env:list     # List all environments
```

#### Database Setup:
```bash
npm run db:setup:dev   # Setup development database
npm run db:setup:test  # Setup test database
npm run db:setup:prod  # Setup production database
npm run db:list        # List database configurations
```

#### S3 Bucket Planning:
```bash
npm run s3:plan:dev    # Plan development S3 setup
npm run s3:plan:test   # Plan test S3 setup
npm run s3:plan:prod   # Plan production S3 setup
npm run s3:list        # List S3 configurations
npm run s3:test:dev    # Test development S3 access
npm run s3:test:prod   # Test production S3 access
```

## 🔧 Manual Environment Management

### **Using Environment Manager Script**
```bash
# Switch environments
node scripts/env-manager.js switch development
node scripts/env-manager.js switch test
node scripts/env-manager.js switch production

# Show environment details
node scripts/env-manager.js show
node scripts/env-manager.js show production

# Validate configuration
node scripts/env-manager.js validate
node scripts/env-manager.js validate test

# Backup and restore
node scripts/env-manager.js backup
node scripts/env-manager.js restore
```

## 🗄️ Database Configuration

### **Development Database**
- **Type**: Local MongoDB
- **URI**: `mongodb://localhost:27017/receptai-dev`
- **Features**: Sample data seeding, relaxed validation
- **Setup**: Automatic with `npm run db:setup:dev`

### **Test Database**
- **Type**: MongoDB Atlas (Test cluster)
- **URI**: `mongodb+srv://test-user:password@test-cluster.mongodb.net/receptai-test`
- **Features**: Production-like setup, test data
- **Setup**: Manual Atlas cluster + `npm run db:setup:test`

### **Production Database**
- **Type**: MongoDB Atlas (Production cluster)
- **URI**: `mongodb+srv://prod-user:password@prod-cluster.mongodb.net/receptai`
- **Features**: Full security, backups, monitoring
- **Setup**: Manual Atlas cluster + `npm run db:setup:prod`

### **Database Setup Process**
1. **Create MongoDB Atlas clusters** (for test/prod)
2. **Configure network access** (IP whitelist)
3. **Create database users** with appropriate permissions
4. **Run setup script** to create collections and indexes
5. **Verify connection** and data integrity

## ☁️ AWS S3 Configuration

### **Bucket Structure**
```
ragaujam-dev-images/     # Development
ragaujam-test-images/    # Test/Staging
ragaujam-images/         # Production
```

### **S3 Setup Process**
1. **Plan the setup**: `npm run s3:plan:prod`
2. **Create AWS buckets** using provided CLI commands
3. **Configure bucket policies** for public read access
4. **Set up CORS** for web access
5. **Configure lifecycle rules** (test/prod only)
6. **Test access**: `npm run s3:test:prod`

### **Required AWS CLI Commands**
```bash
# Create bucket
aws s3 mb s3://ragaujam-images --region eu-north-1

# Set public read policy
aws s3api put-bucket-policy --bucket ragaujam-images --policy file://bucket-policy.json

# Configure CORS
aws s3api put-bucket-cors --bucket ragaujam-images --cors-configuration file://cors-config.json

# Configure lifecycle (optional)
aws s3api put-bucket-lifecycle-configuration --bucket ragaujam-images --lifecycle-configuration file://lifecycle-config.json
```

## 🔐 Environment Variables

### **Development (.env.development)**
```env
NODE_ENV=development
SITE_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/receptai-dev
AWS_S3_BUCKET=ragaujam-dev-images
RATE_LIMIT_MAX=1000
DEBUG=true
```

### **Test (.env.test)**
```env
NODE_ENV=test
SITE_URL=https://test.ragaujam.lt
MONGODB_URI=mongodb+srv://test-user:password@test-cluster.mongodb.net/receptai-test
AWS_S3_BUCKET=ragaujam-test-images
RATE_LIMIT_MAX=200
DEBUG=true
```

### **Production (.env.production)**
```env
NODE_ENV=production
SITE_URL=https://ragaujam.lt
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/receptai
AWS_S3_BUCKET=ragaujam-images
RATE_LIMIT_MAX=100
DEBUG=false
```

## 🚀 Deployment Workflow

### **Development → Test**
1. `npm run env:test`
2. `npm run build`
3. Test functionality
4. Deploy to staging server

### **Test → Production**
1. `npm run env:prod`
2. `npm run build`
3. Run production tests
4. Deploy to production server

## 🔍 Environment Validation

### **Validation Checklist**
- [x] Environment variables loaded
- [x] Database connection working
- [x] S3 bucket accessible
- [x] Security headers configured
- [x] Rate limiting active
- [x] CORS properly set

### **Validation Commands**
```bash
# Validate current environment
npm run env:validate

# Validate specific environment
node scripts/env-manager.js validate production

# Test database connection
npm run db:list

# Test S3 access
npm run s3:test:prod
```

## 🛠️ Troubleshooting

### **Common Issues**

#### Environment Not Switching
```bash
# Check if .env.local exists
ls -la .env.local

# Validate environment
npm run env:validate

# Manually switch
node scripts/env-manager.js switch development
```

#### Database Connection Failed
```bash
# Check MongoDB URI
npm run env:show | grep MONGODB_URI

# Test connection
npm run db:list

# Verify Atlas network access (for test/prod)
```

#### S3 Access Denied
```bash
# Check AWS credentials
aws sts get-caller-identity

# Test bucket access
npm run s3:test:prod

# Verify bucket policy and CORS
```

## 📊 Environment Monitoring

### **Health Checks**
- Database connectivity
- S3 bucket access
- API response times
- Error rates
- Security headers

### **Monitoring Commands**
```bash
# Environment status
npm run env:show

# Database status
npm run db:list

# S3 status
npm run s3:list
```

## 🔄 Environment Migration

### **Migrating Data Between Environments**
1. **Export from source**: `mongodump --uri="source-uri"`
2. **Import to target**: `mongorestore --uri="target-uri"`
3. **Update environment**: `npm run env:switch target`
4. **Validate migration**: `npm run env:validate`

### **S3 Data Migration**
```bash
# Sync buckets
aws s3 sync s3://source-bucket s3://target-bucket

# Copy specific files
aws s3 cp s3://source-bucket/file.jpg s3://target-bucket/file.jpg
```

---

**Last Updated**: June 2025
**Environment Setup**: Production Ready ✅
