#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎬 Creating video placeholder image...');

// Create a simple SVG placeholder
const svgContent = `<svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#F3F4F6"/>
  <circle cx="400" cy="300" r="60" fill="#D1D5DB"/>
  <path d="M380 270L380 330L430 300L380 270Z" fill="#9CA3AF"/>
  <text x="400" y="380" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="18">Video Unavailable</text>
</svg>`;

// Convert SVG to base64 data URL
const base64 = Buffer.from(svgContent).toString('base64');
const dataUrl = `data:image/svg+xml;base64,${base64}`;

// Ensure public/images directory exists
const imagesDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Write the SVG file
const svgPath = path.join(imagesDir, 'video-placeholder.svg');
fs.writeFileSync(svgPath, svgContent);

// Also create a simple HTML file to test the placeholder
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Video Placeholder Test</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .placeholder { max-width: 400px; border: 1px solid #ddd; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Video Placeholder Test</h1>
  <img src="/images/video-placeholder.svg" alt="Video Placeholder" class="placeholder" />
  <p>This is the placeholder image that will be shown when video thumbnails fail to load.</p>
</body>
</html>`;

const htmlPath = path.join(process.cwd(), 'public', 'video-placeholder-test.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ Video placeholder created successfully!');
console.log(`📁 SVG file: ${svgPath}`);
console.log(`🌐 Test page: ${htmlPath}`);
console.log('🔗 You can test it at: http://localhost:3000/video-placeholder-test.html');

// Update the placeholder path in SafeImage component if needed
const safeImagePath = path.join(process.cwd(), 'components', 'SafeImage.tsx');
if (fs.existsSync(safeImagePath)) {
  let content = fs.readFileSync(safeImagePath, 'utf8');
  
  // Replace .jpg with .svg in fallback paths
  if (content.includes('/images/video-placeholder.jpg')) {
    content = content.replace(/\/images\/video-placeholder\.jpg/g, '/images/video-placeholder.svg');
    fs.writeFileSync(safeImagePath, content);
    console.log('📝 Updated SafeImage component to use SVG placeholder');
  }
}

console.log('🎯 Video placeholder setup complete!');