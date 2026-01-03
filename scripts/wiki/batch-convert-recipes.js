#!/usr/bin/env node

/**
 * Batch Convert Wikibooks Recipes using OpenAI Batch API
 * 
 * Benefits:
 * - 50% cost reduction on API calls
 * - Process 100+ recipes in one batch
 * - Asynchronous processing (24-hour window)
 * 
 * Usage:
 *   npm run batch:convert-recipes
 * 
 * Workflow:
 * 1. Reads all *-wikibooks-raw.json files
 * 2. Creates batch request with all recipes
 * 3. Submits to OpenAI Batch API
 * 4. Polls for results (checks every 30 seconds)
 * 5. Saves converted recipes to chatGPT/ folder
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const OUTPUT_DIR = path.join(__dirname, 'output');
const CHATGPT_DIR = path.join(OUTPUT_DIR, 'chatGPT');
const BATCH_STATUS_FILE = path.join(OUTPUT_DIR, 'batch-status.json');

// Ensure directories exist
[CHATGPT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Read prompt template
 */
function readPromptTemplate() {
  const templatePath = path.join(__dirname, 'CHAT_GPT_PROMPT_TEMPLATE.md');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Find all raw Wikibooks JSON files
 */
function findRawRecipes() {
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('-wikibooks-raw.json'));
  
  console.log(`📋 Found ${files.length} raw recipe files`);
  return files;
}

/**
 * Create batch request file
 */
async function createBatchRequest(recipes, systemPrompt) {
  const requests = recipes.map((filename, index) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    const recipeData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    return {
      custom_id: `recipe-${index}-${filename.replace('.json', '')}`,
      params: {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(recipeData, null, 2) }
        ],
        max_tokens: 8000,
        temperature: 0.7
      }
    };
  });

  // Save batch request to JSONL file
  const batchFile = path.join(OUTPUT_DIR, 'batch-request.jsonl');
  const jsonlContent = requests
    .map(r => JSON.stringify(r))
    .join('\n');
  
  fs.writeFileSync(batchFile, jsonlContent);
  console.log(`✅ Batch request file created: ${batchFile}`);
  
  return { batchFile, requests };
}

/**
 * Submit batch to OpenAI
 */
async function submitBatch(batchFile) {
  console.log('\n📤 Submitting batch to OpenAI...');
  
  const fileStream = fs.createReadStream(batchFile);
  const uploadedFile = await client.beta.files.create({
    file: fileStream,
    purpose: 'batch'
  });
  
  console.log(`✅ File uploaded: ${uploadedFile.id}`);
  
  const batch = await client.beta.batches.create({
    input_file_id: uploadedFile.id,
    endpoint: '/v1/chat/completions',
    completion_window: '24h'
  });
  
  console.log(`✅ Batch submitted: ${batch.id}`);
  console.log(`   Status: ${batch.status}`);
  
  return batch;
}

/**
 * Poll for batch completion
 */
async function pollBatchStatus(batchId, maxWaitMinutes = 1440) {
  console.log(`\n⏳ Polling batch status (max ${maxWaitMinutes} minutes)...`);
  
  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;
  let pollCount = 0;
  
  while (true) {
    const batch = await client.beta.batches.retrieve(batchId);
    pollCount++;
    
    console.log(`[Poll #${pollCount}] Status: ${batch.status}`);
    console.log(`  Processed: ${batch.request_counts.completed}/${batch.request_counts.total}`);
    
    if (batch.status === 'completed') {
      console.log('✅ Batch completed!');
      return batch;
    }
    
    if (batch.status === 'failed') {
      throw new Error(`Batch failed: ${batch.errors}`);
    }
    
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error(`Batch processing timeout after ${maxWaitMinutes} minutes`);
    }
    
    // Wait 30 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

/**
 * Process batch results
 */
async function processBatchResults(batch) {
  console.log('\n📥 Processing batch results...');
  
  const results = await client.beta.batches.results(batch.id);
  let successCount = 0;
  let errorCount = 0;
  
  for await (const result of results) {
    if (result.result.status === 'succeeded') {
      const customId = result.custom_id;
      const responseContent = result.result.message.content;
      
      // Extract JSON from response
      let jsonText = responseContent;
      const codeBlockMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(`❌ No JSON in response for ${customId}`);
        errorCount++;
        continue;
      }
      
      const recipeJSON = JSON.parse(jsonMatch[0]);
      const slug = recipeJSON.slug || customId;
      
      // Save converted recipe
      const outputPath = path.join(CHATGPT_DIR, `${slug}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(recipeJSON, null, 2));
      
      console.log(`✅ Saved: ${slug}.json`);
      successCount++;
    } else {
      console.error(`❌ Error for ${result.custom_id}: ${result.result.error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed`);
  return { successCount, errorCount };
}

/**
 * Main function
 */
async function main() {
  console.log('\n🚀 Batch Recipe Conversion\n');
  
  try {
    // Read prompt template
    console.log('📋 Reading prompt template...');
    const systemPrompt = readPromptTemplate();
    console.log('✅ Template loaded');
    
    // Find raw recipes
    const recipes = findRawRecipes();
    if (recipes.length === 0) {
      console.log('ℹ️  No raw recipes found');
      return;
    }
    
    // Create batch request
    const { batchFile } = await createBatchRequest(recipes, systemPrompt);
    
    // Submit batch
    const batch = await submitBatch(batchFile);
    
    // Save batch status
    fs.writeFileSync(BATCH_STATUS_FILE, JSON.stringify({
      batchId: batch.id,
      submittedAt: new Date().toISOString(),
      recipeCount: recipes.length
    }, null, 2));
    
    // Poll for completion
    const completedBatch = await pollBatchStatus(batch.id);
    
    // Process results
    const results = await processBatchResults(completedBatch);
    
    console.log('\n✅ Batch processing complete!');
    console.log(`📊 Summary: ${results.successCount} recipes converted`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

