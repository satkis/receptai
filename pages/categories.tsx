import Head from 'next/head';


export default function Categories() {
  console.log('Categories page rendered');

  const categories = [
    { name: 'Pirmieji patiekalai', count: 0, description: 'Sriubos, sultiniai ir kiti pirmieji patiekalai' },
    { name: 'Antrieji patiekalai', count: 0, description: 'Mėsos, žuvies ir daržovių patiekalai' },
    { name: 'Saldumynai', count: 0, description: 'Tortai, pyragaičiai ir kiti deserti' },
    { name: 'Užkandžiai', count: 0, description: 'Greiti ir skanūs užkandžiai' },
    { name: 'Gėrimai', count: 0, description: 'Kokteiliai, arbatos ir kiti gėrimai' },
    { name: 'Duona ir kepiniai', count: 0, description: 'Duonos, bandelių ir kitų kepinių receptai' },
  ];

  return (
    <>
      <Head>
        <title>Kategorijos - Paragaujam.lt</title>
        <meta name="description" content="Receptų kategorijos - raskite tai, ko ieškote" />
      </Head>

      <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Kategorijos
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Raskite receptus pagal kategorijas - nuo pirmųjų patiekalų iki saldumynų
                </p>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 cursor-pointer"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.count} receptai
                    </span>
                    <span className="text-orange-500 text-sm font-medium">
                      Netrukus →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon Message */}
            <div className="text-center mt-12">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Kategorijos netrukus
                </h2>
                <p className="text-gray-600">
                  Šiuo metu kuriame išsamų kategorijų sistemą, kad galėtumėte lengvai rasti norimų receptų.
                </p>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
