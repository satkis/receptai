# ChatGPT API - Quick Usage Guide

## 🚀 SIMPLEST WAY TO USE CHATGPT

### Step 1: Open Terminal
You already have it open at:
```
c:\Users\karolis\VibeCoding\receptai
```

### Step 2: Type This Command
```bash
node scripts/wiki/send-prompt.js "YOUR PROMPT HERE"
```

### Step 3: Press Enter
ChatGPT responds in terminal!

---

## 📝 EXAMPLES

### Example 1: Simple Question
```bash
node scripts/wiki/send-prompt.js "What is pasta?"
```

**Output:**
```
✅ Response:

Pasta is a type of Italian food made from wheat flour and water...

---
Tokens used: 45
(Input: 5, Output: 40)
```

---

### Example 2: Translation
```bash
node scripts/wiki/send-prompt.js "Translate to Lithuanian: Hello, how are you?"
```

**Output:**
```
✅ Response:

Sveiki, kaip jums sekasi?

---
Tokens used: 30
(Input: 19, Output: 11)
```

---

### Example 3: JSON Conversion
```bash
node scripts/wiki/send-prompt.js "Convert to JSON: Recipe: Pasta Carbonara, Ingredients: pasta, bacon, eggs, cheese, Time: 20 minutes"
```

**Output:**
```
✅ Response:

{
  "name": "Pasta Carbonara",
  "ingredients": ["pasta", "bacon", "eggs", "cheese"],
  "time": 20
}

---
Tokens used: 89
(Input: 45, Output: 44)
```

---

### Example 4: Lithuanian Prompt
```bash
node scripts/wiki/send-prompt.js "Ką tu žinai apie makaronus?"
```

**Output:**
```
✅ Response:

Makaronai yra italų kilmės maistas, pagamintas iš kviečių miltų...

---
Tokens used: 52
(Input: 8, Output: 44)
```

---

### Example 5: Recipe Analysis
```bash
node scripts/wiki/send-prompt.js "Analyze this recipe and suggest improvements: Pasta with tomato sauce, 30 minutes cooking time, serves 4"
```

---

### Example 6: Wikibooks Recipe Conversion
```bash
node scripts/wiki/send-prompt.js "Convert this Wikibooks recipe to JSON format with Lithuanian translation: Ingredients: 400g pasta, 2 tomatoes, 1 onion. Instructions: 1. Boil water 2. Cook pasta 3. Prepare sauce"
```

---

## 🎯 COMMON PATTERNS

### Pattern 1: Ask a Question
```bash
node scripts/wiki/send-prompt.js "What is [topic]?"
```

### Pattern 2: Translate
```bash
node scripts/wiki/send-prompt.js "Translate to Lithuanian: [text]"
```

### Pattern 3: Convert to JSON
```bash
node scripts/wiki/send-prompt.js "Convert to JSON: [data]"
```

### Pattern 4: Summarize
```bash
node scripts/wiki/send-prompt.js "Summarize in 2-3 sentences: [text]"
```

### Pattern 5: Generate
```bash
node scripts/wiki/send-prompt.js "Generate a [type] about [topic]"
```

---

## 💡 TIPS

### Tip 1: Use Quotes
Always wrap your prompt in double quotes:
```bash
✅ CORRECT:
node scripts/wiki/send-prompt.js "What is pasta?"

❌ WRONG:
node scripts/wiki/send-prompt.js What is pasta?
```

### Tip 2: Escape Quotes Inside Prompt
If your prompt contains quotes, escape them:
```bash
node scripts/wiki/send-prompt.js "He said \"hello\" to me"
```

### Tip 3: Multi-line Prompts
For longer prompts, use single quotes on Windows PowerShell:
```bash
node scripts/wiki/send-prompt.js 'This is a longer prompt
that spans multiple lines
and contains more details'
```

### Tip 4: Check Token Usage
The script shows how many tokens were used:
```
Tokens used: 22
(Input: 14, Output: 8)
```

This helps you track API costs!

---

## 📊 COST TRACKING

Each prompt costs money based on tokens:

| Tokens | Cost |
|--------|------|
| 100 | ~$0.001 |
| 1,000 | ~$0.01 |
| 10,000 | ~$0.10 |

The script shows tokens used for each request.

---

## ❌ TROUBLESHOOTING

### Error: "No prompt provided"
```bash
❌ WRONG:
node scripts/wiki/send-prompt.js

✅ CORRECT:
node scripts/wiki/send-prompt.js "Your prompt here"
```

### Error: "OPENAI_API_KEY not configured"
Make sure your `.env.local` file has:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### Error: "Cannot find module"
Make sure you're in the correct directory:
```bash
cd c:\Users\karolis\VibeCoding\receptai
node scripts/wiki/send-prompt.js "Your prompt"
```

---

## 🔗 RELATED FILES

- **Script**: `scripts/wiki/send-prompt.js`
- **Converter Class**: `scripts/wiki/chatgpt-converter.js`
- **Examples**: `docs/CHATGPT_API_SIMPLE_EXAMPLES.md`
- **Full Docs**: `docs/CHATGPT_API_DOCUMENTATION_INDEX.md`

---

## ✅ READY TO USE!

Just copy and paste this command:

```bash
node scripts/wiki/send-prompt.js "What is the capital of Lithuania?"
```

Then press Enter!

---

**Status**: ✅ Ready for production use

