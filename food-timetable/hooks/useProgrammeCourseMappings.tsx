"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { ProgrammeCourseMapping, ProgrammeCourseMappingInput } from "@/types"
import { api } from "@/utils/api"
import ApiService from "@/handler/ApiService"
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler"
import { handleApiError } from "@/utils/formHelpers"

export function useProgrammeCourseMappings() {

  // Create a new programme course mapping
  const createMapping = useCallback(async (data: ProgrammeCourseMappingInput) => {
    try {
      const response = await api.post(ApiService.PROGRAMME_COURSE_MAPPINGS_URL, data)
      toast.success("Course mapping created successfully")
      return response.data
    } catch (error) {
      handleApiError(error, "Failed to create course mapping")
      throw error
    }
  }, [handleApiError])

  // Bulk import mappings
  const bulkImportMappings = useCallback(async (mappings: ProgrammeCourseMappingInput[]) => {
    try {
      // Using the bulk import endpoint
      const response = await api.post(`${ApiService.PROGRAMME_COURSE_MAPPINGS_URL}bulk-import/`, { mappings })
      toast.success(`Successfully imported ${mappings.length} course mappings`)
      return response.data
    } catch (error) {
      handleApiError(error, "Failed to import course mappings")
      throw error
    }
  }, [handleApiError])

  // Update an existing programme course mapping
  const updateMapping = useCallback(async (id: string, data: Partial<ProgrammeCourseMappingInput>) => {
    try {
      const response = await api.patch(`${ApiService.PROGRAMME_COURSE_MAPPINGS_URL}${id}/`, data)
      toast.success("Course mapping updated successfully")
      return response.data
    } catch (error) {
      handleApiError(error, "Failed to update course mapping")
      throw error
    }
  }, [handleApiError])

  // Delete a programme course mapping
  const deleteMapping = useCallback(async (id: string) => {
    try {
      await api.delete(`${ApiService.PROGRAMME_COURSE_MAPPINGS_URL}${id}/`)
      toast.success("Course mapping deleted successfully")
      return true
    } catch (error) {
      handleApiError(error, "Failed to delete course mapping")
      throw error
    }
  }, [handleApiError])

  // Fetch mappings for a specific course-programme combination
  const fetchMappings = useCallback(async (courseId?: string, programmeId?: string) => {
    try {
      const params: Record<string, string> = {}
      if (courseId) params.course = courseId
      if (programmeId) params.programme = programmeId

      const response = await api.get(ApiService.PROGRAMME_COURSE_MAPPINGS_URL, { params })
      return response.data.results as ProgrammeCourseMapping[]
    } catch (error) {
      handleApiError(error, "Failed to fetch course mappings")
      return []
    }
  }, [handleApiError])

  return {
    createMapping,
    updateMapping,
    deleteMapping,
    fetchMappings,
    bulkImportMappings,
  }
}
