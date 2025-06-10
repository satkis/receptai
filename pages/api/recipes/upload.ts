// API endpoint for uploading new recipes with automatic category/subcategory creation
// POST /api/recipes/upload - Creates recipe and auto-generates categories if needed

import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'receptai');
    
    const recipeData = req.body;
    
    // Validate required fields
    if (!recipeData.title || !recipeData.categoryPath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and categoryPath are required' 
      });
    }
    
    // Parse categoryPath
    const pathParts = recipeData.categoryPath.split('/');
    if (pathParts.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'categoryPath must be in format: category/subcategory' 
      });
    }
    
    const [categorySlug, subcategorySlug] = pathParts;
    
    // Generate slug from title if not provided
    if (!recipeData.slug) {
      const title = typeof recipeData.title === 'string' 
        ? recipeData.title 
        : recipeData.title.lt || recipeData.title.en || 'receptas';
      
      recipeData.slug = generateSlug(title);
    }
    
    // Ensure unique slug
    const existingRecipe = await db.collection('recipes').findOne({ 
      slug: recipeData.slug 
    });
    
    if (existingRecipe) {
      recipeData.slug = `${recipeData.slug}-${Date.now()}`;
    }
    
    // Auto-create category if it doesn't exist
    await ensureCategoryExists(db, categorySlug, subcategorySlug);
    
    // Prepare recipe document with enhanced schema
    const recipeDocument = {
      ...recipeData,
      
      // Ensure multilingual structure
      title: typeof recipeData.title === 'string' 
        ? { lt: recipeData.title, en: recipeData.title }
        : recipeData.title,
      
      description: typeof recipeData.description === 'string'
        ? { lt: recipeData.description, en: recipeData.description }
        : recipeData.description,
      
      // Auto-generate SEO data
      seo: recipeData.seo || generateSEOData(recipeData),
      
      // Auto-generate Schema.org data
      schemaOrg: recipeData.schemaOrg || generateSchemaOrg(recipeData),
      
      // Auto-generate breadcrumb
      breadcrumb: {
        main: {
          slug: categorySlug,
          label: formatSlugToTitle(categorySlug)
        },
        sub: {
          slug: subcategorySlug,
          label: formatSlugToTitle(subcategorySlug)
        }
      },
      
      // Default values
      status: recipeData.status || 'published',
      featured: recipeData.featured || false,
      trending: recipeData.trending || false,
      language: recipeData.language || 'lt',
      
      // Performance metrics
      performance: {
        views: 0,
        shares: 0,
        saves: 0,
        avgTimeOnPage: 0,
        bounceRate: 0
      },
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date()
    };
    
    // Insert recipe
    const result = await db.collection('recipes').insertOne(recipeDocument);
    
    // Update category recipe count
    await updateCategoryRecipeCount(db, categorySlug, subcategorySlug);
    
    res.status(201).json({
      success: true,
      data: {
        recipeId: result.insertedId,
        slug: recipeDocument.slug,
        categoryPath: recipeDocument.categoryPath,
        url: `/receptai/${recipeDocument.categoryPath}/${recipeDocument.slug}`
      },
      message: 'Recipe uploaded successfully'
    });

  } catch (error) {
    console.error('Recipe upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload recipe' 
    });
  }
}

// Helper function to ensure category and subcategory exist
async function ensureCategoryExists(db: any, categorySlug: string, subcategorySlug: string) {
  const categoriesCollection = db.collection('categories');
  
  // Check if category exists
  let category = await categoriesCollection.findOne({ slug: categorySlug });
  
  if (!category) {
    // Create new category
    const newCategory = {
      slug: categorySlug,
      title: formatSlugToTitle(categorySlug),
      description: `${formatSlugToTitle(categorySlug)} receptai`,
      image: `/images/categories/${categorySlug}.jpg`,
      icon: '🍽️',
      order: 999,
      status: 'active',
      subcategories: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await categoriesCollection.insertOne(newCategory);
    category = newCategory;
  }
  
  // Check if subcategory exists
  const subcategoryExists = category.subcategories?.some(
    (sub: any) => sub.slug === subcategorySlug
  );
  
  if (!subcategoryExists) {
    // Add subcategory to category
    const newSubcategory = {
      slug: subcategorySlug,
      title: formatSlugToTitle(subcategorySlug),
      description: `${formatSlugToTitle(subcategorySlug)} receptai`,
      image: `/images/subcategories/${subcategorySlug}.jpg`,
      recipeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await categoriesCollection.updateOne(
      { slug: categorySlug },
      { 
        $push: { subcategories: newSubcategory },
        $set: { updatedAt: new Date() }
      }
    );
  }
}

// Helper function to update recipe counts
async function updateCategoryRecipeCount(db: any, categorySlug: string, subcategorySlug: string) {
  const recipeCount = await db.collection('recipes').countDocuments({
    status: 'published',
    categoryPath: `${categorySlug}/${subcategorySlug}`
  });
  
  await db.collection('categories').updateOne(
    { 
      slug: categorySlug,
      'subcategories.slug': subcategorySlug 
    },
    { 
      $set: { 
        'subcategories.$.recipeCount': recipeCount,
        'subcategories.$.updatedAt': new Date(),
        updatedAt: new Date()
      } 
    }
  );
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (match) => {
      const map: { [key: string]: string } = { 
        'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 
        'į': 'i', 'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z' 
      };
      return map[match] || match;
    })
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to format slug to title
function formatSlugToTitle(slug: string): string {
  const lithuanianMappings: { [key: string]: string } = {
    'karsti-patiekalai': 'Karšti patiekalai',
    'saldumynai': 'Saldumynai',
    'sriubos': 'Sriubos',
    'apkepai': 'Apkepai',
    'trokiniai': 'Troškinti patiekalai',
    'kepsniai': 'Kepsniai',
    'tortai': 'Tortai',
    'pyragai': 'Pyragai'
  };
  
  return lithuanianMappings[slug] || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to generate SEO data
function generateSEOData(recipeData: any) {
  const title = typeof recipeData.title === 'string' 
    ? recipeData.title 
    : recipeData.title?.lt || 'Receptas';
  
  const description = typeof recipeData.description === 'string'
    ? recipeData.description
    : recipeData.description?.lt || 'Receptas aprašymas';
  
  const totalTime = recipeData.totalTimeMinutes || 30;
  const servings = recipeData.servings || 4;
  
  return {
    metaTitle: `${title} - Receptas | Paragaujam.lt`.substring(0, 60),
    metaDescription: `${description} Gaminimo laikas: ${totalTime} min. Porcijų: ${servings}.`.substring(0, 155),
    keywords: [title.toLowerCase(), 'receptas', 'gaminimas', 'lietuviški receptai'],
    canonicalUrl: `/receptai/${recipeData.categoryPath}/${recipeData.slug}`,
    lastModified: new Date()
  };
}

// Helper function to generate Schema.org data
function generateSchemaOrg(recipeData: any) {
  const title = typeof recipeData.title === 'string' 
    ? recipeData.title 
    : recipeData.title?.lt || 'Receptas';
  
  const description = typeof recipeData.description === 'string'
    ? recipeData.description
    : recipeData.description?.lt || 'Receptas aprašymas';
  
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: title,
    description: description,
    author: {
      "@type": "Organization",
      name: "Paragaujam.lt"
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    totalTime: `PT${recipeData.totalTimeMinutes || 30}M`,
    recipeCategory: "Pagrindinis patiekalas",
    recipeCuisine: recipeData.categories?.cuisine || "Lietuviška",
    recipeYield: `${recipeData.servings || 4} porcijos`
  };
}
