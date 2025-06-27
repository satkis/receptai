import { useEffect, useState } from 'react';

export default function StagingBanner() {
  const [isStaging, setIsStaging] = useState(false);

  useEffect(() => {
    // Check if we're on a staging/preview URL
    const hostname = window.location.hostname;
    const isProduction = hostname === 'ragaujam.lt' ||
                        hostname === 'www.ragaujam.lt';
    setIsStaging(!isProduction);
  }, []);

  if (!isStaging) return null;

  return (
    <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-50">
      🚧 STAGING ENVIRONMENT - This is a test version of the website
    </div>
  );
}
