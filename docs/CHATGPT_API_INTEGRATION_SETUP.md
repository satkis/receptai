# ChatGPT API Integration Setup Guide

## 🎯 Overview

This guide covers setting up OpenAI ChatGPT API for automated Wikibooks recipe conversion to Lithuanian MongoDB format.

---

## 📋 Manual Setup on OpenAI Website

### Step 1: Create OpenAI Account
1. Go to: https://platform.openai.com/signup
2. Sign up with email or Google account
3. Verify email address
4. Complete profile setup

### Step 2: Set Up Billing
1. Go to: https://platform.openai.com/account/billing/overview
2. Click "Set up paid account"
3. Add payment method (credit/debit card)
4. Set usage limits (recommended: $10-20/month for testing)
5. Enable billing alerts

**⚠️ IMPORTANT**: 
- Free trial credits expire after 3 months
- You MUST have active billing to use API
- Monitor usage to avoid unexpected charges

### Step 3: Create API Key
1. Go to: https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Name it: `ragaujam-wikibooks-converter`
4. Copy the key immediately (you won't see it again!)
5. Store securely in `.env.local`

### Step 4: Set Usage Limits (CRITICAL)
1. Go to: https://platform.openai.com/account/billing/limits
2. Set "Hard limit": $20/month (prevents overspending)
3. Set "Soft limit": $15/month (email warning)
4. Enable "Email alerts"

### Step 5: Check Model Availability
1. Go to: https://platform.openai.com/account/rate-limits
2. Verify you have access to:
   - `gpt-4o` (recommended, faster, cheaper)
   - `gpt-4-turbo` (alternative)
   - `gpt-3.5-turbo` (budget option)

---

## 🔧 Environment Configuration

### Add to `.env.local`
```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT_MS=60000
```

### Verify Setup
```bash
# Test API key validity
node scripts/wiki/test-openai-connection.js
```

---

## 📦 Install Dependencies

```bash
npm install openai
```

This installs the official OpenAI Node.js SDK.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         Wikibooks Recipe Extraction                 │
│  (scripts/wiki/extract-wikibooks-recipe.js)         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│      ChatGPT API Conversion Service                 │
│  (scripts/wiki/chatgpt-converter.js)                │
│  - Sends Wikibooks JSON to ChatGPT                  │
│  - Applies conversion prompt                        │
│  - Validates output                                 │
│  - Handles errors & retries                         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│      MongoDB Recipe Insertion                       │
│  (scripts/wiki/insert-recipe.js)                    │
│  - Validates JSON schema                            │
│  - Inserts into recipes_new collection              │
│  - Logs success/failure                             │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Security Best Practices

### 1. API Key Management
- ✅ Store in `.env.local` (never commit)
- ✅ Use different keys for dev/prod
- ✅ Rotate keys quarterly
- ✅ Monitor usage for suspicious activity

### 2. Rate Limiting
- ✅ Implement request throttling
- ✅ Add exponential backoff for retries
- ✅ Queue requests to avoid rate limits
- ✅ Log all API calls

### 3. Cost Control
- ✅ Set hard spending limits on OpenAI
- ✅ Monitor token usage
- ✅ Use cheaper models for testing
- ✅ Batch requests when possible

### 4. Error Handling
- ✅ Catch API errors gracefully
- ✅ Implement retry logic
- ✅ Log errors to file
- ✅ Alert on critical failures

---

## 📊 Pricing Reference

### Model Costs (as of Nov 2024)
```
gpt-4o:
  - Input: $0.005 per 1K tokens
  - Output: $0.015 per 1K tokens
  - Estimated cost per recipe: $0.05-0.10

gpt-4-turbo:
  - Input: $0.01 per 1K tokens
  - Output: $0.03 per 1K tokens
  - Estimated cost per recipe: $0.10-0.20

gpt-3.5-turbo:
  - Input: $0.0005 per 1K tokens
  - Output: $0.0015 per 1K tokens
  - Estimated cost per recipe: $0.01-0.02
```

**Recommendation**: Use `gpt-4o` for best quality/cost ratio

---

## ✅ Verification Checklist

- [ ] OpenAI account created
- [ ] Billing enabled with payment method
- [ ] API key generated and stored
- [ ] Usage limits set ($20 hard limit)
- [ ] Model access verified
- [ ] `OPENAI_API_KEY` added to `.env.local`
- [ ] `openai` package installed
- [ ] Connection test passed
- [ ] Rate limiting configured
- [ ] Error handling implemented

---

## 🚨 Troubleshooting

### "Invalid API Key"
- Verify key in `.env.local` is correct
- Check key hasn't been revoked
- Generate new key if needed

### "Rate limit exceeded"
- Implement exponential backoff
- Add delay between requests
- Use request queue

### "Insufficient quota"
- Check billing is active
- Verify payment method
- Check usage limits

### "Model not available"
- Verify model name is correct
- Check account has access
- Try alternative model

---

**Next**: See `CHATGPT_API_IMPLEMENTATION.md` for code implementation

