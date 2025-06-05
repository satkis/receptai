import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { sampleRecipes } from '@/data/sampleRecipes';
import { Clock, Users, Star, ChefHat, Heart, Eye } from 'lucide-react';

export default function MobileRecipes() {
  console.log('Mobile Recipes page rendered');

  return (
    <>
      <Head>
        <title>Receptai (Mobile View) - Paragaujam.lt</title>
        <meta name="description" content="Visi lietuviški receptai vienoje vietoje - mobile optimized view" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100">
          {/* Mobile-First Header */}
          <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
            <div className="px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Receptai
              </h1>
              <p className="text-sm text-gray-600">
                {sampleRecipes.length} receptai rasti
              </p>
            </div>
          </div>

          {/* Mobile Recipe Stack */}
          <div className="px-4 py-4 space-y-4">
            {sampleRecipes.map((recipe) => (
              <Link key={recipe._id?.toString()} href={`/recipes/${recipe.slug}`}>
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden active:scale-[0.98] transition-transform duration-150">
                  {/* Recipe Image */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay with badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Top badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {recipe.difficulty === 'easy' ? 'Lengvas' :
                         recipe.difficulty === 'medium' ? 'Vidutinis' : 'Sunkus'}
                      </span>
                    </div>

                    {/* Bottom right stats */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-3">
                      {recipe.averageRating > 0 && (
                        <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-white text-xs font-medium">{recipe.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                        <Eye className="w-3 h-3 text-white" />
                        <span className="text-white text-xs">{recipe.views}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">
                      {recipe.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>

                    {/* Meta Info Row */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {recipe.totalTime < 60 ? `${recipe.totalTime}min` : 
                             `${Math.floor(recipe.totalTime / 60)}h ${recipe.totalTime % 60 > 0 ? `${recipe.totalTime % 60}min` : ''}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{recipe.servings}</span>
                        </div>
                      </div>
                      
                      {/* Save button */}
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Handle save logic here
                        }}
                      >
                        <Heart className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Author and Category */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 font-medium">{recipe.author.name}</span>
                      </div>
                      
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {recipe.category}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{recipe.tags.length - 3} daugiau
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile-friendly load more button */}
          <div className="px-4 py-6">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              Rodyti daugiau receptų
            </button>
          </div>

          {/* Mobile bottom spacing for safe area */}
          <div className="h-8"></div>
        </div>
      </Layout>
    </>
  );
}
