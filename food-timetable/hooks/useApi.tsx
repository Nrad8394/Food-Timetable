"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/utils/api";
import { DjangoPaginatedResponse, ApiErrorResponse } from "@/types";

export function useApi<T, U>(url: string, pageSize: number = 10) {
  const queryClient = useQueryClient();

  // Utility function to build query string
  const buildQueryString = (params?: Record<string, number | string | boolean>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    return searchParams.toString() ? `?${searchParams.toString()}` : "";
  };

  // Fetch Paginated Data (Supports Django Pagination)
  const useFetchData = (page: number, params?: Record<string, number | string| string[] | boolean|undefined>) => {
    return useQuery<DjangoPaginatedResponse<T>, AxiosError<ApiErrorResponse>>({
      queryKey: [url, page, pageSize, params],
      queryFn: async () => {
        const queryString = buildQueryString({ ...params, page, page_size: pageSize });
        const response = await api.get<DjangoPaginatedResponse<T>>(`${url}${queryString}`);
        return response.data;
      },
      placeholderData: (previousData) => previousData, // Keeps previous data while fetching new
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  };

  // Fetch a Single Item by ID (Returns Direct Object)
  const useFetchById = (id: string | number, params?: Record<string, number | string | boolean>) => {
    return useQuery<U, AxiosError<ApiErrorResponse>>({
      queryKey: [url, id, params],
      queryFn: async () => {
        const queryString = buildQueryString(params);
        const response = await api.get<U>(`${url}${id}/${queryString}`);
        return response.data;
      },
      enabled: !!id, // Only fetch if ID exists
    });
  };
const useAddItem = useMutation<
  U,
  AxiosError<ApiErrorResponse>,
  { item?: Partial<U> | FormData; params?: Record<string, string | number | boolean> } | FormData
>({
  mutationFn: async (arg) => {
    // If arg is FormData, send as-is
    if (arg instanceof FormData) {
      const response = await api.post<U>(url, arg, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    // If arg.item is FormData, send as-is
    if (arg && typeof arg === "object" && arg.item instanceof FormData) {
      const queryString = buildQueryString(arg.params);
      const response = await api.post<U>(`${url}${queryString}`, arg.item, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    // Otherwise, send as JSON
    const queryString = buildQueryString(arg.params);
    const response = await api.post<U>(`${url}${queryString}`, arg.item);
    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [url] });
  },
});

  // Update Item (Supports Query String)
  const useUpdateItem = useMutation<U, AxiosError<ApiErrorResponse>, { id: string | number; item: Partial<U>; params?: Record<string, string | number | boolean> }>(
    {
      mutationFn: async ({ id, item, params }) => {
        const queryString = buildQueryString(params);
        const response = await api.patch<U>(`${url}${id}/${queryString}`, item);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [url] });
      },
    }
  );

  // Delete Item (Supports Query String)
  const useDeleteItem = useMutation<void, AxiosError<ApiErrorResponse>, { id: string | number; params?: Record<string, string | number | boolean> }>(
    {
      mutationFn: async ({ id, params }) => {
        const queryString = buildQueryString(params);
        const baseUrl = url.endsWith('/') ? url : `${url}/`;
        if (id === '') {
          await api.delete(`${baseUrl}${queryString}`);
        } else {
          await api.delete(`${baseUrl}${id}/${queryString}`);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [url] });
      },
    }
  );

  return { useFetchData, useFetchById, useAddItem, useUpdateItem, useDeleteItem };
}