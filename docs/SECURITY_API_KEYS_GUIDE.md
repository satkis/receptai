# Security Guide: API Keys Management

## 🚨 CRITICAL: API Key Exposure Incident

**Date**: November 18, 2025  
**Issue**: OpenAI API key was exposed in `.env.local.example`  
**Status**: ✅ FIXED  
**Action Required**: Rotate your API key immediately

---

## ❌ What Went Wrong

Your actual OpenAI API key was stored in `.env.local.example`:

```bash
# ❌ WRONG - This file is committed to Git!
# (Real key was exposed here - now removed)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Why this is dangerous:**
- ✅ Visible in Git history
- ✅ Visible on GitHub
- ✅ Visible to anyone with repo access
- ✅ Can be used to make API calls at your expense
- ✅ Can access your OpenAI account

---

## ✅ What Was Fixed

1. ✅ Removed real API key from `.env.local.example`
2. ✅ Added placeholder value
3. ✅ Added security warning comment
4. ✅ Committed fix to Git

---

## 🔧 Actions You Must Take NOW

### Step 1: Rotate Your API Key (URGENT!)

1. Go to: https://platform.openai.com/api/keys
2. Find the exposed key (the one you saved to `.env.local.example`)
3. Click the trash icon to **DELETE** it
4. Click "Create new secret key"
5. Copy the new key immediately

### Step 2: Update `.env.local`

```bash
# .env.local (LOCAL ONLY - never commit!)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx  # Your NEW key
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT_MS=60000
```

### Step 3: Add to Vercel (Production)

1. Go to: https://vercel.com/dashboard
2. Select project: **receptai**
3. Click: **Settings**
4. Click: **Environment Variables**
5. Add new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your NEW key
   - **Environments**: Production, Preview, Development
6. Click: **Save**

### Step 4: Verify

```bash
# Test local connection
node scripts/wiki/test-openai-connection.js

# Should output: ✅ Connection successful
```

---

## 📋 Correct API Key Storage

### ✅ Local Development

**File**: `.env.local`

```bash
# ✅ CORRECT - This file is in .gitignore
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Rules:**
- ✅ Store actual key here
- ✅ Never commit to Git
- ✅ Add to `.gitignore` (already done)
- ✅ Only for local development

### ✅ Production (Vercel)

**Location**: Vercel Dashboard → Settings → Environment Variables

```
Name: OPENAI_API_KEY
Value: sk-proj-xxxxxxxxxxxxx
Environments: Production, Preview, Development
```

**Rules:**
- ✅ Store actual key here
- ✅ Encrypted by Vercel
- ✅ Not visible in code
- ✅ Only for production

### ❌ Template/Example Files

**File**: `.env.local.example`

```bash
# ❌ NEVER store real keys here
# ✅ Use placeholder values only
OPENAI_API_KEY=your-openai-api-key
```

**Rules:**
- ❌ Never store real keys
- ❌ Use placeholder values
- ❌ Commit to Git (it's a template)
- ❌ For documentation only

---

## 🔐 Security Best Practices

### 1. API Key Rotation
- ✅ Rotate quarterly
- ✅ Rotate immediately if exposed
- ✅ Keep old key for 24 hours (in case of issues)
- ✅ Delete old key after verification

### 2. Key Storage
- ✅ `.env.local` for local development
- ✅ Vercel environment variables for production
- ✅ Never hardcode in source code
- ✅ Never commit to Git

### 3. Key Monitoring
- ✅ Monitor API usage: https://platform.openai.com/account/usage
- ✅ Set usage limits: https://platform.openai.com/account/billing/limits
- ✅ Enable email alerts
- ✅ Check monthly bills

### 4. Key Access Control
- ✅ Use different keys for dev/prod
- ✅ Limit key permissions (if available)
- ✅ Rotate keys regularly
- ✅ Delete unused keys

---

## 📊 Current Configuration

### `.env.local` (Local Development)
```bash
# ✅ Correct - Real key stored here
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT_MS=60000
```

### `.env.local.example` (Template)
```bash
# ✅ Correct - Placeholder only
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT_MS=60000
```

### Vercel Environment Variables (Production)
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT_MS=60000
```

---

## ✅ Verification Checklist

- [ ] Old API key deleted from OpenAI
- [ ] New API key generated
- [ ] New key in `.env.local`
- [ ] New key in Vercel environment variables
- [ ] Local connection test passed
- [ ] `.env.local.example` has placeholder only
- [ ] `.gitignore` includes `.env.local`
- [ ] No real keys in Git history

---

## 🆘 Troubleshooting

### "Invalid API Key"
```bash
# 1. Verify key in .env.local
cat .env.local | grep OPENAI_API_KEY

# 2. Check key on OpenAI
# https://platform.openai.com/api/keys

# 3. Verify key is not expired
# Keys don't expire, but may be deleted
```

### "Unauthorized"
```bash
# 1. Verify billing enabled
# https://platform.openai.com/account/billing/overview

# 2. Check usage limits
# https://platform.openai.com/account/billing/limits

# 3. Verify model access
# https://platform.openai.com/account/rate-limits
```

### "Rate limit exceeded"
```bash
# 1. Check usage
# https://platform.openai.com/account/usage

# 2. Verify limits
# https://platform.openai.com/account/billing/limits

# 3. Wait for rate limit reset (1 minute)
```

---

## 📚 Related Documentation

- `CHATGPT_API_INTEGRATION_SETUP.md` - Setup guide
- `CHATGPT_API_BEST_PRACTICES.md` - Security best practices
- `CHATGPT_API_QUICK_START.md` - Quick start guide

---

## 🎯 Summary

| Item | Status | Action |
|------|--------|--------|
| Old key exposed | ✅ Fixed | Delete from OpenAI |
| New key generated | ⏳ TODO | Generate on OpenAI |
| `.env.local` updated | ⏳ TODO | Add new key |
| Vercel updated | ⏳ TODO | Add new key |
| Connection tested | ⏳ TODO | Run test script |

---

**Status**: ✅ Security issue fixed, awaiting your action

**Next Step**: Rotate your API key immediately

