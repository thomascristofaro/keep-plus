/**
 * Utility functions for Instagram integration
 */

/**
 * Checks if a URL is an Instagram post URL
 * @param url - The URL to check
 * @returns true if the URL is an Instagram post URL
 */
export function isInstagramUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === 'www.instagram.com' ||
      urlObj.hostname === 'instagram.com'
    ) && urlObj.pathname.includes('/p/');
  } catch {
    return false;
  }
}

/**
 * Fetches the image URL from an Instagram post using Instagram's oEmbed API
 * @param instagramUrl - The Instagram post URL
 * @returns The image URL or null if not found
 */
export async function fetchInstagramImageUrl(instagramUrl: string): Promise<string | null> {
  try {
    // Instagram oEmbed API endpoint
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(instagramUrl)}`;
    
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch Instagram data:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    // The oEmbed API returns thumbnail_url which contains the post image
    if (data.thumbnail_url) {
      return data.thumbnail_url;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Instagram image:', error);
    return null;
  }
}
