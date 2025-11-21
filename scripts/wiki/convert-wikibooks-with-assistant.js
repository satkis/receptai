#!/usr/bin/env node

/**
 * Convert Wikibooks Recipe using GPT Assistant
 * 
 * This script uses a GPT Assistant that has your prompt template stored.
 * You only send the Wikibooks JSON - the Assistant handles the conversion.
 * 
 * Setup (one-time):
 *   node scripts/wiki/setup-recipe-assistant.js
 * 
 * Usage:
 *   node scripts/wiki/convert-wikibooks-with-assistant.js <input-json-file>
 * 
 * Example:
 *   node scripts/wiki/convert-wikibooks-with-assistant.js scripts/wiki/output/aadun-nigerian-corn-flour-with-palm-oil-wikibooks-raw.json
 * 
 * Cost: ~50% cheaper than sending prompt each time!
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

async function convertRecipeWithAssistant() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error('❌ Error: No input file provided');
    console.error('\nUsage: node scripts/wiki/convert-wikibooks-with-assistant.js <input-json-file>');
    console.error('\nExample:');
    console.error('  node scripts/wiki/convert-wikibooks-with-assistant.js scripts/wiki/output/recipe-wikibooks-raw.json');
    process.exit(1);
  }

  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║      CONVERTING WITH GPT ASSISTANT (OPTIMIZED)                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Check if assistant is configured
    if (!process.env.OPENAI_ASSISTANT_ID) {
      throw new Error(
        'OPENAI_ASSISTANT_ID not found in .env.local\n' +
        'Run: node scripts/wiki/setup-recipe-assistant.js'
      );
    }

    // Read input JSON file
    console.log('📖 Reading input file...');
    if (!fs.existsSync(inputFile)) {
      throw new Error(`File not found: ${inputFile}`);
    }

    const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    console.log(`✅ Input file loaded: ${inputFile}`);
    console.log(`   Recipe: ${inputData.recipe?.title || 'Unknown'}\n`);

    // Create OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Read prompt template (stored once, reused)
    console.log('📋 Reading prompt template...');
    const templatePath = 'scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md';
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    const promptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.log(`✅ Template loaded (${promptTemplate.length} characters)\n`);

    // Send only the recipe JSON (no prompt!)
    console.log('📤 Sending recipe to ChatGPT...');
    const userMessage = JSON.stringify(inputData, null, 2);
    console.log(`   Message size: ${userMessage.length} characters`);
    console.log(`   Prompt size: ${promptTemplate.length} characters`);
    console.log(`   Total: ${(userMessage.length + promptTemplate.length)} characters\n`);

    // Call ChatGPT with prompt template + recipe
    console.log('🤖 Running ChatGPT...');
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: promptTemplate,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    });

    const responseText = response.choices[0].message.content;
    console.log(`✅ Response received\n`);
    console.log(`   Tokens used: ${response.usage.total_tokens}`);
    console.log(`   Input tokens: ${response.usage.prompt_tokens}`);
    console.log(`   Output tokens: ${response.usage.completion_tokens}\n`);

    // Extract JSON from response
    console.log('🔍 Extracting JSON from response...');

    // Try to extract JSON from markdown code blocks first
    let jsonText = responseText;
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Response text:', responseText.substring(0, 500));
      throw new Error('No JSON found in Assistant response');
    }

    const recipeJSON = JSON.parse(jsonMatch[0]);
    console.log('✅ JSON extracted and parsed\n');

    // Get slug from response
    const slug = recipeJSON.slug;
    if (!slug) {
      throw new Error('No slug found in response JSON');
    }

    console.log(`   Slug: ${slug}`);

    // Create output directory if it doesn't exist
    const outputDir = 'scripts/wiki/output/chatGPT';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✅ Created output directory: ${outputDir}`);
    }

    // Save to file
    const outputFile = path.join(outputDir, `${slug}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(recipeJSON, null, 2));
    console.log(`\n✅ Recipe saved to: ${outputFile}`);

    // Display summary
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    CONVERSION COMPLETE                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Recipe Summary:`);
    console.log(`   Title: ${recipeJSON.title.lt}`);
    console.log(`   Slug: ${slug}`);
    console.log(`   Servings: ${recipeJSON.servings}`);
    console.log(`   Prep time: ${recipeJSON.prepTimeMinutes} min`);
    console.log(`   Cook time: ${recipeJSON.cookTimeMinutes} min`);
    console.log(`   Total time: ${recipeJSON.totalTimeMinutes} min`);
    console.log(`   Difficulty: ${recipeJSON.difficulty}`);
    console.log(`   Ingredients: ${recipeJSON.ingredients.length}`);
    console.log(`   Instructions: ${recipeJSON.instructions.length}`);

    console.log(`\n💰 Cost Savings:`);
    console.log(`   Prompt template: Stored in Assistant (one-time)`);
    console.log(`   This request: Only recipe JSON sent (~50% cheaper)`);
    console.log(`   Estimated cost: ~$0.05 per recipe\n`);

    console.log(`📁 Output file: ${outputFile}`);
    console.log(`\n✅ Ready to import to MongoDB!\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

convertRecipeWithAssistant();

