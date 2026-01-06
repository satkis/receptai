import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';

export default function Kontaktai() {
  return (
    <>
      <Head>
        <title>Kontaktai - Ragaujam.lt</title>
        <meta name="description" content="Susisiekite su Ragaujam.lt komanda. Turite klausimų ar pasiūlymų? Rašykite mums!" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ragaujam.lt/kontaktai" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Kontaktai</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Susisiekite su mumis</h2>
            <p className="text-gray-700">
              Turite klausimų apie mūsų svetainę, norite pasiūlyti receptą arba pranešti apie problemą? 
              Mes norėtume išgirsti jūsų nuomonę!
            </p>
          </section>

          <section className="bg-orange-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">El. paštas</h2>
            <p className="text-gray-700">
              Savo klausimus ir pasiūlymus siųskite adresu:
            </p>
            <p className="text-lg font-semibold text-orange-600 mt-2">
              info@ragaujam.lt
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dažnai užduodami klausimai</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Kaip pasiūlyti savo receptą?</h3>
                <p className="text-gray-700">Rašykite mums el. paštu su receptu ir nuotrauka.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ar galiu naudoti receptus komerciniams tikslams?</h3>
                <p className="text-gray-700">Prašome susisiekti su mumis dėl licencijos klausimų.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Kaip pranešti apie klaidą recepte?</h3>
                <p className="text-gray-700">Rašykite mums el. paštu su detaliais aprašymu.</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <Link 
              href="/receptai"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Grįžti prie receptų
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 86400, // Revalidate once per day
  };
};

