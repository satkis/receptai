// Update time filter definitions with new Lithuanian labels
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'receptai';

async function updateTimeFilters() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(MONGODB_DB);

    // Update existing time filter definitions
    const timeFilters = [
      {
        key: "15min",
        label: { lt: "iki 15min", en: "up to 15min" },
        icon: "⚡",
        color: "#FF5722",
        order: 1,
        metadata: { maxMinutes: 15 }
      },
      {
        key: "30min",
        label: { lt: "iki 30min", en: "up to 30min" },
        icon: "🕐",
        color: "#FF9800",
        order: 2,
        metadata: { maxMinutes: 30 }
      },
      {
        key: "1h",
        label: { lt: "iki 1val", en: "up to 1h" },
        icon: "🕑",
        color: "#2196F3",
        order: 3,
        metadata: { maxMinutes: 60 }
      },
      {
        key: "2h",
        label: { lt: "apie 2val", en: "about 2h" },
        icon: "🕕",
        color: "#9C27B0",
        order: 4,
        metadata: { maxMinutes: 120 }
      },
      {
        key: "2h+",
        label: { lt: "virš 2val", en: "over 2h" },
        icon: "🕘",
        color: "#795548",
        order: 5,
        metadata: { minMinutes: 120 }
      }
    ];

    // Update each time filter
    for (const filter of timeFilters) {
      await db.collection('filter_definitions').updateOne(
        { type: "timeRequired", key: filter.key },
        { 
          $set: {
            label: filter.label,
            icon: filter.icon,
            color: filter.color,
            order: filter.order,
            metadata: filter.metadata,
            active: true
          }
        },
        { upsert: true }
      );
      console.log(`✅ Updated time filter: ${filter.key} - ${filter.label.lt}`);
    }

    console.log('');
    console.log('🎉 Time filter definitions updated successfully!');
    console.log('');
    console.log('📊 New time ranges:');
    console.log('   ⚡ iki 15min    (0 < minutes ≤ 15)');
    console.log('   🕐 iki 30min    (15 < minutes ≤ 30)');
    console.log('   🕑 iki 1val     (30 < minutes ≤ 60)');
    console.log('   🕕 apie 2val    (60 < minutes ≤ 120 + missing times)');
    console.log('   🕘 virš 2val    (minutes > 120)');

  } catch (error) {
    console.error('❌ Error updating time filters:', error);
  } finally {
    await client.close();
  }
}

updateTimeFilters();
