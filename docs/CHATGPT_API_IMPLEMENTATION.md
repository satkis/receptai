# ChatGPT API Implementation Guide

## 🎯 Complete Workflow

```
1. Extract Wikibooks JSON
   ↓
2. Send to ChatGPT API
   ↓
3. Validate Response
   ↓
4. Insert to MongoDB
   ↓
5. Log Results
```

---

## 📝 Implementation Files

### 1. Create: `scripts/wiki/chatgpt-converter.js`

```javascript
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class ChatGPTConverter {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set in environment');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: parseInt(process.env.OPENAI_TIMEOUT_MS || '60000'),
    });

    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '4000');
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');
  }

  async convertRecipe(wikibooksJson, conversionPrompt) {
    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: `${conversionPrompt}\n\n---\n\nNow convert this Wikibooks JSON:\n\n${JSON.stringify(wikibooksJson, null, 2)}`
          }
        ]
      });

      const responseText = message.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('ChatGPT conversion error:', error);
      throw error;
    }
  }

  async convertWithRetry(wikibooksJson, conversionPrompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Conversion attempt ${attempt}/${maxRetries}...`);
        return await this.convertRecipe(wikibooksJson, conversionPrompt);
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = ChatGPTConverter;
```

### 2. Create: `scripts/wiki/wikibooks-to-mongodb.js`

```javascript
const fs = require('fs');
const path = require('path');
const ChatGPTConverter = require('./chatgpt-converter');
const { MongoClient } = require('mongodb');

const CONVERSION_PROMPT_FILE = path.join(__dirname, 'CHATGPT_CONVERSION_PROMPT_FINAL.md');
const OUTPUT_DIR = path.join(__dirname, 'output');
const LOGS_DIR = path.join(OUTPUT_DIR, 'logs');

async function main() {
  try {
    // 1. Read conversion prompt
    if (!fs.existsSync(CONVERSION_PROMPT_FILE)) {
      throw new Error(`Prompt file not found: ${CONVERSION_PROMPT_FILE}`);
    }
    const conversionPrompt = fs.readFileSync(CONVERSION_PROMPT_FILE, 'utf-8');

    // 2. Read Wikibooks JSON
    const wikibooksJsonFile = process.argv[2];
    if (!wikibooksJsonFile) {
      throw new Error('Usage: node wikibooks-to-mongodb.js <wikibooks-json-file>');
    }

    const wikibooksJson = JSON.parse(fs.readFileSync(wikibooksJsonFile, 'utf-8'));
    console.log(`📖 Loaded Wikibooks recipe: ${wikibooksJson.title}`);

    // 3. Convert with ChatGPT
    const converter = new ChatGPTConverter();
    console.log('🤖 Sending to ChatGPT...');
    const mongodbRecipe = await converter.convertWithRetry(wikibooksJson, conversionPrompt);
    console.log('✅ Conversion successful');

    // 4. Save converted JSON
    const outputFile = path.join(OUTPUT_DIR, `${mongodbRecipe.slug}-converted.json`);
    fs.writeFileSync(outputFile, JSON.stringify(mongodbRecipe, null, 2));
    console.log(`💾 Saved to: ${outputFile}`);

    // 5. Insert to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(process.env.MONGODB_DB || 'receptai');
      const result = await db.collection('recipes_new').insertOne(mongodbRecipe);
      console.log(`✅ Inserted to MongoDB: ${result.insertedId}`);
    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
```

### 3. Add to `package.json` scripts

```json
"wiki:convert": "node scripts/wiki/wikibooks-to-mongodb.js",
"wiki:batch-convert": "node scripts/wiki/batch-convert-wikibooks.js"
```

---

## 🚀 Usage

### Single Recipe Conversion
```bash
# 1. Extract Wikibooks recipe
npm run wiki:extract

# 2. Convert extracted JSON to MongoDB format
npm run wiki:convert scripts/wiki/output/recipe-slug-wikibooks.json

# 3. Verify in MongoDB
# Open MongoDB Compass and check recipes_new collection
```

### Batch Conversion
```bash
# Convert all extracted recipes
npm run wiki:batch-convert
```

---

## 🔍 Validation

### Validate Output JSON
```javascript
// Check required fields
const requiredFields = [
  'slug', 'title', 'description', 'ingredients',
  'instructions', 'prepTimeMinutes', 'cookTimeMinutes',
  'servings', 'difficulty', 'primaryCategoryPath'
];

const missingFields = requiredFields.filter(f => !recipe[f]);
if (missingFields.length > 0) {
  throw new Error(`Missing fields: ${missingFields.join(', ')}`);
}
```

---

## 📊 Monitoring & Logging

### Log API Usage
```javascript
const logApiUsage = (model, inputTokens, outputTokens, cost) => {
  const log = `[${new Date().toISOString()}] Model: ${model}, Input: ${inputTokens}, Output: ${outputTokens}, Cost: $${cost}\n`;
  fs.appendFileSync('logs/api-usage.log', log);
};
```

### Track Costs
```bash
# View API usage
tail -f logs/api-usage.log

# Calculate monthly cost
grep "$(date +%Y-%m)" logs/api-usage.log | awk '{sum+=$NF} END {print "Total: $" sum}'
```

---

## ⚠️ Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid API Key | Wrong/expired key | Regenerate key on OpenAI |
| Rate limit | Too many requests | Add delay between requests |
| Timeout | Request too slow | Increase timeout or split data |
| Invalid JSON | ChatGPT output malformed | Improve prompt clarity |
| DB connection | MongoDB unreachable | Check connection string |

---

## 🔐 Best Practices

1. **Never commit API keys** - Use `.env.local`
2. **Implement rate limiting** - Add delays between requests
3. **Log all operations** - Track success/failure
4. **Validate output** - Check JSON schema
5. **Monitor costs** - Set spending limits
6. **Use retries** - Exponential backoff
7. **Handle errors** - Graceful degradation
8. **Test thoroughly** - Use test recipes first

---

## 📈 Performance Tips

- Use `gpt-4o` for best speed/cost
- Batch similar recipes together
- Cache conversion prompts
- Implement request queuing
- Monitor token usage
- Optimize prompt length

---

**Next**: See `CHATGPT_API_WORKFLOW.md` for complete workflow

