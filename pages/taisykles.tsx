import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';

export default function Taisykles() {
  return (
    <>
      <Head>
        <title>Naudojimo taisyklės - Ragaujam.lt</title>
        <meta name="description" content="Ragaujam.lt naudojimo taisyklės. Sužinokite, kaip naudotis mūsų svetaine." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ragaujam.lt/taisykles" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Naudojimo taisyklės</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bendros nuostatos</h2>
            <p className="text-gray-700">
              Naudodamiesi Ragaujam.lt svetaine, jūs sutinkate su šiomis naudojimo taisyklėmis. 
              Jei nesutinkate su bet kuria jų dalimi, prašome nenaudoti mūsų svetainės.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intelektinė nuosavybė</h2>
            <p className="text-gray-700">
              Visi receptai, tekstai, nuotraukos ir kita medžiaga svetainėje yra saugoma autorių teisėmis. 
              Jūs galite naudoti šią medžiagą asmeniniais tikslais, tačiau draudžiama ją kopijuoti ir platinti 
              be mūsų leidimo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vartotojų atsakomybė</h2>
            <p className="text-gray-700">
              Jūs atsakingi už savo naudojimąsi svetaine. Nedraudžiama:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Publikuoti žalingą arba neteisėtą turinį</li>
              <li>Pažeisti kitų žmonių privatumą</li>
              <li>Naudoti svetainę neteisėtiems tikslams</li>
              <li>Atlikti kibernetines atakas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Atsakomybės apribojimas</h2>
            <p className="text-gray-700">
              Ragaujam.lt neatsakinga už žalą, atsiradusią dėl svetainės naudojimo. 
              Visi receptai pateikiami "kaip yra" be jokių garantijų.
            </p>
          </section>

          <section className="bg-orange-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Klausimai?</h2>
            <p className="text-gray-700 mb-4">
              Jei turite klausimų apie šias taisykles, susisiekite su mumis.
            </p>
            <Link 
              href="/kontaktai"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Kontaktai
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

