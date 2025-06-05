import Head from 'next/head';
import { useState } from 'react';

// Simple test page without MongoDB to check if the issue is with API calls
export default function TestRecipes() {
  console.log('Test Recipes page rendered');

  const [selectedGroup, setSelectedGroup] = useState<string>('viskas');

  // Static test data
  const testGroups = [
    { id: '1', name: 'viskas', displayName: 'Viskas' },
    { id: '2', name: 'test1', displayName: 'Test Group 1' },
    { id: '3', name: 'test2', displayName: 'Test Group 2' }
  ];

  const testRecipes = [
    {
      id: '1',
      title: 'Test Recipe 1',
      description: 'Test description 1',
      image: '/images/placeholder.jpg',
      cookingTime: 30,
      servings: 4
    },
    {
      id: '2', 
      title: 'Test Recipe 2',
      description: 'Test description 2',
      image: '/images/placeholder.jpg',
      cookingTime: 45,
      servings: 6
    }
  ];

  const handleGroupChange = (groupName: string) => {
    console.log('Group changed to:', groupName);
    setSelectedGroup(groupName);
  };

  return (
    <>
      <Head>
        <title>Test Receptai - Paragaujam.lt</title>
        <meta name="description" content="Test page for debugging" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100">
        
        {/* Test Groups */}
        <div className="bg-gray-50 border-b border-gray-200 py-3 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              {testGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleGroupChange(group.name)}
                  className={`px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-full transition-colors ${
                    selectedGroup === group.name
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700'
                  }`}
                >
                  {group.displayName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Test Recipes Page
          </h1>
          
          <p className="text-gray-600 mb-4">
            Selected Group: <strong>{selectedGroup}</strong>
          </p>

          {/* Test Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {recipe.description}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>🕒 {recipe.cookingTime} min</span>
                    <span>👥 {recipe.servings} porcijos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Debug Info:</h3>
            <ul className="text-sm text-blue-800">
              <li>• This is a test page without MongoDB calls</li>
              <li>• If this page works without reloading, the issue is with the API</li>
              <li>• If this page also reloads, the issue is with React/Next.js setup</li>
              <li>• Check browser console for any errors</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
