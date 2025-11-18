#!/usr/bin/env node

/**
 * Simple ChatGPT Prompt Sender
 * 
 * Usage:
 *   node scripts/wiki/send-prompt.js "Your prompt here"
 * 
 * Example:
 *   node scripts/wiki/send-prompt.js "What is pasta?"
 *   node scripts/wiki/send-prompt.js "Translate to Lithuanian: Hello"
 */

require('dotenv').config({ path: '.env.local' });

const OpenAI = require('openai');

async function sendPrompt() {
  // Get prompt from command line argument
  const prompt = process.argv[2];

  if (!prompt) {
    console.error('❌ Error: No prompt provided');
    console.error('\nUsage: node scripts/wiki/send-prompt.js "Your prompt here"');
    console.error('\nExamples:');
    console.error('  node scripts/wiki/send-prompt.js "What is pasta?"');
    console.error('  node scripts/wiki/send-prompt.js "Translate to Lithuanian: Hello"');
    process.exit(1);
  }

  try {
    console.log('\n📤 Sending prompt to ChatGPT...\n');
    console.log('Prompt:', prompt);
    console.log('---\n');

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const message = response.choices[0].message.content;

    console.log('✅ Response:\n');
    console.log(message);
    console.log('\n---');
    console.log(`Tokens used: ${response.usage.total_tokens}`);
    console.log(`(Input: ${response.usage.prompt_tokens}, Output: ${response.usage.completion_tokens})\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendPrompt();

