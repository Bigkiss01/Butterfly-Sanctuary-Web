const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

try {
  // Try to build with vite
  console.log('Running vite build...');
  const output = execSync('npx vite build', { 
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('Build output:', output);
  
  // Check if dist folder exists
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Build successful! dist folder created.');
    const files = fs.readdirSync(distPath);
    console.log('Files in dist:', files);
  } else {
    console.log('❌ Build failed - no dist folder created');
  }
} catch (error) {
  console.error('Build error:', error.message);
  console.error('Error output:', error.stdout);
  console.error('Error stderr:', error.stderr);
}
