import { useEffect, useState } from 'react';

export default function ISRDebugger() {
  const [debugInfo, setDebugInfo] = useState<{
    loadTime: number;
    cacheStatus: string;
    renderType: string;
  } | null>(null);

  useEffect(() => {
    // Only show in staging/development
    const hostname = window.location.hostname;
    const isStaging = hostname.includes('vercel.app') || 
                     hostname.includes('staging') ||
                     hostname !== 'ragaujam.lt';
    
    if (!isStaging) return;

    // Calculate page load time
    const loadTime = performance.now();
    
    // Check if page was statically generated (ISR)
    const renderType = document.querySelector('script[id="__NEXT_DATA__"]')?.textContent?.includes('"isFallback":false') 
      ? 'Static (ISR)' 
      : 'Dynamic (SSR)';

    setDebugInfo({
      loadTime: Math.round(loadTime),
      cacheStatus: 'Check Network tab for x-vercel-cache header',
      renderType
    });
  }, []);

  if (!debugInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold text-green-400 mb-2">🔍 ISR Debug Info</div>
      <div><strong>Load Time:</strong> {debugInfo.loadTime}ms</div>
      <div><strong>Render:</strong> {debugInfo.renderType}</div>
      <div><strong>Cache:</strong> {debugInfo.cacheStatus}</div>
      <div className="mt-2 text-yellow-300 text-xs">
        Open DevTools → Network → Look for "x-vercel-cache" header
      </div>
    </div>
  );
}
