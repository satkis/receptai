// Test page for S3 image integration
import Head from 'next/head';
import PlaceholderImage from '../components/ui/PlaceholderImage';
import { createRecipeImage } from '../utils/s3-images';

export default function TestS3() {
  // Test with your uploaded S3 image
  const testImage = createRecipeImage(
    'image-test.png',
    'Test S3 image for Lithuanian recipe website',
    1200,
    800
  );

  return (
    <>
      <Head>
        <title>S3 Image Test - Paragaujam.lt</title>
        <meta name="description" content="Testing S3 image integration" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            S3 Image Integration Test
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Test Image from S3 Bucket
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Priority Image (loads immediately) */}
              <div>
                <h3 className="text-lg font-medium mb-4">Priority Image (Hero)</h3>
                <PlaceholderImage
                  src={testImage}
                  priority={true}
                  className="rounded-lg shadow-md"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Lazy Loaded Image */}
              <div>
                <h3 className="text-lg font-medium mb-4">Lazy Loaded Image</h3>
                <PlaceholderImage
                  src={testImage}
                  priority={false}
                  className="rounded-lg shadow-md"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Image Details */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Image Details:</h3>
              <pre className="text-sm text-gray-600 overflow-x-auto">
                {JSON.stringify(testImage, null, 2)}
              </pre>
            </div>

            {/* Test with Legacy Format */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Legacy Format Test</h3>
              <PlaceholderImage
                src="https://receptu-images.s3.eu-north-1.amazonaws.com/image-test.png"
                alt="Legacy format test"
                width={600}
                height={400}
                className="rounded-lg shadow-md"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>

            {/* Performance Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-blue-800">
                Performance Features:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Next.js Image optimization enabled</li>
                <li>✅ Automatic WebP/AVIF conversion</li>
                <li>✅ Blur placeholders for better UX</li>
                <li>✅ Responsive image sizes</li>
                <li>✅ Priority loading for above-the-fold images</li>
                <li>✅ Lazy loading for below-the-fold images</li>
                <li>✅ SEO-optimized alt text</li>
              </ul>
            </div>

            {/* S3 Configuration */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-green-800">
                S3 Configuration:
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li><strong>Bucket:</strong> receptu-images</li>
                <li><strong>Region:</strong> eu-north-1 (Stockholm)</li>
                <li><strong>URL:</strong> https://receptu-images.s3.eu-north-1.amazonaws.com/</li>
                <li><strong>Public Access:</strong> Enabled</li>
                <li><strong>CDN Ready:</strong> Yes (future CloudFront integration)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
