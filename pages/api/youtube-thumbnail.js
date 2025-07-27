// YouTube thumbnail proxy API
export default async function handler(req, res) {
  const { videoId, quality = 'hqdefault' } = req.query;
  
  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }
  
  try {
    // Try different YouTube thumbnail URLs
    const thumbnailUrls = [
      `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`,
      `https://img.youtube.com/vi/${videoId}/${quality}.jpg`,
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/default.jpg`
    ];
    
    for (const url of thumbnailUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          return res.send(Buffer.from(buffer));
        }
      } catch (error) {
        console.warn(`Failed to fetch thumbnail from ${url}:`, error.message);
        continue;
      }
    }
    
    // If all fail, return placeholder
    return res.redirect('/images/video-placeholder.svg');
    
  } catch (error) {
    console.error('YouTube thumbnail proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch thumbnail' });
  }
}
