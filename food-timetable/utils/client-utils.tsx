/**
 * Safe browser API utilities that handle server-side rendering
 */

// Safely get window object
export const getWindow = () => {
  return typeof window !== 'undefined' ? window : undefined;
};

// Safely get location object
export const getLocation = () => {
  return typeof window !== 'undefined' ? window.location : undefined;
};

// Safe navigation
export const navigate = (url: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
};

// Get current URL
export const getCurrentUrl = () => {
  return typeof window !== 'undefined' ? window.location.href : '';
};

// Get current path
export const getCurrentPath = () => {
  return typeof window !== 'undefined' ? window.location.pathname : '';
};

// Get query parameters
export const getQueryParams = () => {
  return typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('');
};