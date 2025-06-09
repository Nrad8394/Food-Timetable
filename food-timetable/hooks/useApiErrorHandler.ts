import { toast } from "sonner";
import axios, { AxiosError } from "axios";

// Define API error response structure
export interface ApiErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown; // Other field-specific errors
}

// Type guard to check if an error is an ApiErrorResponse
function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return typeof error === "object" && error !== null;
}

// Custom hook for handling API errors
export function useApiErrorHandler() {
  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        const data = error.response.data;
        if (isApiErrorResponse(data)) {
          // Handle API error response
          if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            // Handle non_field_errors (e.g., login failure)
            data.non_field_errors.forEach((msg) => 
              toast.error("Error", { description: msg })
            );
          } else if (data.detail) {
            // Handle generic API error messages
            toast.error("Error", { description: data.detail });
          } else {
            // Handle other field-specific errors dynamically
            for (const key in data) {
              if (typeof data[key] === "string") {
                toast.error(key, { description: data[key] as string });
              } else if (Array.isArray(data[key])) {
                (data[key] as string[]).forEach((msg) => 
                  toast.error(key, { description: msg })
                );
              }
            }
          }
        }
      }
    }
    else if (isApiErrorResponse(error)) {
      if (error.non_field_errors && Array.isArray(error.non_field_errors)) {
        // Handle non_field_errors (e.g., login failure)
        error.non_field_errors.forEach((msg) => 
          toast.error("Error", { description: msg })
        );
      } else if (error.detail) {
        // Handle generic API error messages
        toast.error("Error", { description: error.detail });
      } else {
        // Handle other field-specific errors dynamically
        for (const key in error) {
          if (typeof error[key] === "string") {
            toast.error(key, { description: error[key] as string });
          } else if (Array.isArray(error[key])) {
            (error[key] as string[]).forEach((msg) => 
              toast.error(key, { description: msg })
            );
          }
        }
      }
    } else {
      toast.error("Error", { description: "Something went wrong. Please try again." });
    }

    // Always throw back the error
    throw error;
  };

  return { handleError };
}