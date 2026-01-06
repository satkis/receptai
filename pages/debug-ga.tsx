import { GetStaticProps } from 'next';

export default function DebugGA() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Google Analytics Debug</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Environment Variables:</h2>
        <p><strong>NEXT_PUBLIC_GA_ID:</strong> {gaId || '❌ NOT SET'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Browser Console Check:</h2>
        <p>Open DevTools (F12) → Console and check for:</p>
        <ul>
          <li>window.dataLayer - should exist</li>
          <li>window.gtag - should exist</li>
          <li>Network tab → search for "gtag" or "googletagmanager"</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Test GA Tracking:</h2>
        <button 
          onClick={() => {
            // @ts-expect-error gtag is loaded dynamically
            if (window.gtag) {
              // @ts-expect-error gtag is loaded dynamically
              window.gtag('event', 'test_event', {
                'event_category': 'test',
                'event_label': 'debug_page',
                'value': 1
              });
              alert('✅ Test event sent! Check Google Analytics in 1-2 minutes');
            } else {
              alert('❌ gtag not loaded');
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Send Test Event to GA
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
        <h2>⚠️ Common Issues:</h2>
        <ul>
          <li>GA_ID not set in Vercel environment variables</li>
          <li>Ad blockers blocking Google Analytics</li>
          <li>GA property not properly configured</li>
          <li>GA4 property ID format (should start with G-)</li>
          <li>Vercel deployment not updated with new env vars</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e3f2fd' }}>
        <h2>✅ Solution Steps:</h2>
        <ol>
          <li>Go to Vercel Dashboard → Settings → Environment Variables</li>
          <li>Verify NEXT_PUBLIC_GA_ID = G-1HNHCXHF82 exists</li>
          <li>Redeploy: Click "Redeploy" button in Deployments</li>
          <li>Wait 5 minutes for deployment</li>
          <li>Clear browser cache (Ctrl+Shift+Delete)</li>
          <li>Visit this page again</li>
          <li>Check if GA_ID shows above</li>
        </ol>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 60, // Revalidate every minute for debugging
  };
};

