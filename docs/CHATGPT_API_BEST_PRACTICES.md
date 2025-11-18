# ChatGPT API Best Practices & Infrastructure

## 🏗️ Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Your Application                       │
│  (scripts/wiki/wikibooks-to-mongodb.js)                │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  Rate Limiter    │    │  Error Handler   │
│  & Queue         │    │  & Retry Logic   │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  OpenAI API Client     │
        │  (with auth & timeout) │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  OpenAI API Servers    │
        │  (gpt-4o model)        │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Response Validator    │
        │  & JSON Parser         │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  MongoDB Insertion     │
        │  (recipes_new)         │
        └────────────────────────┘
```

---

## 🔐 Security Best Practices

### 1. API Key Management

**DO:**
```javascript
// ✅ Load from environment
const apiKey = process.env.OPENAI_API_KEY;

// ✅ Validate on startup
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured');
}

// ✅ Use in .env.local (never commit)
// OPENAI_API_KEY=sk-proj-xxxxx
```

**DON'T:**
```javascript
// ❌ Hardcode keys
const apiKey = 'sk-proj-xxxxx';

// ❌ Log keys
console.log('API Key:', apiKey);

// ❌ Commit to git
git add .env.local  // WRONG!
```

### 2. Rate Limiting

```javascript
class RateLimiter {
  constructor(maxRequests = 3, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async acquire() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire();
    }
    
    this.requests.push(now);
  }
}
```

### 3. Error Handling & Retries

```javascript
async function callWithRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retry ${attempt}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 4. Request Validation

```javascript
function validateApiResponse(response) {
  if (!response.choices || response.choices.length === 0) {
    throw new Error('Empty response from API');
  }

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content in response');
  }

  // Extract JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Invalid JSON in response: ${e.message}`);
  }
}
```

---

## 💰 Cost Optimization

### 1. Model Selection

```javascript
// Development/Testing: Use cheaper model
const DEV_MODEL = 'gpt-3.5-turbo';  // $0.01-0.02 per recipe

// Production: Use balanced model
const PROD_MODEL = 'gpt-4o';        // $0.05-0.10 per recipe

// High-quality: Use premium model
const PREMIUM_MODEL = 'gpt-4-turbo'; // $0.10-0.20 per recipe
```

### 2. Token Optimization

```javascript
// ❌ Send full prompt every time
const prompt = `${FULL_PROMPT}\n\n${JSON.stringify(recipe)}`;

// ✅ Cache prompt, send only recipe
const cachedPrompt = fs.readFileSync('prompt.md', 'utf-8');
const message = `${cachedPrompt}\n\n${JSON.stringify(recipe)}`;
```

### 3. Batch Processing

```javascript
// Process recipes in batches to optimize API calls
async function batchConvert(recipes, batchSize = 5) {
  for (let i = 0; i < recipes.length; i += batchSize) {
    const batch = recipes.slice(i, i + batchSize);
    await Promise.all(batch.map(r => convertRecipe(r)));
    
    // Add delay between batches
    if (i + batchSize < recipes.length) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
```

---

## 📊 Monitoring & Logging

### 1. API Usage Tracking

```javascript
class ApiUsageTracker {
  constructor() {
    this.logFile = 'logs/api-usage.log';
  }

  log(model, inputTokens, outputTokens, cost, status) {
    const entry = {
      timestamp: new Date().toISOString(),
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost,
      status
    };

    fs.appendFileSync(
      this.logFile,
      JSON.stringify(entry) + '\n'
    );
  }

  getMonthlyStats() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const logs = fs.readFileSync(this.logFile, 'utf-8')
      .split('\n')
      .filter(line => line.includes(currentMonth))
      .map(line => JSON.parse(line));

    return {
      totalRequests: logs.length,
      totalTokens: logs.reduce((sum, l) => sum + l.totalTokens, 0),
      totalCost: logs.reduce((sum, l) => sum + l.cost, 0),
      successRate: logs.filter(l => l.status === 'success').length / logs.length
    };
  }
}
```

### 2. Error Logging

```javascript
function logError(error, context) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context,
    severity: error.code === 'RATE_LIMIT_EXCEEDED' ? 'warning' : 'error'
  };

  fs.appendFileSync(
    'logs/errors.log',
    JSON.stringify(errorLog) + '\n'
  );

  // Alert on critical errors
  if (errorLog.severity === 'error') {
    console.error('🚨 Critical error:', error.message);
  }
}
```

---

## 🚀 Performance Optimization

### 1. Connection Pooling

```javascript
// Reuse API client instance
let apiClient = null;

function getApiClient() {
  if (!apiClient) {
    apiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000,
      maxRetries: 3
    });
  }
  return apiClient;
}
```

### 2. Caching

```javascript
class ConversionCache {
  constructor() {
    this.cache = new Map();
  }

  getKey(wikibooksJson) {
    // Create hash of input
    return require('crypto')
      .createHash('md5')
      .update(JSON.stringify(wikibooksJson))
      .digest('hex');
  }

  get(wikibooksJson) {
    return this.cache.get(this.getKey(wikibooksJson));
  }

  set(wikibooksJson, result) {
    this.cache.set(this.getKey(wikibooksJson), result);
  }
}
```

---

## 🔍 Quality Assurance

### 1. Schema Validation

```javascript
const Joi = require('joi');

const recipeSchema = Joi.object({
  slug: Joi.string().required(),
  title: Joi.object({ lt: Joi.string().required() }).required(),
  ingredients: Joi.array().min(1).required(),
  instructions: Joi.array().min(1).required(),
  prepTimeMinutes: Joi.number().min(0).required(),
  cookTimeMinutes: Joi.number().min(0).required(),
  servings: Joi.number().min(1).required(),
  difficulty: Joi.string().valid('labai-lengvas', 'lengvas', 'vidutiniškas', 'sunkus', 'labai-sunkus').required(),
  primaryCategoryPath: Joi.string().required()
});

function validateRecipe(recipe) {
  const { error, value } = recipeSchema.validate(recipe);
  if (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
  return value;
}
```

### 2. Output Verification

```javascript
function verifyConversion(original, converted) {
  const checks = {
    hasSlug: !!converted.slug,
    hasTitle: !!converted.title?.lt,
    hasIngredients: converted.ingredients?.length > 0,
    hasInstructions: converted.instructions?.length > 0,
    hasAuthor: converted.author?.name === 'Wikibooks',
    hasImage: !!converted.image?.src,
    hasTimings: converted.prepTimeMinutes > 0 && converted.cookTimeMinutes >= 0
  };

  const passed = Object.values(checks).filter(v => v).length;
  const total = Object.keys(checks).length;

  console.log(`✅ Verification: ${passed}/${total} checks passed`);
  
  if (passed < total) {
    console.log('Failed checks:', Object.entries(checks)
      .filter(([_, v]) => !v)
      .map(([k]) => k)
      .join(', '));
  }

  return passed === total;
}
```

---

## 📋 Deployment Checklist

- [ ] API key configured in `.env.local`
- [ ] Rate limiting implemented
- [ ] Error handling with retries
- [ ] Logging configured
- [ ] Cost monitoring enabled
- [ ] Schema validation in place
- [ ] Output verification working
- [ ] Batch processing tested
- [ ] Monitoring dashboard set up
- [ ] Alerts configured

---

## 🎯 Production Readiness

**Before going live:**
1. Test with 10 recipes
2. Monitor costs for 1 week
3. Verify all recipes on website
4. Set up alerts
5. Document procedures
6. Train team members
7. Create rollback plan

---

**Status**: Production-ready infrastructure

