# ChatGPT API - Simple Examples

## 🚀 Quick Start - Send Your First Prompt

### Example 1: Basic Prompt

```javascript
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askChatGPT() {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: 'What is the capital of Lithuania?',
      },
    ],
  });

  console.log(response.choices[0].message.content);
}

askChatGPT();
```

**Output:**
```
The capital of Lithuania is Vilnius.
```

---

## 📋 Complete Structure

### System Prompt + User Message

```javascript
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant. Respond in Lithuanian.',
    },
    {
      role: 'user',
      content: 'What is pasta?',
    },
  ],
  max_tokens: 1000,
  temperature: 0.7,
});

console.log(response.choices[0].message.content);
```

---

## 🔄 Multi-turn Conversation

```javascript
const messages = [];

async function chat(userMessage) {
  messages.push({
    role: 'user',
    content: userMessage,
  });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
  });

  const assistantMessage = response.choices[0].message.content;
  messages.push({
    role: 'assistant',
    content: assistantMessage,
  });

  return assistantMessage;
}

// Usage
await chat('What is pasta?');
await chat('How do I cook it?');
await chat('What are the ingredients?');
```

---

## 🍳 Recipe Conversion Example

```javascript
async function convertRecipeToJSON() {
  const prompt = `Convert this recipe to JSON format.
Return ONLY valid JSON with:
- title (string)
- ingredients (array of {name, quantity})
- instructions (array of strings)
- prepTimeMinutes (number)
- cookTimeMinutes (number)`;

  const recipe = `
    Recipe: Pasta Carbonara
    Ingredients: 400g pasta, 200g bacon, 3 eggs, 100g cheese
    Instructions:
    1. Cook pasta
    2. Fry bacon
    3. Mix eggs and cheese
    4. Combine all
    Time: 20 minutes
  `;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: recipe,
      },
    ],
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const recipeJSON = JSON.parse(jsonMatch[0]);
  
  console.log(JSON.stringify(recipeJSON, null, 2));
}

convertRecipeToJSON();
```

**Output:**
```json
{
  "title": "Pasta Carbonara",
  "ingredients": [
    { "name": "pasta", "quantity": "400g" },
    { "name": "bacon", "quantity": "200g" },
    { "name": "eggs", "quantity": "3" },
    { "name": "cheese", "quantity": "100g" }
  ],
  "instructions": [
    "Cook pasta",
    "Fry bacon",
    "Mix eggs and cheese",
    "Combine all"
  ],
  "prepTimeMinutes": 5,
  "cookTimeMinutes": 20
}
```

---

## ⚙️ Configuration Options

```javascript
const response = await client.chat.completions.create({
  model: 'gpt-4o',                    // Model to use
  messages: [...],                    // Array of messages
  max_tokens: 4000,                   // Max response length
  temperature: 0.7,                   // Creativity (0-1)
  top_p: 1,                          // Diversity (0-1)
  frequency_penalty: 0,              // Penalize repetition
  presence_penalty: 0,               // Penalize new topics
});
```

### Temperature Explained
- **0.0** = Deterministic (same answer every time)
- **0.5** = Balanced
- **1.0** = Creative (different answers each time)

---

## 🔄 Error Handling & Retries

```javascript
async function sendWithRetry(prompt, message, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: message },
        ],
      });
      return response.choices[0].message.content;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retry ${attempt}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await sendWithRetry(
  'You are helpful',
  'What is pasta?',
  3
);
```

---

## 📊 Response Structure

```javascript
{
  id: 'chatcmpl-xxx',
  object: 'chat.completion',
  created: 1234567890,
  model: 'gpt-4o',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'The response text here...'
      },
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 50,        // Input tokens
    completion_tokens: 100,   // Output tokens
    total_tokens: 150         // Total
  }
}
```

---

## 💰 Calculate Costs

```javascript
function calculateCost(response) {
  const inputCost = (response.usage.prompt_tokens / 1000) * 0.005;
  const outputCost = (response.usage.completion_tokens / 1000) * 0.015;
  const total = inputCost + outputCost;
  
  console.log(`Input: $${inputCost.toFixed(6)}`);
  console.log(`Output: $${outputCost.toFixed(6)}`);
  console.log(`Total: $${total.toFixed(6)}`);
}

// Usage
const response = await client.chat.completions.create({...});
calculateCost(response);
```

---

## 🎯 Common Patterns

### Pattern 1: Translation
```javascript
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'Translate to Lithuanian. Return only the translation.',
    },
    {
      role: 'user',
      content: 'Hello, how are you?',
    },
  ],
});
```

### Pattern 2: Summarization
```javascript
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'Summarize in 2-3 sentences.',
    },
    {
      role: 'user',
      content: 'Long text here...',
    },
  ],
});
```

### Pattern 3: JSON Generation
```javascript
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'Return ONLY valid JSON with fields: name, age, city',
    },
    {
      role: 'user',
      content: 'John is 30 years old and lives in Vilnius',
    },
  ],
});
```

---

## 🚀 Using the Converter Class

```javascript
const ChatGPTConverter = require('./scripts/wiki/chatgpt-converter.js');

const converter = new ChatGPTConverter();

// Send simple prompt
const response = await converter.sendPrompt(
  'You are helpful',
  'What is pasta?'
);

// Send with retry
const response = await converter.sendPromptWithRetry(
  'You are helpful',
  'What is pasta?',
  3
);

// Extract JSON
const json = converter.extractJSON(response);
```

---

## 📚 Full Example File

See: `scripts/wiki/chatgpt-converter.js`

Run it:
```bash
node scripts/wiki/chatgpt-converter.js
```

---

**Status**: Ready to use!

