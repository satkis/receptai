// Script to update all recipe data from paragaujam.lt to ragaujam.lt
// This updates the actual database records

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function updateRecipeDomains() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('recipes');
    
    // Get all recipes
    const recipes = await collection.find({}).toArray();
    console.log(`📊 Found ${recipes.length} recipes to update`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const recipe of recipes) {
      try {
        const updates = {};
        let hasUpdates = false;
        
        // Update canonicalUrl
        if (recipe.canonicalUrl && recipe.canonicalUrl.includes('paragaujam.lt')) {
          updates.canonicalUrl = recipe.canonicalUrl.replace(/paragaujam\.lt/g, 'ragaujam.lt');
          hasUpdates = true;
        }
        
        // Update SEO metadata
        if (recipe.seo) {
          const seoUpdates = {};
          
          if (recipe.seo.metaTitle && recipe.seo.metaTitle.includes('Paragaujam.lt')) {
            seoUpdates.metaTitle = recipe.seo.metaTitle.replace(/Paragaujam\.lt/g, 'Ragaujam.lt');
          }
          
          if (recipe.seo.canonicalUrl && recipe.seo.canonicalUrl.includes('paragaujam.lt')) {
            seoUpdates.canonicalUrl = recipe.seo.canonicalUrl.replace(/paragaujam\.lt/g, 'ragaujam.lt');
          }
          
          if (Object.keys(seoUpdates).length > 0) {
            updates.seo = { ...recipe.seo, ...seoUpdates };
            hasUpdates = true;
          }
        }
        
        // Update author information
        if (recipe.author) {
          const authorUpdates = {};
          
          if (recipe.author.name && recipe.author.name.includes('Paragaujam.lt')) {
            authorUpdates.name = recipe.author.name.replace(/Paragaujam\.lt/g, 'Ragaujam.lt');
          }
          
          if (recipe.author.profileUrl && recipe.author.profileUrl.includes('paragaujam.lt')) {
            authorUpdates.profileUrl = recipe.author.profileUrl.replace(/paragaujam\.lt/g, 'ragaujam.lt');
          }
          
          if (Object.keys(authorUpdates).length > 0) {
            updates.author = { ...recipe.author, ...authorUpdates };
            hasUpdates = true;
          }
        }
        
        // Update Schema.org data
        if (recipe.schemaOrg) {
          let schemaOrgStr = JSON.stringify(recipe.schemaOrg);
          
          if (schemaOrgStr.includes('paragaujam.lt') || schemaOrgStr.includes('Paragaujam.lt')) {
            schemaOrgStr = schemaOrgStr.replace(/paragaujam\.lt/g, 'ragaujam.lt');
            schemaOrgStr = schemaOrgStr.replace(/Paragaujam\.lt/g, 'Ragaujam.lt');
            
            updates.schemaOrg = JSON.parse(schemaOrgStr);
            hasUpdates = true;
          }
        }
        
        // Update the recipe if there are changes
        if (hasUpdates) {
          updates.updatedAt = new Date();
          
          await collection.updateOne(
            { _id: recipe._id },
            { $set: updates }
          );
          
          console.log(`✅ Updated recipe: ${recipe.title?.lt || recipe.slug}`);
          updatedCount++;
        } else {
          console.log(`⏭️  No updates needed: ${recipe.title?.lt || recipe.slug}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating recipe ${recipe.slug}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Domain update completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total recipes: ${recipes.length}`);
    console.log(`   - Updated: ${updatedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - No changes needed: ${recipes.length - updatedCount - errorCount}`);
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the update
updateRecipeDomains().catch(console.error);
