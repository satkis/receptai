import { useState } from 'react';
import Image from 'next/image';
import { generateRecipeImageUrl, generateStaticImageUrl } from '../utils/s3-images';

export default function DebugImages() {
  const [imageStatus, setImageStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const testImages = [
    {
      name: 'Recipe Image (toskanietiska-pupelius-sriuba.jpg)',
      url: generateRecipeImageUrl('toskanietiska-pupelius-sriuba.jpg'),
      type: 'recipe'
    },
    {
      name: 'Direct S3 URL',
      url: 'https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/toskanietiska-pupelius-sriuba.jpg',
      type: 'direct'
    },
    {
      name: 'Static Logo (if exists)',
      url: generateStaticImageUrl('logo.png'),
      type: 'static'
    }
  ];

  const handleImageLoad = (url: string) => {
    setImageStatus(prev => ({ ...prev, [url]: 'success' }));
  };

  const handleImageError = (url: string) => {
    setImageStatus(prev => ({ ...prev, [url]: 'error' }));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">S3 Image Debug Page</h1>
      
      <div className="space-y-8">
        {testImages.map((image, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{image.name}</h2>
            <p className="text-sm text-gray-600 mb-4 break-all">{image.url}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Next.js Image Component */}
              <div>
                <h3 className="font-medium mb-2">Next.js Image Component</h3>
                <div className="relative w-64 h-48 border">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                    onLoad={() => handleImageLoad(`nextjs-${image.url}`)}
                    onError={() => handleImageError(`nextjs-${image.url}`)}
                  />
                </div>
                <p className="text-sm mt-2">
                  Status: {imageStatus[`nextjs-${image.url}`] || 'loading'}
                </p>
              </div>

              {/* Regular img tag */}
              <div>
                <h3 className="font-medium mb-2">Regular img tag</h3>
                <div className="w-64 h-48 border">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad(`img-${image.url}`)}
                    onError={() => handleImageError(`img-${image.url}`)}
                  />
                </div>
                <p className="text-sm mt-2">
                  Status: {imageStatus[`img-${image.url}`] || 'loading'}
                </p>
              </div>
            </div>

            {/* Direct link test */}
            <div className="mt-4">
              <a 
                href={image.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Open image directly in new tab
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="space-y-2 text-sm">
          <p><strong>S3 Bucket:</strong> receptu-images</p>
          <p><strong>Region:</strong> eu-north-1</p>
          <p><strong>Recipe Folder:</strong> receptai/</p>
          <p><strong>Static Folder:</strong> static/</p>
          <p><strong>Base URL:</strong> https://receptu-images.s3.eu-north-1.amazonaws.com</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Check if images load with regular img tags</li>
          <li>Check if images load with Next.js Image component</li>
          <li>Verify S3 bucket permissions (public read access)</li>
          <li>Check CORS configuration on S3 bucket</li>
          <li>Verify next.config.js remotePatterns configuration</li>
          <li>Check browser console for any errors</li>
        </ol>
      </div>
    </div>
  );
}
