# ChatGPT API Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Create OpenAI Account (2 min)
```
1. Go to: https://platform.openai.com/signup
2. Sign up with email
3. Verify email
4. Add payment method
```

### Step 2: Generate API Key (1 min)
```
1. Go to: https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Copy key immediately
4. Add to .env.local:
   OPENAI_API_KEY=sk-proj-xxxxx
```

### Step 3: Install Package (1 min)
```bash
npm install openai
```

### Step 4: Test Connection (1 min)
```bash
node scripts/wiki/test-openai-connection.js
```

---

## 🚀 Quick Workflow

### Extract Recipe
```bash
# 1. Add URL to file
echo "https://en.wikibooks.org/wiki/Cookbook:Recipe_Name" >> scripts/wiki/wikibooks-urls.txt

# 2. Extract
npm run wiki:extract

# Output: scripts/wiki/output/recipe-slug-wikibooks.json
```

### Convert to MongoDB Format
```bash
# Convert with ChatGPT
npm run wiki:convert scripts/wiki/output/recipe-slug-wikibooks.json

# Output: Inserted to MongoDB + saved JSON
```

### Verify
```bash
# Check MongoDB Compass
# Database: receptai
# Collection: recipes_new
# Find by slug

# Check website
# Visit: https://ragaujam.lt/receptas/recipe-slug
```

---

## 📋 Environment Setup

### `.env.local`
```bash
# Required
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Optional (defaults shown)
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT_MS=60000

# MongoDB (already configured)
MONGODB_URI=mongodb+srv://receptai:***@cluster0.zy6ywwg.mongodb.net/receptai
MONGODB_DB=receptai
```

---

## 💰 Costs

| Model | Cost per Recipe | Speed | Quality |
|-------|-----------------|-------|---------|
| gpt-3.5-turbo | $0.01-0.02 | Fast | Good |
| gpt-4o | $0.05-0.10 | Fast | Excellent |
| gpt-4-turbo | $0.10-0.20 | Slow | Best |

**Recommendation**: Use `gpt-4o` (best balance)

---

## 🔧 Common Commands

```bash
# Extract Wikibooks recipe
npm run wiki:extract

# Convert single recipe
npm run wiki:convert scripts/wiki/output/recipe-slug-wikibooks.json

# Batch convert all
npm run wiki:batch-convert

# Test API connection
node scripts/wiki/test-openai-connection.js

# View API usage
tail -f logs/api-usage.log

# Check MongoDB
# Open: https://cloud.mongodb.com
```

---

## ⚠️ Important Notes

### Security
- ✅ Never commit `.env.local`
- ✅ Never share API key
- ✅ Rotate keys quarterly
- ✅ Monitor usage for suspicious activity

### Costs
- ✅ Set hard limit: $20/month
- ✅ Set soft limit: $15/month
- ✅ Monitor daily usage
- ✅ Check monthly bill

### Rate Limits
- ✅ 3 requests per minute (free tier)
- ✅ Add delays between requests
- ✅ Use exponential backoff for retries
- ✅ Implement request queue

---

## 🆘 Troubleshooting

### "Invalid API Key"
```bash
# 1. Check key in .env.local
cat .env.local | grep OPENAI_API_KEY

# 2. Verify on OpenAI
# https://platform.openai.com/api/keys

# 3. Generate new key if needed
```

### "Rate limit exceeded"
```bash
# Add delay between requests
# In code: await sleep(5000); // 5 seconds
```

### "Timeout"
```bash
# Increase timeout in .env.local
OPENAI_TIMEOUT_MS=120000  # 2 minutes
```

### "Invalid JSON in response"
```bash
# Check prompt clarity
# Verify Wikibooks JSON format
# Try with simpler recipe first
```

---

## 📊 Monitoring

### Check API Usage
```bash
# View today's usage
grep "$(date +%Y-%m-%d)" logs/api-usage.log

# View monthly usage
grep "$(date +%Y-%m)" logs/api-usage.log | wc -l

# Calculate cost
grep "$(date +%Y-%m)" logs/api-usage.log | awk '{sum+=$NF} END {print "Total: $" sum}'
```

### Check MongoDB
```bash
# Count Wikibooks recipes
# In MongoDB Compass:
db.recipes_new.countDocuments({ "author.name": "Wikibooks" })

# Find by slug
db.recipes_new.findOne({ "slug": "recipe-slug" })
```

---

## ✅ Verification Checklist

- [ ] OpenAI account created
- [ ] Billing enabled
- [ ] API key generated
- [ ] API key in `.env.local`
- [ ] `openai` package installed
- [ ] Connection test passed
- [ ] Wikibooks URL added
- [ ] Extract working
- [ ] Convert working
- [ ] Recipe in MongoDB
- [ ] Recipe on website

---

## 📚 Full Documentation

For detailed information, see:
- `CHATGPT_API_INTEGRATION_SETUP.md` - Setup guide
- `CHATGPT_API_IMPLEMENTATION.md` - Code implementation
- `CHATGPT_API_WORKFLOW.md` - Complete workflow
- `CHATGPT_API_BEST_PRACTICES.md` - Best practices

---

## 🎯 Next Steps

1. **Setup** (5 min)
   - Create OpenAI account
   - Generate API key
   - Add to `.env.local`

2. **Test** (5 min)
   - Run connection test
   - Extract sample recipe
   - Convert with ChatGPT

3. **Deploy** (10 min)
   - Add Wikibooks URLs
   - Run batch conversion
   - Verify on website

4. **Monitor** (ongoing)
   - Check API usage
   - Monitor costs
   - Track success rate

---

**Status**: Ready to use!

**Questions?** See full documentation files above.

