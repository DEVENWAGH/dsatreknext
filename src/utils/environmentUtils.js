/**
 * Utility functions for environment detection and configuration
 */

/**
 * Checks if the application is running in development environment
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Determines the appropriate referer URL based on environment
 * @returns {string} The referer URL to use for API requests
 */
export const getRefererUrl = () => {
  // Check if we're in a browser environment and use window.location.origin if available
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // For server-side, use environment variable based on NODE_ENV
  return isDevelopment()
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.NEXT_PUBLIC_PRODUCTION_URL || 'http://localhost:3000';
};

/**
 * Returns the appropriate API base URL based on environment
 * @returns {string} The base API URL
 */
export const getApiBaseUrl = () => {
  return '/api';
};

/**
 * Returns the full URL for a specific API endpoint
 * @param {string} endpoint - The API endpoint path (without /api prefix)
 * @returns {string} The complete API URL
 */
export const getApiUrl = endpoint => {
  const apiBase = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${apiBase}${path}`;
};
