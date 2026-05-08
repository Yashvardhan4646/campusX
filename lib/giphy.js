import { GiphyFetch } from '@giphy/js-fetch-api';

// Initialize Giphy API client
const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '');

export const GIPHY_CATEGORIES = {
  trending: 'Trending',
  reactions: 'Reactions',
  entertainment: 'Entertainment',
  sports: 'Sports',
  stickers: 'Stickers'
};

/**
 * Search GIFs on Giphy
 * @param {string} query - Search query
 * @param {number} offset - Pagination offset
 * @param {number} limit - Number of results (max 25)
 */
export async function searchGifs(query, offset = 0, limit = 20) {
  try {
    if (!process.env.NEXT_PUBLIC_GIPHY_API_KEY) {
      throw new Error('Giphy API key not configured');
    }
    
    const { data } = await gf.search(query, { offset, limit });
    return data;
  } catch (error) {
    console.error('Giphy search error:', error);
    throw error;
  }
}

/**
 * Get trending GIFs
 * @param {number} offset - Pagination offset
 * @param {number} limit - Number of results
 */
export async function getTrendingGifs(offset = 0, limit = 20) {
  try {
    if (!process.env.NEXT_PUBLIC_GIPHY_API_KEY) {
      throw new Error('Giphy API key not configured');
    }
    
    const { data } = await gf.trending({ offset, limit });
    return data;
  } catch (error) {
    console.error('Giphy trending error:', error);
    throw error;
  }
}

/**
 * Get GIFs by category/tag
 * @param {string} tag - Category tag
 * @param {number} offset - Pagination offset
 * @param {number} limit - Number of results
 */
export async function getGifsByCategory(tag, offset = 0, limit = 20) {
  try {
    if (!process.env.NEXT_PUBLIC_GIPHY_API_KEY) {
      throw new Error('Giphy API key not configured');
    }
    
    const { data } = await gf.search(tag, { offset, limit });
    return data;
  } catch (error) {
    console.error('Giphy category error:', error);
    throw error;
  }
}

/**
 * Get a single GIF by ID
 * @param {string} gifId - Giphy GIF ID
 */
export async function getGifById(gifId) {
  try {
    if (!process.env.NEXT_PUBLIC_GIPHY_API_KEY) {
      throw new Error('Giphy API key not configured');
    }
    
    const { data } = await gf.gif(gifId);
    return data;
  } catch (error) {
    console.error('Giphy get by ID error:', error);
    throw error;
  }
}

/**
 * Format GIF data for consistent structure
 * @param {Object} gif - Raw Giphy GIF object
 */
export function formatGifData(gif) {
  return {
    id: gif.id,
    title: gif.title,
    url: gif.images.fixed_height.url,
    width: gif.images.fixed_height.width,
    height: gif.images.fixed_height.height,
    previewUrl: gif.images.fixed_height_downsampled?.url || gif.images.fixed_height.url,
    originalUrl: gif.images.original.url,
    user: gif.user ? {
      username: gif.user.username,
      displayName: gif.user.display_name,
      avatarUrl: gif.user.avatar_url
    } : null,
    importDate: gif.import_datetime,
    trendingDate: gif.trending_datetime
  };
}
