require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('receptai');
  
  const result = await db.collection('recipes_new').updateOne(
    { slug: 'vistiena-pagal-peru-recepta-aji-de-gallina' },
    {
      $set: {
        'originalImage.fileName': 'vistiena-pagal-peru-recepta-aji-de-gallina.jpg'
      }
    }
  );
  
  console.log('Updated:', result.modifiedCount);
  await client.close();
})();

