import Head from 'next/head';
import Layout from '@/components/Layout';

export default function About() {
  console.log('About page rendered');

  return (
    <>
      <Head>
        <title>Apie mus - Paragaujam.lt</title>
        <meta name="description" content="Sužinokite daugiau apie Paragaujam.lt - lietuviškų receptų bendruomenę" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Apie mus
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Paragaujam.lt - tai vieta, kur susitinka lietuviška kulinarijos tradicija ir šiuolaikiniai sprendimai
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-8">
              {/* Mission */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Mūsų misija
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Siekiame išsaugoti ir populiarinti lietuviškos kulinarijos tradiciją, kartu ją papildydami 
                  šiuolaikiniais sprendimais. Mūsų tikslas - sukurti bendruomenę, kur kiekvienas gali dalintis 
                  savo receptais ir atrasti naujų skonių.
                </p>
              </div>

              {/* Values */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Mūsų vertybės
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tradicija</h3>
                    <p className="text-gray-600 text-sm">
                      Gerbiame ir saugome lietuviškos kulinarijos paveldą
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Inovacijos</h3>
                    <p className="text-gray-600 text-sm">
                      Ieškome naujų būdų pateikti tradicinius patiekalus
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bendruomenė</h3>
                    <p className="text-gray-600 text-sm">
                      Kuriame vietą, kur visi gali dalintis ir mokytis
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Kokybė</h3>
                    <p className="text-gray-600 text-sm">
                      Siekiame aukščiausios receptų ir turinio kokybės
                    </p>
                  </div>
                </div>
              </div>

              {/* Team */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Komanda
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Paragaujam.lt komandą sudaro kulinarijos entuziastai, technologijų specialistai ir 
                  turinio kūrėjai, kurie kartu dirba, kad sukurtų geriausią lietuviškų receptų platformą.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Susisiekite su mumis
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Turite klausimų, pasiūlymų ar norite prisidėti prie projekto? Mielai išgirsite iš jūsų!
                </p>
                <div className="text-orange-500 font-medium">
                  Kontaktai netrukus bus pateikti
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
