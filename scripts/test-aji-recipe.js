require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('receptai');
  
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  console.log('Today:', todayString);
  console.log('');
  
  const recipes = await db.collection('recipes_new').find({
    'originalSource.platform': 'Wikibooks',
    'originalSource.url': { $exists: true },
    'image.src': { $exists: true },
    'createdAt': {
      $regex: `^${todayString}`
    }
  }).toArray();
  
  console.log('Found recipes:', recipes.length);
  console.log('');
  
  recipes.forEach(r => {
    console.log(`Slug: ${r.slug}`);
    console.log(`Title: ${r.title.lt}`);
    console.log(`CreatedAt: ${r.createdAt}`);
    console.log(`Image filename: ${r.originalImage?.fileName}`);
    console.log('');
  });
  
  await client.close();
})();

