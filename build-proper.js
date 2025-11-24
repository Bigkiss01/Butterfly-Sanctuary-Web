const fs = require('fs');
const path = require('path');

// Read the actual React app files
try {
  const indexJsx = fs.readFileSync(path.join(__dirname, 'index.jsx'), 'utf8');
  const srcMainJsx = fs.readFileSync(path.join(__dirname, 'src', 'main.jsx'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  // Create proper bundle with actual React code
  const bundleContent = `
// React App Bundle - Merlin Butterfly Sanctuary
// This contains the actual application code

${indexJsx}

// Main entry point
${srcMainJsx}

// For browser compatibility - load the app
if (typeof document !== 'undefined') {
  console.log('Loading Merlin Butterfly Sanctuary...');
  // The React app will render itself via main.jsx
}
`;

  // Create dist folder if it doesn't exist
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  }

  // Write the files
  fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(distPath, 'bundle.js'), bundleContent);

  console.log('✅ Build completed successfully!');
  console.log('📁 Files created in dist/ folder with latest code');
  console.log('📋 Bundle size:', bundleContent.length, 'characters');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
}
