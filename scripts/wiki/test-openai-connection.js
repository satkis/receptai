#!/usr/bin/env node

/**
 * Test OpenAI API Connection
 * 
 * Verifies that:
 * 1. OpenAI API key is configured
 * 2. API key is valid
 * 3. API is accessible
 * 4. Model is available
 * 
 * Usage: node scripts/wiki/test-openai-connection.js
 */

require('dotenv').config({ path: '.env.local' });

const OpenAI = require('openai');

async function testConnection() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           OpenAI API Connection Test                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Step 1: Check if API key is configured
  console.log('📋 Step 1: Checking API key configuration...');
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ FAILED: OPENAI_API_KEY not found in .env.local');
    console.error('   Please add: OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx');
    process.exit(1);
  }

  if (apiKey.includes('your-openai-api-key') || apiKey.length < 20) {
    console.error('❌ FAILED: OPENAI_API_KEY is still a placeholder');
    console.error('   Replace with your actual key from: https://platform.openai.com/api/keys');
    process.exit(1);
  }

  console.log('✅ API key found');
  console.log(`   Key starts with: ${apiKey.substring(0, 20)}...`);

  // Step 2: Check model configuration
  console.log('\n📋 Step 2: Checking model configuration...');
  const model = process.env.OPENAI_MODEL || 'gpt-4o';
  console.log(`✅ Model: ${model}`);

  // Step 3: Initialize OpenAI client
  console.log('\n📋 Step 3: Initializing OpenAI client...');
  let client;
  try {
    client = new OpenAI({
      apiKey: apiKey,
      timeout: parseInt(process.env.OPENAI_TIMEOUT_MS || '60000'),
    });
    console.log('✅ Client initialized');
  } catch (error) {
    console.error('❌ FAILED: Could not initialize OpenAI client');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }

  // Step 4: Test API connection
  console.log('\n📋 Step 4: Testing API connection...');
  console.log('   Sending test message to OpenAI...');

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: 'Say "OpenAI API connection successful" in one sentence.',
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log('✅ API connection successful');
    console.log(`   Response: ${response.choices[0].message.content}`);

    // Step 5: Display usage information
    console.log('\n📋 Step 5: API Usage Information');
    console.log(`   Input tokens: ${response.usage.prompt_tokens}`);
    console.log(`   Output tokens: ${response.usage.completion_tokens}`);
    console.log(`   Total tokens: ${response.usage.total_tokens}`);

    // Calculate approximate cost (gpt-4o pricing)
    const inputCost = (response.usage.prompt_tokens / 1000) * 0.005; // $0.005 per 1K input tokens
    const outputCost = (response.usage.completion_tokens / 1000) * 0.015; // $0.015 per 1K output tokens
    const totalCost = inputCost + outputCost;

    console.log(`   Estimated cost: $${totalCost.toFixed(6)}`);

    // Step 6: Display configuration summary
    console.log('\n📋 Step 6: Configuration Summary');
    console.log(`   API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`);
    console.log(`   Model: ${model}`);
    console.log(`   Max tokens: ${process.env.OPENAI_MAX_TOKENS || '4000'}`);
    console.log(`   Temperature: ${process.env.OPENAI_TEMPERATURE || '0.7'}`);
    console.log(`   Timeout: ${process.env.OPENAI_TIMEOUT_MS || '60000'}ms`);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL TESTS PASSED - OpenAI API is ready to use!            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📚 Next steps:');
    console.log('   1. Add Wikibooks URLs to: scripts/wiki/wikibooks-urls.txt');
    console.log('   2. Extract recipes: npm run wiki:extract');
    console.log('   3. Convert with ChatGPT: npm run wiki:convert <file>');
    console.log('   4. Verify in MongoDB: Open MongoDB Compass\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ FAILED: API connection test failed');
    console.error(`   Error: ${error.message}`);

    // Provide helpful error messages
    if (error.message.includes('401')) {
      console.error('\n   💡 Hint: Invalid API key');
      console.error('      - Check your key at: https://platform.openai.com/api/keys');
      console.error('      - Make sure billing is enabled: https://platform.openai.com/account/billing/overview');
    } else if (error.message.includes('429')) {
      console.error('\n   💡 Hint: Rate limit exceeded');
      console.error('      - Wait a minute and try again');
      console.error('      - Check limits: https://platform.openai.com/account/rate-limits');
    } else if (error.message.includes('timeout')) {
      console.error('\n   💡 Hint: Request timeout');
      console.error('      - Increase OPENAI_TIMEOUT_MS in .env.local');
      console.error('      - Check your internet connection');
    }

    process.exit(1);
  }
}

// Run the test
testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

