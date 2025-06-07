import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { sampleRecipes } from '@/data/sampleRecipes';
import { Clock, Users, Star, ChefHat } from 'lucide-react';

export default function Recipes() {
  console.log('Recipes page rendered');

  return (
    <>
      <Head>
        <title>Receptai - Paragaujam.lt</title>
        <meta name="description" content="Visi lietuviški receptai vienoje vietoje" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Receptai
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Atraskite geriausius lietuviškus receptus - nuo tradicinių patiekalų iki modernių kulinarijos sprendimų
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleRecipes.map((recipe) => (
                <Link key={recipe._id?.toString()} href={`/recipes/${recipe.slug}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
                    {/* Recipe Image */}
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={recipe.image}
                        alt={typeof recipe.title === 'string' ? recipe.title : recipe.title.lt}
                        className="w-full h-full object-cover"
                      />

                      {/* Difficulty Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {recipe.difficulty === 'easy' ? 'Lengvas' :
                           recipe.difficulty === 'medium' ? 'Vidutinis' : 'Sunkus'}
                        </span>
                      </div>
                    </div>

                    {/* Recipe Content */}
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                        {typeof recipe.title === 'string' ? recipe.title : recipe.title.lt}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {typeof recipe.description === 'string' ? recipe.description : recipe.description.lt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.totalTime < 60 ? `${recipe.totalTime} min` : `${Math.floor(recipe.totalTime / 60)}h ${recipe.totalTime % 60 > 0 ? `${recipe.totalTime % 60}min` : ''}`}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{recipe.servings}</span>
                          </div>
                        </div>

                        {/* Rating */}
                        {recipe.averageRating && recipe.averageRating > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{recipe.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Author */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <ChefHat className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{recipe.author.name}</span>
                        </div>

                        <span className="text-xs text-gray-500">{recipe.category}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
