#!/usr/bin/env node

/**
 * Convert Wikibooks Recipe to MongoDB Format
 * 
 * Usage:
 *   node scripts/wiki/convert-wikibooks-to-recipe.js <input-json-file>
 * 
 * Example:
 *   node scripts/wiki/convert-wikibooks-to-recipe.js scripts/wiki/output/aadun-nigerian-corn-flour-with-palm-oil-wikibooks.json
 * 
 * Output:
 *   Saves to: scripts/wiki/output/chatGPT/{slug}.json
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

async function convertRecipe() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error('❌ Error: No input file provided');
    console.error('\nUsage: node scripts/wiki/convert-wikibooks-to-recipe.js <input-json-file>');
    console.error('\nExample:');
    console.error('  node scripts/wiki/convert-wikibooks-to-recipe.js scripts/wiki/output/recipe-wikibooks.json');
    process.exit(1);
  }

  try {
    // Read input JSON file
    console.log('\n📖 Reading input file...');
    if (!fs.existsSync(inputFile)) {
      throw new Error(`File not found: ${inputFile}`);
    }

    const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    console.log(`✅ Input file loaded: ${inputFile}`);

    // Read prompt template
    console.log('\n📋 Reading prompt template...');
    const templatePath = 'scripts/wiki/CHAT_GPT_PROMPT_TEMPLATE.md';
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const promptTemplate = fs.readFileSync(templatePath, 'utf-8');
    console.log('✅ Prompt template loaded');

    // Prepare the message
    const systemPrompt = promptTemplate;
    const userMessage = JSON.stringify(inputData, null, 2);

    // Send to ChatGPT
    console.log('\n📤 Sending to ChatGPT...');
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
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
    console.log('✅ Response received from ChatGPT');
    console.log(`   Tokens used: ${response.usage.total_tokens}`);

    // Extract JSON from response
    console.log('\n🔍 Extracting JSON from response...');

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
      throw new Error('No JSON found in ChatGPT response');
    }

    const recipeJSON = JSON.parse(jsonMatch[0]);
    console.log('✅ JSON extracted and parsed');

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
    console.log(`\n📁 Output file: ${outputFile}`);
    console.log(`\n✅ Ready to import to MongoDB!\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

convertRecipe();

