const fs = require('fs');
const path = require('path');
const { uploadImage } = require('./upload-images');

const UPLOAD_FOLDER = path.join(__dirname, '../uploads/to-upload');

// Ensure upload folder exists
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
  console.log(`📁 Created upload folder: ${UPLOAD_FOLDER}`);
}

console.log('👀 Watching for new images...');
console.log(`📁 Drop images in: ${UPLOAD_FOLDER}`);
console.log('🔄 Supported formats: .jpg, .jpeg, .png, .webp, .gif');
console.log('⏹️  Press Ctrl+C to stop\n');

// Track processed files to avoid duplicate uploads
const processedFiles = new Set();

/**
 * Check for new images and upload them
 */
function checkForNewImages() {
  try {
    const files = fs.readdirSync(UPLOAD_FOLDER)
      .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .filter(file => !processedFiles.has(file));

    for (const file of files) {
      processedFiles.add(file);
      console.log(`📷 New image detected: ${file}`);
      
      // Upload the image
      uploadImage(file)
        .then(() => {
          console.log(`✅ Upload complete: ${file}\n`);
        })
        .catch(error => {
          console.error(`❌ Upload failed for ${file}:`, error.message);
          // Remove from processed set so it can be retried
          processedFiles.delete(file);
        });
    }
  } catch (error) {
    console.error('❌ Error checking for images:', error.message);
  }
}

// Initial check
checkForNewImages();

// Watch for changes every 2 seconds
const watcher = setInterval(checkForNewImages, 2000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping image watcher...');
  clearInterval(watcher);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping image watcher...');
  clearInterval(watcher);
  process.exit(0);
});
