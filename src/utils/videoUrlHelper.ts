/**
 * Video URL Helper
 * Utilities for handling different video URL formats and sources
 */

export interface VideoSourceInfo {
  url: string;
  type: 'mp4' | 'hls' | 'dash' | 'iframe' | 'unknown';
  mimeType: string;
  needsProxy?: boolean;
}

/**
 * Detect video type from URL
 */
export function detectVideoType(url: string): VideoSourceInfo['type'] {
  if (!url) return 'unknown';
  
  const lowerUrl = url.toLowerCase().trim();
  
  // Check for HLS first (most common for streaming)
  if (lowerUrl.includes('.m3u8') || lowerUrl.includes('m3u8')) {
    return 'hls';
  }
  
  // Check for DASH
  if (lowerUrl.includes('.mpd')) {
    return 'dash';
  }
  
  // Check for MP4 and other video formats
  if (lowerUrl.match(/\.(mp4|mov|avi|webm|mkv)(\?|$)/)) {
    return 'mp4';
  }
  
  // Check for iframe/embedded player
  if (lowerUrl.includes('player.phimapi.com') || 
      lowerUrl.includes('/player/') || 
      lowerUrl.includes('embed')) {
    return 'iframe';
  }
  
  // Default to mp4 for direct URLs
  if (lowerUrl.startsWith('http') || lowerUrl.startsWith('https')) {
    return 'mp4';
  }
  
  return 'unknown';
}

/**
 * Get MIME type for video
 */
export function getMimeType(type: VideoSourceInfo['type']): string {
  switch (type) {
    case 'hls':
      return 'application/x-mpegURL';
    case 'dash':
      return 'application/dash+xml';
    case 'mp4':
      return 'video/mp4';
    default:
      return 'video/mp4';
  }
}

/**
 * Extract actual video URL from iframe/player URLs
 * For phimapi.com player, extract the actual m3u8 URL from query params
 */
export function extractVideoUrl(url: string): string {
  if (!url) return url;
  
  try {
    const trimmedUrl = url.trim();
    
    // Check if it's a phimapi player URL
    if (trimmedUrl.includes('player.phimapi.com')) {
      const urlObj = new URL(trimmedUrl);
      const videoUrl = urlObj.searchParams.get('url');
      if (videoUrl) {
        return decodeURIComponent(videoUrl);
      }
    }
    
    // Check for other embedded player patterns
    if (trimmedUrl.includes('/player/') || trimmedUrl.includes('embed')) {
      try {
        const urlObj = new URL(trimmedUrl);
        const videoUrl = urlObj.searchParams.get('url') || 
                        urlObj.searchParams.get('src') ||
                        urlObj.searchParams.get('video');
        if (videoUrl) {
          return decodeURIComponent(videoUrl);
        }
      } catch (e) {
        // If URL parsing fails, return original
      }
    }
    
    // Return original URL if no extraction needed
    return trimmedUrl;
  } catch (error) {
    console.error('Error extracting video URL:', error);
    return url;
  }
}

/**
 * Get complete video source information
 */
export function getVideoSourceInfo(url: string): VideoSourceInfo {
  if (!url) {
    return {
      url: '',
      type: 'unknown',
      mimeType: 'video/mp4',
      needsProxy: false,
    };
  }

  // First, try to extract actual video URL if it's embedded
  const extractedUrl = extractVideoUrl(url);
  const type = detectVideoType(extractedUrl);
  const mimeType = getMimeType(type);
  
  return {
    url: extractedUrl,
    type,
    mimeType,
    needsProxy: type === 'hls' && (extractedUrl.includes('kkphimplayer') || extractedUrl.includes('phimapi')),
  };
}

/**
 * Check if URL needs CORS proxy
 */
export function needsCorsProxy(url: string): boolean {
  // Add domains that typically have CORS issues
  const corsProblematicDomains = [
    'kkphimplayer',
    'phimapi',
  ];
  
  return corsProblematicDomains.some(domain => url.includes(domain));
}
