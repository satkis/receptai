import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReceptaiIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main recipes page
    router.replace('/new-recipes');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Nukreipiama...</h1>
        <p className="text-gray-600">Nukreipiama į receptų puslapį...</p>
      </div>
    </div>
  );
}
