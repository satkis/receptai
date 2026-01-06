import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';

export default function ApieMus() {
  return (
    <>
      <Head>
        <title>Apie mus - Ragaujam.lt</title>
        <meta name="description" content="Sužinokite apie Ragaujam.lt - Lietuvos receptų portalą su tūkstančiais skaniųjų patiekalų receptų." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ragaujam.lt/apie-mus" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Apie mus</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kas yra Ragaujam.lt?</h2>
            <p className="text-gray-700">
              Ragaujam.lt yra Lietuvos receptų portalas, skirtas tiems, kurie mėgsta gaminti ir dalintis savo kulinariniais atradimais. 
              Mūsų misija - padaryti lietuvišką virtuvę prieinamą ir įdomią visiems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mūsų tikslas</h2>
            <p className="text-gray-700">
              Sukaupti didžiausią lietuviškų receptų kolekciją ir padėti jums atrasti naujus mėgstamus patiekalus. 
              Nuo tradicinių lietuviškų patiekalų iki tarptautinės virtuvės - viskas čia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kodėl pasirinkti mus?</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Tūkstančiai patikrintų receptų</li>
              <li>Greitai veikianti ir patogi svetainė</li>
              <li>Detaliūs receptai su nuotraukomis</li>
              <li>Paieška pagal ingredientus ir kategorijas</li>
              <li>Nemogas naudojimas</li>
            </ul>
          </section>

          <section className="bg-orange-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Susisiekite su mumis</h2>
            <p className="text-gray-700 mb-4">
              Turite klausimų ar pasiūlymų? Norėtumėte pasiūlyti savo receptą?
            </p>
            <Link 
              href="/kontaktai"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Susisiekite su mumis
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

