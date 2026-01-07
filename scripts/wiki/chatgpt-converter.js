#!/usr/bin/env node

/**
 * ChatGPT Converter - Send prompts to ChatGPT API
 * 
 * Converts Wikibooks JSON recipes to Lithuanian MongoDB format
 * using ChatGPT API with error handling and retries
 */

require('dotenv').config({ path: '.env.local' });

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class ChatGPTConverter {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '4000');
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');
    this.timeout = parseInt(process.env.OPENAI_TIMEOUT_MS || '60000');

    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured in .env.local');
    }

    this.client = new OpenAI({
      apiKey: this.apiKey,
      timeout: this.timeout,
      maxRetries: 3,
    });
  }

  /**
   * Send a prompt to ChatGPT and get response
   * @param {string} prompt - The prompt to send
   * @param {string} userMessage - The user message/data
   * @returns {Promise<string>} - The response from ChatGPT
   */
  async sendPrompt(prompt, userMessage) {
    console.log('📤 Sending prompt to ChatGPT...');

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const content = response.choices[0].message.content;

      console.log('✅ Response received');
      console.log(`   Tokens used: ${response.usage.total_tokens}`);
      console.log(`   Input: ${response.usage.prompt_tokens}, Output: ${response.usage.completion_tokens}`);

      return content;
    } catch (error) {
      console.error('❌ Error sending prompt:', error.message);
      throw error;
    }
  }

  /**
   * Send prompt with retry logic
   * @param {string} prompt - The prompt to send
   * @param {string} userMessage - The user message/data
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<string>} - The response from ChatGPT
   */
  async sendPromptWithRetry(prompt, userMessage, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendPrompt(prompt, userMessage);
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ Retry ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Extract JSON from response
   * @param {string} response - The response text
   * @returns {object} - Parsed JSON object
   */
  extractJSON(response) {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Invalid JSON in response: ${error.message}`);
    }
  }
}

/**
 * Example usage
 */
async function example() {
  try {
    const converter = new ChatGPTConverter();

    // Example 1: Simple prompt
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              Example 1: Simple Prompt                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const simplePrompt = 'You are a helpful assistant. Respond in Lithuanian.';
    const simpleMessage = 'What is the capital of Lithuania?';

    const simpleResponse = await converter.sendPrompt(simplePrompt, simpleMessage);
    console.log('Response:', simpleResponse);

    // Example 2: JSON conversion
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              Example 2: JSON Conversion                        ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const jsonPrompt = `You are a recipe converter. Convert the provided recipe to JSON format.
Return ONLY valid JSON with these fields:
- title (Lithuanian)
- description (Lithuanian)
- ingredients (array with name, quantity)
- instructions (array with step, text)
- prepTimeMinutes (number)
- cookTimeMinutes (number)
- servings (number)`;

    const recipeMessage = `Recipe: Simple Pasta
Ingredients: 400g pasta, 2 tomatoes, 1 onion, salt, pepper
Instructions: 
1. Boil water
2. Cook pasta
3. Chop vegetables
4. Mix together
Time: 20 minutes cooking`;

    const jsonResponse = await converter.sendPrompt(jsonPrompt, recipeMessage);
    console.log('Response:', jsonResponse);

    try {
      const jsonData = converter.extractJSON(jsonResponse);
      console.log('\n✅ Extracted JSON:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.error('Error extracting JSON:', error.message);
    }

    // Example 3: With retry
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║              Example 3: With Retry Logic                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const retryPrompt = 'You are a helpful assistant.';
    const retryMessage = 'Say hello in Lithuanian.';

    const retryResponse = await converter.sendPromptWithRetry(retryPrompt, retryMessage, 3);
    console.log('Response:', retryResponse);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  example();
}

module.exports = ChatGPTConverter;

