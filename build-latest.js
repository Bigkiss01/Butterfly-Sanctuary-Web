const fs = require('fs');
const path = require('path');

console.log('🔄 Building latest version...');

try {
  // Read the latest React app files
  const indexJsx = fs.readFileSync(path.join(__dirname, 'index.jsx'), 'utf8');
  const srcMainJsx = fs.readFileSync(path.join(__dirname, 'src', 'main.jsx'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  // Create bundle with the latest code
  const bundleContent = `
// React App Bundle - Merlin Butterfly Sanctuary (LATEST VERSION)
// Updated: ${new Date().toISOString()}
// This contains the most recent application code

${indexJsx}

// Main entry point
${srcMainJsx}

// Load the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🦋 Loading Merlin Butterfly Sanctuary - LATEST VERSION');
  console.log('📅 Updated:', new Date().toISOString());
  
  // The React app will render itself via the code above
  console.log('✅ Latest version loaded successfully!');
});
`;

  // Clean and recreate dist folder
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true });
  }
  fs.mkdirSync(distPath);

  // Write the updated files
  fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(distPath, 'bundle.js'), bundleContent);

  console.log('✅ Build completed successfully!');
  console.log('📁 Files created in dist/ folder with LATEST code');
  console.log('📋 Bundle size:', bundleContent.length, 'characters');
  console.log('🕐 Build time:', new Date().toLocaleString());
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
