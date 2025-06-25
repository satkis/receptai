#!/usr/bin/env node

// Generate complete categories JSON from categ-subcateg.md
const fs = require('fs');

// Read the categ-subcateg.md file
const categSubcategContent = fs.readFileSync('categ-subcateg.md', 'utf8');

// Parse the content into groups
const lines = categSubcategContent.split('\n').filter(line => line.trim());
const groups = {};
let currentGroup = null;

lines.forEach(line => {
  if (line.startsWith('#')) {
    currentGroup = line.replace('#', '').trim();
    groups[currentGroup] = [];
  } else if (currentGroup && line.trim()) {
    groups[currentGroup].push(line.trim());
  }
});

// Generate categories array
const categories = [];
let sortOrder = 1;

// Helper function to create slug from Lithuanian text
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (char) => {
      const map = {
        'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
        'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z'
      };
      return map[char] || char;
    })
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to generate SEO content
function generateSEO(title, group) {
  const slug = createSlug(title);
  return {
    metaTitle: `${title} receptai - Ragaujam.lt`,
    metaDescription: `Atraskite geriausius ${title.toLowerCase()} receptus. Skanūs ir lengvi ${title.toLowerCase()} patiekalai su nuotraukomis ir detaliais gaminimo instrukcijomis.`,
    keywords: [
      title.toLowerCase(),
      `${title.toLowerCase()} receptai`,
      'lietuviški receptai',
      'maistas',
      'gaminimas',
      group.toLowerCase()
    ],
    canonicalUrl: `https://ragaujam.lt/receptai/${slug}`
  };
}

// Process each group
Object.entries(groups).forEach(([groupName, items]) => {
  items.forEach(item => {
    const slug = createSlug(item);
    const category = {
      path: slug,
      parentPath: null,
      level: 1,
      title: {
        lt: item
      },
      slug: slug,
      seo: generateSEO(item, groupName),
      filters: {
        manual: [],
        auto: [],
        timeFilters: ["iki-30-min", "30-60-min", "1-2-val", "virs-2-val"]
      },
      isActive: true,
      sortOrder: sortOrder++,
      createdAt: { "$date": "2025-06-25T12:00:00.000Z" },
      updatedAt: { "$date": "2025-06-25T12:00:00.000Z" }
    };
    
    categories.push(category);
  });
});

// Write the complete JSON
fs.writeFileSync('complete-categories-final.json', JSON.stringify(categories, null, 2));

console.log(`✅ Generated ${categories.length} categories`);
console.log('📁 File saved as: complete-categories-final.json');
console.log('\n📋 Categories by group:');

Object.entries(groups).forEach(([groupName, items]) => {
  console.log(`\n${groupName}: ${items.length} categories`);
  items.forEach(item => {
    console.log(`  - ${item} (${createSlug(item)})`);
  });
});

console.log('\n🚀 Ready to import into MongoDB!');
console.log('Copy the content of complete-categories-final.json to your MongoDB collection.');
