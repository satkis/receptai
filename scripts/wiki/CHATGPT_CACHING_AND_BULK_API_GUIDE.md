# 🚀 ChatGPT Caching & Bulk API - Cost Optimization Guide

## 📊 Current Cost Analysis

### **Your Current Setup** (Single Recipe Conversion)
```
Per Recipe:
- Input tokens: ~2,000 (prompt template + recipe JSON)
- Output tokens: ~1,500 (converted recipe JSON)
- Total: ~3,500 tokens per recipe
- Cost (gpt-4o): $0.015 per 1K input + $0.06 per 1K output
- Per recipe cost: ~$0.105

Monthly (100 recipes):
- Cost: ~$10.50
- API calls: 100 individual requests
```

---

## 🎯 Solution 1: Prompt Caching (Immediate Savings)

### **How It Works**
- Cache the **prompt template** (system message) across all recipes
- Only the recipe data (user message) changes per request
- Cached tokens cost **90% less** than regular tokens

### **Cost Breakdown with Caching**
```
Cached Prompt Template:
- Size: ~2,000 tokens (ONE TIME)
- Cost: $0.015 × 2,000 = $0.03 (first request only)
- Reuse cost: $0.0015 × 2,000 = $0.003 per recipe (90% discount)

Per Recipe (after first):
- Cached template: $0.003 (90% discount)
- New recipe data: ~500 tokens = $0.0075
- Output: ~1,500 tokens = $0.09
- Total: ~$0.1005 per recipe

Monthly (100 recipes):
- First recipe: $0.135
- Remaining 99: $0.1005 × 99 = $9.95
- Total: ~$10.08
- Savings: ~$0.42/month (4% savings)
```

### **Implementation**
```javascript
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: systemPrompt,
      cache_control: { type: 'ephemeral' }  // ← Cache this
    },
    {
      role: 'user',
      content: userMessage
    }
  ],
  max_tokens: 8000,
  temperature: 0.7
});
```

**Limitations:**
- Cache expires after 5 minutes of inactivity
- Only works if system prompt is identical
- Minimal savings for your use case

---

## 🎯 Solution 2: Batch API (Best for Your Use Case)

### **How It Works**
- Submit multiple recipes in ONE batch request
- Process asynchronously (results ready in 24 hours)
- **50% cost reduction** on input tokens
- Perfect for daily recipe processing

### **Cost Breakdown with Batch API**
```
Batch Processing (100 recipes):
- Input tokens: 100 × 2,000 = 200,000
- Regular cost: $200,000 × $0.015 / 1K = $3.00
- Batch cost: $3.00 × 0.5 = $1.50 (50% discount)

- Output tokens: 100 × 1,500 = 150,000
- Regular cost: $150,000 × $0.06 / 1K = $9.00
- Batch cost: $9.00 × 0.5 = $4.50 (50% discount)

Total per 100 recipes:
- Regular API: $12.00
- Batch API: $6.00
- Savings: 50% ($6.00/batch)

Monthly (300 recipes = 3 batches):
- Regular: $36.00
- Batch: $18.00
- Monthly savings: $18.00 (50%)
```

### **Implementation**
```javascript
// Create batch request file
const batchRequests = recipes.map((recipe, index) => ({
  custom_id: `recipe-${index}`,
  params: {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(recipe) }
    ],
    max_tokens: 8000
  }
}));

// Submit batch
const batch = await client.beta.batches.create({
  input_file_id: uploadedFileId,
  endpoint: '/v1/chat/completions',
  completion_window: '24h'
});

// Poll for results
const results = await client.beta.batches.retrieve(batch.id);
```

**Advantages:**
- 50% cost reduction
- Process 100+ recipes at once
- Perfect for daily/weekly workflows
- Asynchronous (no waiting)

**Disadvantages:**
- 24-hour processing time
- Not suitable for real-time conversions

---

## 🎯 Solution 3: Hybrid Approach (Recommended)

### **Strategy**
1. **Batch API** for bulk daily processing (50% savings)
2. **Prompt Caching** for individual recipe requests (90% savings on template)
3. **Fallback** to regular API for urgent conversions

### **Cost Breakdown (Hybrid)**
```
Daily Workflow:
- 50 recipes via Batch API: $3.00 (50% discount)
- 5 urgent recipes via regular API: $0.525
- Total daily: $3.525

Monthly (1,500 recipes):
- Batch: 1,500 × $0.06 = $90.00 (50% discount)
- Urgent: $0.525 × 30 = $15.75
- Total: ~$105.75
- Savings vs regular: ~$105.75 (50% overall)
```

---

## 💡 Implementation Roadmap

### **Phase 1: Batch API (Week 1)**
- [ ] Create batch request builder
- [ ] Implement batch submission
- [ ] Add result polling
- [ ] Update workflow to use batches

### **Phase 2: Prompt Caching (Week 2)**
- [ ] Add cache_control headers
- [ ] Monitor cache hit rates
- [ ] Optimize prompt template

### **Phase 3: Monitoring (Week 3)**
- [ ] Track token usage
- [ ] Monitor cost savings
- [ ] Optimize based on patterns

---

## 🔧 Quick Start: Batch API Implementation

**File to create:** `scripts/wiki/batch-convert-recipes.js`

Key features:
- Read all `*-wikibooks-raw.json` files
- Create batch request with all recipes
- Submit to OpenAI Batch API
- Poll for results every 30 seconds
- Save results to `chatGPT/` folder

**Expected savings:** $18/month (50% reduction)

---

## 📈 Comparison Table

| Feature | Regular API | Caching | Batch API | Hybrid |
|---------|------------|---------|-----------|--------|
| Cost per 100 recipes | $12.00 | $11.58 | $6.00 | $6.00 |
| Processing time | Instant | Instant | 24h | Mixed |
| Setup complexity | Low | Low | Medium | Medium |
| Best for | Real-time | Repeated prompts | Bulk daily | Production |
| Monthly savings | - | $0.42 | $18.00 | $18.00 |

---

**Recommendation:** Implement **Batch API** for your daily Wikibooks workflow. It's the best fit for your use case and saves 50% on API costs.

