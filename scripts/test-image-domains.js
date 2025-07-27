#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🖼️  Testing image domain configuration...');

// Read video data to check thumbnail URLs
const videosPath = path.join(process.cwd(), 'data/videos.json');
let videoData = {};

try {
  videoData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
} catch (error) {
  console.error('❌ Error reading videos.json:', error.message);
  process.exit(1);
}

// Extract all thumbnail URLs
const thumbnailUrls = [];

function extractThumbnails(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(extractThumbnails);
  } else if (obj && typeof obj === 'object') {
    if (obj.thumbnail) {
      thumbnailUrls.push(obj.thumbnail);
    }
    Object.values(obj).forEach(extractThumbnails);
  }
}

extractThumbnails(videoData);

console.log(`📊 Found ${thumbnailUrls.length} thumbnail URLs`);

// Analyze domains
const domainCounts = {};
const invalidUrls = [];

thumbnailUrls.forEach(url => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  } catch (error) {
    invalidUrls.push(url);
  }
});

console.log('\n📈 Domain statistics:');
Object.entries(domainCounts)
  .sort(([,a], [,b]) => b - a)
  .forEach(([domain, count]) => {
    console.log(`  ${domain}: ${count} images`);
  });

if (invalidUrls.length > 0) {
  console.log('\n❌ Invalid URLs found:');
  invalidUrls.forEach(url => console.log(`  ${url}`));
}

// Read next.config.js to check configured domains
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
let configuredDomains = [];

try {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  const domainMatches = configContent.match(/'([^']+)'/g);
  if (domainMatches) {
    configuredDomains = domainMatches
      .map(match => match.replace(/'/g, ''))
      .filter(domain => domain.includes('.'));
  }
} catch (error) {
  console.error('❌ Error reading next.config.js:', error.message);
}

console.log(`\n⚙️  Configured domains in next.config.js: ${configuredDomains.length}`);

// Check for missing domains
const usedDomains = Object.keys(domainCounts);
const missingDomains = usedDomains.filter(domain => !configuredDomains.includes(domain));

if (missingDomains.length > 0) {
  console.log('\n⚠️  Domains used but not configured:');
  missingDomains.forEach(domain => {
    console.log(`  ${domain} (${domainCounts[domain]} images)`);
  });
  
  console.log('\n💡 Add these domains to next.config.js:');
  missingDomains.forEach(domain => {
    console.log(`      '${domain}',`);
  });
} else {
  console.log('\n✅ All used domains are properly configured!');
}

// Test YouTube thumbnail patterns
const youtubeUrls = thumbnailUrls.filter(url => 
  url.includes('youtube.com') || url.includes('ytimg.com')
);

console.log(`\n📺 YouTube thumbnails: ${youtubeUrls.length}`);

if (youtubeUrls.length > 0) {
  console.log('YouTube URL patterns:');
  const patterns = {};
  youtubeUrls.forEach(url => {
    try {
      const urlObj = new URL(url);
      const pattern = `${urlObj.hostname}${urlObj.pathname.split('/').slice(0, -1).join('/')}`;
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    } catch (error) {
      console.log(`  Invalid YouTube URL: ${url}`);
    }
  });
  
  Object.entries(patterns).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count} images`);
  });
}

console.log('\n🎯 Image domain configuration test complete!');