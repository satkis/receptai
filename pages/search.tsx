import Head from 'next/head';
import Layout from '@/components/Layout';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchPage() {
  console.log('Search page rendered');

  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', query);
    // Search functionality will be added later
  };

  return (
    <>
      <Head>
        <title>Paieška - Paragaujam.lt</title>
        <meta name="description" content="Ieškokite receptų pagal pavadinimą, ingredientus ar kategorijas" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Paieška
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                  Ieškokite receptų pagal pavadinimą, ingredientus ar kategorijas
                </p>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Įveskite receptą, ingredientą ar kategoriją..."
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors duration-200"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
                    >
                      Ieškoti
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Paieška netrukus
                </h2>
                <p className="text-gray-600 mb-6">
                  Šiuo metu kuriame pažangų paieškos variklį. Netrukus galėsite ieškoti:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="p-6 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Pagal pavadinimą</h3>
                    <p className="text-gray-600 text-sm">Ieškokite receptų pagal tikslų pavadinimą</p>
                  </div>
                  
                  <div className="p-6 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Pagal ingredientus</h3>
                    <p className="text-gray-600 text-sm">Raskite receptus pagal turimus ingredientus</p>
                  </div>
                  
                  <div className="p-6 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Pagal kategorijas</h3>
                    <p className="text-gray-600 text-sm">Filtruokite pagal patiekalų tipus</p>
                  </div>
                </div>

                {query && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      Ieškote: <span className="font-medium">"{query}"</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Paieškos funkcionalumas bus pridėtas netrukus
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
