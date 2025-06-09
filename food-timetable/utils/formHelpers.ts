import { toast } from "sonner"

interface ApiError {
  detail?: string;
  [key: string]: any;
}

export const handleApiError = (error: any, customMessage?: string) => {
  // Flag to track if we've already shown an error toast
  let errorShown = false;
  
  // Network or axios cancellation errors
  if (!error.response) {
    toast.error(error.message || 'Network error occurred');
    return;
  }

  const { status, data } = error.response;
  
  // First check: Direct extraction of ErrorDetail from the entire response
  if (!errorShown) {
    const responseText = JSON.stringify(data);
    const errorDetailPattern = /ErrorDetail\(string='([^']+)',\s*code='([^']+)'\)/g;
    const matches = [...responseText.matchAll(errorDetailPattern)];
    
    if (matches.length > 0) {
      toast.error(matches[0][1]);
      errorShown = true;
    }
  }

  // Handle string data that might be a representation of an object
  if (!errorShown && typeof data === 'string') {
    try {
      // Try to parse if it's a JSON string
      const parsedData = JSON.parse(data);
      error.response.data = parsedData;
    } catch (e) {
      // If it's not JSON, check if it's a Python-like error format
      const errorMatch = data.match(/\[ErrorDetail\(string='([^']+)',\s*code='([^']+)'\)\]/);
      if (errorMatch && errorMatch[1]) {
        toast.error(errorMatch[1]);
        errorShown = true;
      }
    }
  }
  
  // Handle different HTTP status codes
  if (!errorShown) {
    switch (status) {
      case 400:
        // Handle validation errors
        if (typeof data === 'object' && data !== null) {
          // Loop through once to look for ErrorDetail objects
          for (const [key, value] of Object.entries(data)) {
            if (errorShown) break;
            
            if (Array.isArray(value) && value.length > 0) {
              // Try to extract ErrorDetail directly
              const valueStr = JSON.stringify(value[0]);
              const errorMatch = valueStr.match(/string='([^']+)'/);
              if (errorMatch && errorMatch[1]) {
                toast.error(`${key}: ${errorMatch[1]}`);
                errorShown = true;
                break;
              }
              
              // Handle standard array of strings/objects
              if (typeof value[0] === 'object' && value[0].string) {
                toast.error(`${key}: ${value[0].string}`);
                errorShown = true;
                break;
              } else if (typeof value[0] === 'string') {
                toast.error(`${key}: ${value[0]}`);
                errorShown = true;
                break;
              } else if (value[0] !== null) {
                toast.error(`${key}: ${value[0]}`);
                errorShown = true;
                break;
              }
            } else if (value) {
              toast.error(`${key}: ${value}`);
              errorShown = true;
              break;
            }
          }
        }
        
        if (!errorShown) {
          toast.error(customMessage || (data?.detail) || 'Invalid request');
          errorShown = true;
        }
        break;

      case 401:
        toast.error('Session expired. Please login again');
        errorShown = true;
        // You might want to trigger a logout or redirect here
        break;

      case 403:
        if (data && data.error) {
          toast.error(data.error);
        } else {
          toast.error('You do not have permission to perform this action');
        }
        errorShown = true;
        break;

      case 404:
        toast.error(customMessage || 'Resource not found');
        errorShown = true;
        break;

      case 429:
        toast.error('Too many requests. Please try again later');
        errorShown = true;
        break;

      case 500:
        toast.error('Server error occurred. Please try again later');
        errorShown = true;
        break;

      default:
        toast.error(customMessage || (data?.detail) || 'An unexpected error occurred');
        errorShown = true;
    }
  }

  // Log error for debugging
  console.error('API Error:', {
    status,
    data,
    endpoint: error.config?.url,
    method: error.config?.method
  });
}

