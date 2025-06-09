import * as ApiService from './apiConfig';

export const withId = (url: string, id: string | number): string => {
  // Handle both {id} and :id formats
  return url.replace(/{id}/g, id.toString()).replace(/:id/g, id.toString());
};

export default ApiService;