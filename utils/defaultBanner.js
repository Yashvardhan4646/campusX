/**
 * Generates a default banner URL using a free API
 * @param {string} username - User's username for consistent seed
 * @returns {string} - Default banner URL
 */
export function getDefaultBanner(username) {
  // Use picsum.photos with user-specific seed for consistent banners
  const seed = username || 'default'
  return `https://picsum.photos/seed/${seed}/1500/500.jpg`
}

/**
 * Gets the appropriate banner URL for a user
 * @param {string} bannerUrl - User's custom banner URL (if any)
 * @param {string} username - User's username for fallback
 * @returns {string} - Banner URL to display
 */
export function getBannerUrl(bannerUrl, username) {
  if (bannerUrl && bannerUrl.trim() !== '') {
    return bannerUrl
  }
  return getDefaultBanner(username)
}
