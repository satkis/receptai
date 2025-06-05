import Head from 'next/head';
import NewRecipeCard from '@/components/NewRecipeCard';
import { newSampleRecipes } from '@/data/newSampleRecipes';


export default function NewRecipes() {
  console.log('New Recipes page rendered');

  return (
    <>
      <Head>
        <title>Receptai - Paragaujam.lt</title>
        <meta name="description" content="Atraskite geriausius lietuviškus receptus. Nuo tradicinių patiekalų iki modernių interpretacijų." />
        <meta property="og:title" content="Receptai - Paragaujam.lt" />
        <meta property="og:description" content="Atraskite geriausius lietuviškus receptus. Nuo tradicinių patiekalų iki modernių interpretacijų." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100">

          {/* Custom Groups - Sticky below header */}
          <div className="bg-gray-50 border-b border-gray-200 py-3 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2">
                {['viskas', 'valgome sveikiau!', 'karštį patiekalai', 'sriubos', 'užkandžiai', 'pyragai, kepiniai', 'salotos, mišrainės'].map((group, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-full transition-colors"
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Layout with Sidebar Space */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              
              {/* Left Sidebar - Desktop Only (for ads) */}
              <div className="hidden xl:block w-64 flex-shrink-0">
                <div className="sticky top-32 space-y-4">
                  {/* Ad Space 1 */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 h-64 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-sm font-medium">Advertisement</div>
                      <div className="text-xs">300x250</div>
                    </div>
                  </div>

                  {/* Ad Space 2 */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 h-64 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-sm font-medium">Advertisement</div>
                      <div className="text-xs">300x250</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">

                {/* Recipe Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {newSampleRecipes.map((recipe) => (
                    <NewRecipeCard 
                      key={recipe._id?.toString()} 
                      recipe={recipe}
                      variant="grid"
                    />
                  ))}
                </div>

                {/* Featured Collection Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Rekomenduojami receptai</h2>
                    <button className="text-orange-600 hover:text-orange-700 font-medium">
                      Žiūrėti visus
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {newSampleRecipes.slice(0, 2).map((recipe) => (
                      <NewRecipeCard 
                        key={`featured-${recipe._id?.toString()}`} 
                        recipe={recipe}
                        variant="featured"
                      />
                    ))}
                  </div>
                </div>

                {/* Load More Button */}
                <div className="text-center">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg transition-colors">
                    Rodyti daugiau receptų
                  </button>
                </div>
              </div>

              {/* Right Sidebar - Desktop Only (for ads) */}
              <div className="hidden xl:block w-64 flex-shrink-0">
                <div className="sticky top-32 space-y-4">
                  {/* Ad Space 3 */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 h-64 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-sm font-medium">Advertisement</div>
                      <div className="text-xs">300x250</div>
                    </div>
                  </div>
                  
                  {/* Newsletter Signup */}
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white">
                    <h3 className="font-bold text-lg mb-2">Savaitės receptai</h3>
                    <p className="text-sm mb-4 text-orange-100">
                      Gaukite naujus receptus į savo el. paštą kas savaitę.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Jūsų el. paštas"
                        className="w-full px-3 py-2 rounded-lg text-gray-900 text-sm"
                      />
                      <button className="w-full bg-white text-orange-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Prenumeruoti
                      </button>
                    </div>
                  </div>
                  
                  {/* Ad Space 4 */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 h-64 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-sm font-medium">Advertisement</div>
                      <div className="text-xs">300x250</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Ad Banner */}
          <div className="xl:hidden mt-8 px-4">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 h-24 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-sm font-medium">Mobile Advertisement</div>
                <div className="text-xs">320x50</div>
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-16"></div>
        </div>
    </>
  );
}
