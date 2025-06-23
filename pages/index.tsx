import Head from 'next/head';
import Link from 'next/link';

interface HomeProps {
  totalRecipes: number;
}

export default function Home({ totalRecipes }: HomeProps) {

  return (
    <>
      <Head>
        <title>Ragaujam.lt - Geriausi lietuviški receptai</title>
        <meta name="description" content="Atraskite geriausius lietuviškus receptus - nuo tradicinių patiekalų iki modernių kulinarijos sprendimų." />
        <meta name="keywords" content="lietuviški receptai, tradiciniai patiekalai, virtuvė, maistas, receptų svetainė" />
        <link rel="canonical" href="https://ragaujam.lt/" />

        {/* Open Graph */}
        <meta property="og:title" content="Paragaujam.lt - Geriausi lietuviški receptai" />
        <meta property="og:description" content="Atraskite geriausius lietuviškus receptus su nuotraukomis ir detaliais aprašymais." />
        <meta property="og:url" content="https://paragaujam.lt/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://paragaujam.lt/images/og-image.jpg" />

        {/* SearchAction Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://ragaujam.lt/",
              "name": "Ragaujam.lt",
              "description": "Geriausi lietuviški receptai su nuotraukomis ir instrukcijomis",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://ragaujam.lt/paieska?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-50 via-white to-green-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Geriausi{' '}
                    <span className="text-orange-500">lietuviški</span>{' '}
                    receptai
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Atraskite tradicinių ir modernių patiekalų receptus su interaktyviomis funkcijomis.
                    Ruoškite skaniai ir lengvai!
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-lg">👨‍🍳</span>
                    <span>100+ receptų</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-lg">⏱️</span>
                    <span>Žingsnis po žingsnio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-lg">👥</span>
                    <span>Bendruomenės vertinimai</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                    <input
                      type="text"
                      placeholder="Ieškoti receptų..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500">Populiaru:</span>
                    {['Cepelinai', 'Šaltibarščiai', 'Kugelis', 'Kibinai'].map((tag) => (
                      <Link
                        key={tag}
                        href={`/paieska?q=${encodeURIComponent(tag)}`}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200 cursor-pointer"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-orange-100 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl text-orange-500 block mb-4">👨‍🍳</span>
                    <p className="text-orange-700 font-medium">Lietuviški patiekalai</p>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl text-orange-500">⭐</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">4.8/5</div>
                      <div className="text-sm text-gray-500">Vidutinis įvertinimas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Receptų kategorijos
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Raskite receptus pagal jūsų mėgstamą patiekalų tipą
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Pirmieji patiekalai', 'Antrieji patiekalai', 'Saldumynai', 'Užkandžiai', 'Gėrimai', 'Salotos'].map((category) => (
                <Link
                  key={category}
                  href="/receptai"
                  className="bg-orange-100 text-orange-800 hover:bg-orange-200 p-6 rounded-xl text-center transition-all duration-200 hover:scale-105 hover:shadow-md group cursor-pointer block"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white/50 rounded-lg group-hover:bg-white/80 transition-colors duration-200">
                      <span className="text-3xl">👨‍🍳</span>
                    </div>
                    <span className="font-medium text-sm">{category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="py-16 bg-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Prisijunkite prie mūsų kulinarijos bendruomenės
              </h2>
              <p className="text-xl text-orange-100">
                Išsaugokite mėgstamus receptus, kurkite apsipirkimo sąrašus ir dalinkitės savo kulinarijos patirtimi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="bg-white text-orange-500 hover:bg-gray-100 font-medium px-8 py-3 rounded-lg transition-colors duration-200"
                >
                  Registruotis nemokamai
                </Link>
                <Link
                  href="/receptai"
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-500 font-medium px-8 py-3 rounded-lg transition-colors duration-200"
                >
                  Naršyti receptus
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Option 2: Server-side redirect (uncomment if you want to use this instead of next.config.js)
// export async function getServerSideProps() {
//   return {
//     redirect: {
//       destination: '/receptai',
//       permanent: true, // 301 redirect
//     },
//   };
// }

export async function getStaticProps() {
  return {
    props: {
      totalRecipes: 100,
    },
    revalidate: 3600, // Revalidate every hour
  };
}
