// SEO Audit Script for Google Search Console Issues
// Identifies and reports SEO problems that cause indexing issues

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';
const SITE_URL = 'https://ragaujam.lt';

async function runSEOAudit() {
  console.log('🔍 Running comprehensive SEO audit...\n');
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    const issues = [];
    const recommendations = [];

    // 1. Check for recipes without canonical URLs in database
    console.log('📄 Auditing recipe canonical URLs...');
    const recipesWithoutCanonical = await db.collection('recipes_new').find({
      publishedAt: { $exists: true },
      canonicalUrl: { $exists: false }
    }).count();

    if (recipesWithoutCanonical > 0) {
      issues.push(`${recipesWithoutCanonical} recipes missing canonicalUrl field in database`);
      recommendations.push('Run: node scripts/fix-canonical-urls.js to add canonical URLs to all recipes');
    }

    // 2. Check for duplicate slugs
    console.log('🔍 Checking for duplicate recipe slugs...');
    const duplicateSlugs = await db.collection('recipes_new').aggregate([
      { $match: { publishedAt: { $exists: true } } },
      { $group: { _id: '$slug', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicateSlugs.length > 0) {
      issues.push(`${duplicateSlugs.length} duplicate recipe slugs found`);
      console.log('Duplicate slugs:', duplicateSlugs.map(d => d._id));
      recommendations.push('Fix duplicate slugs by adding unique suffixes');
    }

    // 3. Check for recipes with missing SEO data
    console.log('📊 Auditing recipe SEO metadata...');
    const recipesWithoutSEO = await db.collection('recipes_new').find({
      publishedAt: { $exists: true },
      $or: [
        { 'seo.metaTitle': { $exists: false } },
        { 'seo.metaDescription': { $exists: false } },
        { 'seo.keywords': { $exists: false } }
      ]
    }).count();

    if (recipesWithoutSEO > 0) {
      issues.push(`${recipesWithoutSEO} recipes missing SEO metadata`);
      recommendations.push('Run: node scripts/optimize-seo.js to generate SEO metadata');
    }

    // 4. Check categories without recipes
    console.log('📂 Auditing categories...');
    const categories = await db.collection('categories_new').find({ isActive: true }).toArray();
    const emptyCategoriesCount = [];

    for (const category of categories) {
      const recipeCategoryPath = `receptai/${category.path}`;
      const recipeCount = await db.collection('recipes_new').countDocuments({
        $or: [
          { primaryCategoryPath: recipeCategoryPath },
          { secondaryCategories: { $in: [recipeCategoryPath] } }
        ],
        publishedAt: { $exists: true }
      });

      if (recipeCount === 0) {
        emptyCategoriesCount.push(category.slug);
      }
    }

    if (emptyCategoriesCount.length > 0) {
      issues.push(`${emptyCategoriesCount.length} active categories have no recipes`);
      recommendations.push('Deactivate empty categories or add recipes to them');
    }

    // 5. Check for recipes with problematic URLs
    console.log('🔗 Checking for URL issues...');
    const recipesWithLongSlugs = await db.collection('recipes_new').find({
      publishedAt: { $exists: true },
      $expr: { $gt: [{ $strLenCP: '$slug' }, 60] }
    }).count();

    if (recipesWithLongSlugs > 0) {
      issues.push(`${recipesWithLongSlugs} recipes have slugs longer than 60 characters`);
      recommendations.push('Shorten long slugs for better SEO');
    }

    // 6. Check sitemap coverage
    console.log('🗺️ Checking sitemap coverage...');
    const totalPublishedRecipes = await db.collection('recipes_new').countDocuments({
      publishedAt: { $exists: true }
    });

    const categoriesWithRecipes = categories.filter(async (category) => {
      const recipeCategoryPath = `receptai/${category.path}`;
      const count = await db.collection('recipes_new').countDocuments({
        $or: [
          { primaryCategoryPath: recipeCategoryPath },
          { secondaryCategories: { $in: [recipeCategoryPath] } }
        ],
        publishedAt: { $exists: true }
      });
      return count > 0;
    });

    const expectedSitemapUrls = totalPublishedRecipes + categoriesWithRecipes.length + 2; // +2 for static pages

    console.log(`Expected sitemap URLs: ${expectedSitemapUrls}`);
    recommendations.push(`Verify sitemap.xml contains ${expectedSitemapUrls} URLs`);

    await client.close();

    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📋 SEO AUDIT REPORT');
    console.log('='.repeat(60));

    if (issues.length === 0) {
      console.log('✅ No critical SEO issues found!');
    } else {
      console.log('❌ ISSUES FOUND:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log('\n🔧 RECOMMENDATIONS:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    console.log('\n📊 STATISTICS:');
    console.log(`Total published recipes: ${totalPublishedRecipes}`);
    console.log(`Active categories: ${categories.length}`);
    console.log(`Categories with recipes: ${categories.length - emptyCategoriesCount.length}`);

    console.log('\n🚀 NEXT STEPS FOR GOOGLE INDEXING:');
    console.log('1. Fix all issues listed above');
    console.log('2. Deploy changes to production');
    console.log('3. Run: node scripts/submit-to-google.js');
    console.log('4. Submit URLs to Google Search Console');
    console.log('5. Monitor indexing status for 48-72 hours');
    console.log('6. Resubmit any failed URLs');

    return {
      issues,
      recommendations,
      stats: {
        totalRecipes: totalPublishedRecipes,
        totalCategories: categories.length,
        emptyCategoriesCount: emptyCategoriesCount.length
      }
    };

  } catch (error) {
    console.error('❌ SEO audit failed:', error);
    throw error;
  }
}

// Run the audit
if (require.main === module) {
  runSEOAudit()
    .then(() => {
      console.log('\n🎉 SEO audit completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { runSEOAudit };
