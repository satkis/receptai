#!/usr/bin/env node

/**
 * Setup GPT Assistant for Recipe Conversion
 * 
 * This script creates a GPT Assistant that stores your prompt template.
 * You only need to run this ONCE.
 * 
 * Usage:
 *   node scripts/wiki/setup-recipe-assistant.js
 * 
 * Output:
 *   Saves OPENAI_ASSISTANT_ID to .env.local
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const OpenAI = require('openai');

async function setupAssistant() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         GPT ASSISTANT SETUP FOR RECIPE CONVERSION              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Check if assistant already exists
    if (process.env.OPENAI_ASSISTANT_ID) {
      console.log('⚠️  Assistant already exists!');
      console.log(`   ID: ${process.env.OPENAI_ASSISTANT_ID}`);
      console.log('\n   To create a new one, remove OPENAI_ASSISTANT_ID from .env.local\n');
      process.exit(0);
    }

    // Read prompt template
    console.log('📖 Reading prompt template...');
    const templatePath = 'scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md';
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const promptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.log(`✅ Template loaded (${promptTemplate.length} characters)\n`);

    // Create OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create assistant
    console.log('🤖 Creating GPT Assistant...');
    const assistant = await client.beta.assistants.create({
      name: 'Recipe Converter',
      description: 'Converts Wikibooks recipes to MongoDB format with Lithuanian translation',
      instructions: promptTemplate,
      model: 'gpt-4o',
      tools: [],
    });

    console.log(`✅ Assistant created!\n`);
    console.log(`   Name: ${assistant.name}`);
    console.log(`   ID: ${assistant.id}`);
    console.log(`   Model: ${assistant.model}`);
    console.log(`   Status: ${assistant.created_at}\n`);

    // Save to .env.local
    console.log('💾 Saving to .env.local...');
    const envPath = '.env.local';
    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Add or update OPENAI_ASSISTANT_ID
    if (envContent.includes('OPENAI_ASSISTANT_ID=')) {
      envContent = envContent.replace(
        /OPENAI_ASSISTANT_ID=.*/,
        `OPENAI_ASSISTANT_ID=${assistant.id}`
      );
    } else {
      envContent += `\n# GPT Assistant for Recipe Conversion\nOPENAI_ASSISTANT_ID=${assistant.id}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Saved to .env.local\n`);

    // Display summary
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    SETUP COMPLETE!                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Assistant Details:');
    console.log(`   ID: ${assistant.id}`);
    console.log(`   Name: ${assistant.name}`);
    console.log(`   Model: ${assistant.model}`);
    console.log(`   Instructions: ${promptTemplate.length} characters\n`);

    console.log('🚀 Next Steps:');
    console.log('   1. Update your converter script to use the Assistant');
    console.log('   2. Run: node scripts/wiki/convert-wikibooks-with-assistant.js <input-file>\n');

    console.log('💰 Cost Savings:');
    console.log('   Before: ~$0.10 per recipe (prompt + data)');
    console.log('   After:  ~$0.05 per recipe (data only)');
    console.log('   Savings: ~50%\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

setupAssistant();

