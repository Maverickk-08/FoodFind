// API Configuration helper for handling both local dev proxy and production cloud endpoints

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/**
 * Builds a full API URL by prepending the base URL if configured.
 * @param {string} endpoint - Path starting with /api/...
 * @returns {string} Fully qualified or proxy-relative URL
 */
export function apiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
