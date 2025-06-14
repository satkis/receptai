// Recipe Change Handler Service
// Detects recipe changes and triggers category auto-creation

import { MongoClient, Db, ChangeStream } from 'mongodb';
import { ensureCategoriesExist, updateCategoryRecipeCounts } from './categoryAutoCreation';

export interface RecipeChangeEvent {
  operationType: 'insert' | 'update' | 'delete';
  fullDocument?: any;
  documentKey?: { _id: any };
  updateDescription?: {
    updatedFields?: any;
    removedFields?: string[];
  };
}

/**
 * Extracts category paths from a recipe document
 */
function extractCategoryPaths(recipe: any): string[] {
  const paths: string[] = [];
  
  if (recipe.primaryCategoryPath) {
    paths.push(recipe.primaryCategoryPath);
  }
  
  if (recipe.secondaryCategories && Array.isArray(recipe.secondaryCategories)) {
    paths.push(...recipe.secondaryCategories);
  }
  
  return paths.filter(Boolean);
}

/**
 * Handles recipe insertion - creates categories if needed
 */
async function handleRecipeInsert(db: Db, recipe: any): Promise<void> {
  console.log(`🔍 Processing new recipe: ${recipe.title?.lt || recipe.title || recipe.slug}`);
  
  const categoryPaths = extractCategoryPaths(recipe);
  
  if (categoryPaths.length === 0) {
    console.log('⚠️ No category paths found in recipe');
    return;
  }
  
  for (const categoryPath of categoryPaths) {
    console.log(`📂 Ensuring categories exist for path: ${categoryPath}`);
    
    const result = await ensureCategoriesExist(db, categoryPath);
    
    if (result.created) {
      console.log(`✅ ${result.message}`);
      
      // Update recipe counts
      await updateCategoryRecipeCounts(db, categoryPath);
    } else {
      console.log(`ℹ️ ${result.message}`);
    }
  }
}

/**
 * Handles recipe updates - creates new categories if category paths changed
 */
async function handleRecipeUpdate(db: Db, changeEvent: RecipeChangeEvent): Promise<void> {
  const updatedFields = changeEvent.updateDescription?.updatedFields || {};
  
  // Check if category-related fields were updated
  const categoryFieldsUpdated = 
    'primaryCategoryPath' in updatedFields || 
    'secondaryCategories' in updatedFields;
  
  if (!categoryFieldsUpdated) {
    return; // No category changes
  }
  
  console.log(`🔄 Processing recipe category update for ID: ${changeEvent.documentKey?._id}`);
  
  // Get the full updated document
  const recipe = await db.collection('recipes_new').findOne({
    _id: changeEvent.documentKey?._id
  });
  
  if (!recipe) {
    console.log('⚠️ Recipe not found after update');
    return;
  }
  
  const categoryPaths = extractCategoryPaths(recipe);
  
  for (const categoryPath of categoryPaths) {
    const result = await ensureCategoriesExist(db, categoryPath);
    
    if (result.created) {
      console.log(`✅ ${result.message}`);
    }
    
    // Update recipe counts for all affected categories
    await updateCategoryRecipeCounts(db, categoryPath);
  }
}

/**
 * Handles recipe deletion - updates category counts
 */
async function handleRecipeDelete(db: Db, changeEvent: RecipeChangeEvent): Promise<void> {
  console.log(`🗑️ Processing recipe deletion for ID: ${changeEvent.documentKey?._id}`);
  
  // Since the document is deleted, we need to update all category counts
  // This is a bit expensive but ensures accuracy
  const categories = await db.collection('categories_new').find({}).toArray();
  
  for (const category of categories) {
    if (category.path) {
      await updateCategoryRecipeCounts(db, category.path);
    }
  }
}

/**
 * Main change stream handler
 */
export async function handleRecipeChange(db: Db, changeEvent: RecipeChangeEvent): Promise<void> {
  try {
    switch (changeEvent.operationType) {
      case 'insert':
        if (changeEvent.fullDocument) {
          await handleRecipeInsert(db, changeEvent.fullDocument);
        }
        break;
        
      case 'update':
        await handleRecipeUpdate(db, changeEvent);
        break;
        
      case 'delete':
        await handleRecipeDelete(db, changeEvent);
        break;
        
      default:
        console.log(`ℹ️ Unhandled operation type: ${changeEvent.operationType}`);
    }
  } catch (error) {
    console.error('Error handling recipe change:', error);
  }
}

/**
 * Starts monitoring recipe changes using MongoDB Change Streams
 */
export async function startRecipeChangeMonitoring(mongoUri: string): Promise<ChangeStream> {
  const client = new MongoClient(mongoUri);
  await client.connect();
  
  const db = client.db();
  const collection = db.collection('recipes_new');
  
  console.log('🔄 Starting recipe change monitoring...');
  
  const changeStream = collection.watch([
    {
      $match: {
        operationType: { $in: ['insert', 'update', 'delete'] }
      }
    }
  ], {
    fullDocument: 'updateLookup'
  });
  
  changeStream.on('change', (changeEvent) => {
    handleRecipeChange(db, changeEvent);
  });
  
  changeStream.on('error', (error) => {
    console.error('Change stream error:', error);
  });
  
  console.log('✅ Recipe change monitoring started');
  
  return changeStream;
}

/**
 * Processes existing recipes to create missing categories
 * Use this for one-time migration of existing data
 */
export async function processExistingRecipes(mongoUri: string): Promise<void> {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Processing existing recipes for category auto-creation...');
    
    const recipes = await db.collection('recipes_new').find({}).toArray();
    
    console.log(`📊 Found ${recipes.length} recipes to process`);
    
    let processedCount = 0;
    let createdCategoriesCount = 0;
    
    for (const recipe of recipes) {
      const categoryPaths = extractCategoryPaths(recipe);
      
      for (const categoryPath of categoryPaths) {
        const result = await ensureCategoriesExist(db, categoryPath);
        
        if (result.created) {
          createdCategoriesCount++;
          console.log(`✅ Created categories for: ${categoryPath}`);
        }
        
        // Update recipe counts
        await updateCategoryRecipeCounts(db, categoryPath);
      }
      
      processedCount++;
      
      if (processedCount % 10 === 0) {
        console.log(`📈 Processed ${processedCount}/${recipes.length} recipes`);
      }
    }
    
    console.log(`✅ Processing complete!`);
    console.log(`📊 Processed ${processedCount} recipes`);
    console.log(`📂 Created ${createdCategoriesCount} new categories`);
    
  } catch (error) {
    console.error('Error processing existing recipes:', error);
  } finally {
    await client.close();
  }
}

/**
 * Manual trigger for category creation from recipe data
 * Use this in API endpoints or manual operations
 */
export async function triggerCategoryCreation(
  db: Db, 
  recipe: any
): Promise<{ success: boolean; message: string; categoriesCreated: number }> {
  try {
    const categoryPaths = extractCategoryPaths(recipe);
    let categoriesCreated = 0;
    
    if (categoryPaths.length === 0) {
      return {
        success: false,
        message: 'No category paths found in recipe',
        categoriesCreated: 0
      };
    }
    
    for (const categoryPath of categoryPaths) {
      const result = await ensureCategoriesExist(db, categoryPath);
      
      if (result.created) {
        categoriesCreated++;
      }
      
      // Update recipe counts
      await updateCategoryRecipeCounts(db, categoryPath);
    }
    
    return {
      success: true,
      message: `Processed ${categoryPaths.length} category paths, created ${categoriesCreated} new categories`,
      categoriesCreated
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Error creating categories: ${error.message}`,
      categoriesCreated: 0
    };
  }
}
