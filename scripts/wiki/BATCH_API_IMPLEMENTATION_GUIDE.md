# 🔧 Batch API Implementation Guide

## Quick Summary

**Batch API** processes multiple recipes in one request with **50% cost reduction**.

| Metric | Regular API | Batch API | Savings |
|--------|------------|-----------|---------|
| 100 recipes | $12.00 | $6.00 | 50% |
| Processing | Instant | 24 hours | - |
| API calls | 100 | 1 | 99% fewer |
| Setup | Simple | Medium | - |

---

## How Batch API Works

### **Step 1: Create Batch Request**
```
Input: 100 raw Wikibooks JSON files
↓
Create JSONL file with 100 requests
Each request: { custom_id, params: { model, messages, max_tokens } }
↓
Output: batch-request.jsonl (one request per line)
```

### **Step 2: Submit to OpenAI**
```
Upload batch-request.jsonl to OpenAI
↓
OpenAI processes asynchronously (24-hour window)
↓
Returns batch ID for tracking
```

### **Step 3: Poll for Results**
```
Check batch status every 30 seconds
↓
When status = "completed", retrieve results
↓
Extract converted recipes from results
```

### **Step 4: Save Results**
```
Parse each result's JSON response
↓
Save to scripts/wiki/output/chatGPT/{slug}.json
↓
Ready for MongoDB upload
```

---

## Implementation Steps

### **Step 1: Add npm Script**
Edit `package.json`:
```json
{
  "scripts": {
    "batch:convert-recipes": "node scripts/wiki/batch-convert-recipes.js",
    "batch:check-status": "node scripts/wiki/check-batch-status.js"
  }
}
```

### **Step 2: Run Batch Conversion**
```bash
npm run batch:convert-recipes
```

**Output:**
```
🚀 Batch Recipe Conversion

📋 Reading prompt template...
✅ Template loaded
📋 Found 50 raw recipe files
✅ Batch request file created
📤 Submitting batch to OpenAI...
✅ File uploaded: file-xxx
✅ Batch submitted: batch-xxx
   Status: validating

⏳ Polling batch status...
[Poll #1] Status: validating
  Processed: 0/50
[Poll #2] Status: processing
  Processed: 25/50
[Poll #3] Status: completed
  Processed: 50/50
✅ Batch completed!

📥 Processing batch results...
✅ Saved: recipe-1.json
✅ Saved: recipe-2.json
...
📊 Results: 50 succeeded, 0 failed
```

### **Step 3: Check Batch Status (Optional)**
If you need to check a batch later:
```bash
npm run batch:check-status batch-xxx
```

---

## Cost Calculation Example

### **Scenario: 100 Wikibooks Recipes**

**Regular API (100 individual calls):**
```
Input tokens: 100 × 2,000 = 200,000
Cost: 200,000 × $0.015 / 1K = $3.00

Output tokens: 100 × 1,500 = 150,000
Cost: 150,000 × $0.06 / 1K = $9.00

Total: $12.00
```

**Batch API (1 batch request):**
```
Input tokens: 200,000 × 0.5 = $1.50 (50% discount)
Output tokens: 150,000 × 0.5 = $4.50 (50% discount)

Total: $6.00
Savings: $6.00 (50%)
```

---

## Workflow Integration

### **Updated Wikibooks Workflow**

```
Step 1: Add URLs to wikibooks-urls.txt
         ↓
Step 2: npm run wiki:extract
         (Extract recipes & images)
         ↓
Step 3: npm run batch:convert-recipes
         (Convert with Batch API - 50% savings!)
         ↓
Step 4: npm run upload-gpt-to-mongodb
         (Upload to MongoDB)
         ↓
Step 5: npm run image-prep-and-load
         (Process & upload images to S3)
         ↓
Step 6: ✅ Recipes live on website!
```

---

## Monitoring & Optimization

### **Track Batch Status**
Batch status file: `scripts/wiki/output/batch-status.json`
```json
{
  "batchId": "batch-xxx",
  "submittedAt": "2025-11-26T10:00:00Z",
  "recipeCount": 50
}
```

### **Monitor Costs**
- Track tokens used per batch
- Compare with regular API costs
- Adjust batch size if needed

### **Optimize Batch Size**
- Small batches (10-20): Faster feedback, higher cost
- Medium batches (50-100): Balanced approach
- Large batches (200+): Maximum savings, longer wait

**Recommendation:** 50-100 recipes per batch

---

## Troubleshooting

### **Batch Fails**
- Check OpenAI API key in `.env.local`
- Verify prompt template exists
- Ensure raw JSON files are valid

### **Results Missing**
- Check batch status file
- Verify batch ID is correct
- Check `scripts/wiki/output/chatGPT/` folder

### **Slow Processing**
- Batch API processes asynchronously
- Check status every 30 seconds
- Typical processing: 5-30 minutes

---

## Next Steps

1. ✅ Add npm scripts to `package.json`
2. ✅ Test with 10 recipes first
3. ✅ Monitor costs and token usage
4. ✅ Scale to 50-100 recipes per batch
5. ✅ Integrate into daily workflow

**Expected Result:** 50% reduction in ChatGPT API costs!

