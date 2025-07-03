const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_LOGO = path.join(__dirname, '../public/logo/logo-square.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

// Favicon sizes to generate
const FAVICON_SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' }
];

/**
 * Generate favicon files from logo
 */
async function generateFavicons() {
  console.log('🎨 Generating favicons from logo...');
  
  if (!fs.existsSync(INPUT_LOGO)) {
    console.error(`❌ Logo file not found: ${INPUT_LOGO}`);
    console.log('💡 Please ensure logo-square.png exists in public/logo/ folder');
    return;
  }

  // Check input logo
  const metadata = await sharp(INPUT_LOGO).metadata();
  console.log(`📊 Input logo: ${metadata.width}x${metadata.height}, ${metadata.format}`);

  // Generate each favicon size
  for (const { size, name } of FAVICON_SIZES) {
    try {
      const outputPath = path.join(OUTPUT_DIR, name);
      
      await sharp(INPUT_LOGO)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png({ quality: 100 })
        .toFile(outputPath);
      
      console.log(`✅ Generated: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  // Generate ICO file (requires multiple sizes)
  try {
    const icoPath = path.join(OUTPUT_DIR, 'favicon.ico');
    
    // Create 32x32 version for ICO
    await sharp(INPUT_LOGO)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '-temp.png'));
    
    // Note: For proper ICO generation, you might want to use a dedicated library
    // For now, we'll copy the 32x32 PNG as ICO (browsers will handle it)
    fs.copyFileSync(path.join(OUTPUT_DIR, 'favicon-32x32.png'), icoPath);
    
    console.log(`✅ Generated: favicon.ico`);
  } catch (error) {
    console.error(`❌ Failed to generate favicon.ico:`, error.message);
  }

  console.log('\n🎯 Favicon generation complete!');
  console.log('📁 Generated files:');
  FAVICON_SIZES.forEach(({ name }) => {
    console.log(`   - ${name}`);
  });
  console.log('   - favicon.ico');
}

// Update site.webmanifest
async function updateWebManifest() {
  const manifestPath = path.join(OUTPUT_DIR, 'site.webmanifest');
  
  const manifest = {
    name: "Ragaujam.lt - Lietuviški receptai",
    short_name: "Ragaujam.lt",
    description: "Geriausi lietuviški receptai. Ruoškite skaniai ir lengvai kartu su mumis!",
    start_url: "/receptai",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f97316",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    categories: ["food", "lifestyle", "cooking"],
    lang: "lt",
    dir: "ltr"
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Updated site.webmanifest');
}

// Run generation
async function main() {
  try {
    await generateFavicons();
    await updateWebManifest();
    
    console.log('\n🚀 All done! Your favicons are ready for deployment.');
    console.log('💡 Test your favicons at: https://realfavicongenerator.net/favicon_checker');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateFavicons, updateWebManifest };
