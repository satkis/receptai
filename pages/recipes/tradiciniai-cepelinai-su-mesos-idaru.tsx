import Head from 'next/head';
import Layout from '@/components/Layout';
import RecipeDetail from '@/components/RecipeDetail';
import { sampleRecipes } from '@/data/sampleRecipes';

export default function CepelinaiRecipe() {
  const recipe = sampleRecipes[0]; // Cepelinai recipe

  return (
    <>
      <Head>
        <title>{recipe.seoTitle || recipe.title} - Paragaujam.lt</title>
        <meta name="description" content={recipe.seoDescription || recipe.description} />
        <meta property="og:title" content={recipe.title} />
        <meta property="og:description" content={recipe.description} />
        <meta property="og:image" content={recipe.image} />
        <meta property="og:type" content="article" />
        
        {/* Recipe structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Recipe',
              name: recipe.title,
              description: recipe.description,
              image: recipe.image,
              author: {
                '@type': 'Person',
                name: recipe.author.name,
              },
              datePublished: recipe.createdAt,
              prepTime: `PT${recipe.prepTime}M`,
              cookTime: `PT${recipe.cookTime}M`,
              totalTime: `PT${recipe.totalTime}M`,
              recipeYield: recipe.servings.toString(),
              recipeCategory: recipe.category,
              recipeCuisine: 'Lithuanian',
              keywords: recipe.tags.join(', '),
              recipeIngredient: recipe.ingredients.map(
                (ing) => `${ing.amount} ${ing.unit} ${ing.name}`
              ),
              recipeInstructions: recipe.instructions.map((inst) => ({
                '@type': 'HowToStep',
                text: inst.text,
              })),
              nutrition: {
                '@type': 'NutritionInformation',
                calories: recipe.nutrition.calories,
                proteinContent: `${recipe.nutrition.protein}g`,
                carbohydrateContent: `${recipe.nutrition.carbs}g`,
                fatContent: `${recipe.nutrition.fat}g`,
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: recipe.averageRating,
                reviewCount: recipe.totalRatings,
              },
            }),
          }}
        />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50">
          <RecipeDetail recipe={recipe} />
        </div>
      </Layout>
    </>
  );
}
