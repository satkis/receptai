# 🚀 Vercel MongoDB Connection Fix Guide

## 🔍 Problem Diagnosis

Your MongoDB connection is failing in production with SSL/TLS errors because:

1. **Environment Variable Issue**: Vercel has `MONGODB_URI` set to `"SET"` instead of the actual connection string
2. **Missing MONGODB_DB**: The `MONGODB_DB` environment variable is not configured in Vercel
3. **SSL/TLS Configuration**: MongoDB Atlas requires proper SSL/TLS parameters

## ✅ Solution Steps

### Step 1: Fix Vercel Environment Variables

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your `ragaujam-lt` project

2. **Navigate to Settings**:
   - Click on "Settings" tab
   - Click on "Environment Variables" in the sidebar

3. **Update/Add Environment Variables**:

   **For Production Environment:**
   ```
   MONGODB_URI = mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority&ssl=true
   MONGODB_DB = receptai
   NODE_ENV = production
   ```

   **For Preview Environment:**
   ```
   MONGODB_URI = mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority&ssl=true
   MONGODB_DB = receptai
   NODE_ENV = production
   ```

4. **Environment Selection**:
   - Set these variables for both "Production" and "Preview" environments
   - Make sure to select the correct environment when adding each variable

### Step 2: Verify MongoDB Atlas Configuration

1. **Check MongoDB Atlas Network Access**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Navigate to "Network Access"
   - Ensure `0.0.0.0/0` is allowed (or add Vercel's IP ranges)

2. **Verify Database User**:
   - Go to "Database Access"
   - Confirm user `receptai` exists with password `SXF0NrgQbiQi8EeB`
   - Ensure user has read/write permissions to `receptai` database

### Step 3: Deploy and Test

1. **Trigger New Deployment**:
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger deployment

2. **Test Connection**:
   - Visit: `https://ragaujam.lt/api/debug-db?debug=ragaujam2024`
   - Should return successful connection info instead of SSL error

## 🔧 Enhanced Connection String

The updated connection string includes all necessary SSL/TLS parameters:

```
mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority&ssl=true&tls=true&authSource=admin&tlsAllowInvalidCertificates=false&tlsAllowInvalidHostnames=false
```

## 🛠️ Code Changes Made

1. **Enhanced `lib/mongodb.ts`**:
   - Added environment variable validation
   - Improved SSL/TLS configuration
   - Better error handling and logging
   - Added connection testing

2. **Updated `pages/api/debug-db.ts`**:
   - Enhanced error reporting
   - Added troubleshooting information
   - Better environment variable debugging

## 🔍 Verification Checklist

After making changes, verify:

- [ ] Vercel environment variables are set correctly
- [ ] MongoDB Atlas allows connections from 0.0.0.0/0
- [ ] Database user has proper permissions
- [ ] New deployment is triggered
- [ ] Debug endpoint returns success
- [ ] Website loads without database errors

## 🚨 Common Issues & Solutions

### Issue: Still getting SSL errors
**Solution**: Ensure MongoDB Atlas cluster is properly configured for SSL/TLS connections

### Issue: Authentication failed
**Solution**: Double-check username/password in connection string

### Issue: Network timeout
**Solution**: Verify MongoDB Atlas network access allows Vercel connections

### Issue: Database not found
**Solution**: Ensure `MONGODB_DB=receptai` is set in Vercel environment variables

## 📞 Next Steps

1. **Update Vercel Environment Variables** (Priority 1)
2. **Redeploy the application**
3. **Test the debug endpoint**
4. **Monitor application logs for any remaining issues**

---

**Last Updated**: June 25, 2025
**Status**: Ready for Implementation ✅
