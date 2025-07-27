#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning video data...');

const videosPath = path.join(process.cwd(), 'data', 'videos.json');
let videoData = {};

try {
  videoData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
} catch (error) {
  console.error('❌ Error reading videos.json:', error.message);
  process.exit(1);
}

// Function to clean Chinese characters from text
function cleanChineseText(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  // Remove Chinese characters
  let cleaned = text.replace(/[\u4e00-\u9fff]/g, '');
  
  // Remove Chinese punctuation
  cleaned = cleaned.replace(/[，。！？；：""''（）【】]/g, '');
  
  // Clean up social media references
  cleaned = cleaned.replace(/微博：[^\n]*\n?/g, '');
  cleaned = cleaned.replace(/B站：[^\n]*\n?/g, '');
  cleaned = cleaned.replace(/微信公众号：[^\n]*\n?/g, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove empty parentheses
  cleaned = cleaned.replace(/\(\s*\)/g, '');
  cleaned = cleaned.replace(/\[\s*\]/g, '');
  
  return cleaned;
}

// Function to clean duration format
function cleanDuration(duration) {
  if (!duration || typeof duration !== 'string') {
    return duration;
  }
  
  // Replace Chinese "秒" with "s"
  return duration.replace(/秒/g, 's');
}

// Function to clean video object
function cleanVideoObject(video) {
  if (!video || typeof video !== 'object') {
    return video;
  }
  
  const cleaned = { ...video };
  
  // Clean text fields
  if (cleaned.title) {
    cleaned.title = cleanChineseText(cleaned.title);
  }
  
  if (cleaned.description) {
    cleaned.description = cleanChineseText(cleaned.description);
  }
  
  if (cleaned.duration) {
    cleaned.duration = cleanDuration(cleaned.duration);
  }
  
  // Clean tags array
  if (Array.isArray(cleaned.tags)) {
    cleaned.tags = cleaned.tags
      .map(tag => cleanChineseText(tag))
      .filter(tag => tag && tag.length > 0);
  }
  
  return cleaned;
}

// Function to recursively clean data structure
function cleanDataStructure(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanDataStructure(item));
  } else if (obj && typeof obj === 'object') {
    // Check if this looks like a video object
    if (obj.title && obj.thumbnail) {
      return cleanVideoObject(obj);
    } else {
      // Recursively clean nested objects
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = cleanDataStructure(value);
      }
      return cleaned;
    }
  }
  return obj;
}

// Clean the video data
console.log('🔄 Processing video data...');
const cleanedData = cleanDataStructure(videoData);

// Count changes
let changeCount = 0;
function countChanges(original, cleaned) {
  if (Array.isArray(original) && Array.isArray(cleaned)) {
    for (let i = 0; i < Math.min(original.length, cleaned.length); i++) {
      countChanges(original[i], cleaned[i]);
    }
  } else if (original && cleaned && typeof original === 'object' && typeof cleaned === 'object') {
    for (const key of Object.keys(original)) {
      if (typeof original[key] === 'string' && typeof cleaned[key] === 'string') {
        if (original[key] !== cleaned[key]) {
          changeCount++;
          console.log(`  📝 Changed: "${original[key]}" → "${cleaned[key]}"`);
        }
      } else {
        countChanges(original[key], cleaned[key]);
      }
    }
  }
}

countChanges(videoData, cleanedData);

// Create backup
const backupPath = path.join(process.cwd(), 'data', `videos-backup-${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(videoData, null, 2));
console.log(`💾 Backup created: ${backupPath}`);

// Write cleaned data
fs.writeFileSync(videosPath, JSON.stringify(cleanedData, null, 2));

console.log(`✅ Video data cleaned successfully!`);
console.log(`📊 Total changes made: ${changeCount}`);

// Verify the cleaning
console.log('\n🔍 Verifying cleaned data...');
const verifyData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

let chineseCharCount = 0;
function countChineseChars(obj) {
  if (typeof obj === 'string') {
    const matches = obj.match(/[\u4e00-\u9fff]/g);
    if (matches) {
      chineseCharCount += matches.length;
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(countChineseChars);
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach(countChineseChars);
  }
}

countChineseChars(verifyData);

if (chineseCharCount === 0) {
  console.log('✅ No Chinese characters found in cleaned data!');
} else {
  console.log(`⚠️  Still found ${chineseCharCount} Chinese characters`);
}

console.log('🎯 Video data cleaning complete!');