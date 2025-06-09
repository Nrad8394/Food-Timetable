"use client"

import React from "react"
import { Column, ListItemData } from "../list/enhanced-reusable-list"
import { exportData, PDFExportOptions, exportSimpleData } from "./export-utils"
import { toast } from "sonner"

// Enhanced export handler with error handling and user feedback
export interface ExportHandlerOptions {
  defaultTitle?: string
  defaultSubtitle?: string
  showLogo?: boolean
  enableToasts?: boolean
}

// Simple export handler for manual data control
export interface SimpleExportOptions {
  fileName?: string
  title?: string
  subtitle?: string
  orientation?: 'portrait' | 'landscape'
  showLogo?: boolean
}

// Hook for handling exports with consistent behavior
export const useExportHandler = (options: ExportHandlerOptions = {}) => {
  const {
    defaultTitle = "Data Export",
    defaultSubtitle,
    showLogo = true,
    enableToasts = true
  } = options

  const handleExport = React.useCallback(
    (
      format: 'csv' | 'xlsx' | 'pdf',
      data: ListItemData[],
      columns: Column[],
      customOptions?: {
        fileName?: string
        title?: string
        subtitle?: string
        pdfOptions?: Partial<PDFExportOptions>
      }
    ) => {
      try {
        if (!data || data.length === 0) {
          if (enableToasts) {
            toast.error("No data available to export")
          }
          return
        }

        if (!columns || columns.length === 0) {
          if (enableToasts) {
            toast.error("No columns configured for export")
          }
          return
        }

        const fileName = customOptions?.fileName || 
          `${defaultTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : format}`

        const pdfOptions: PDFExportOptions = {
          title: customOptions?.title || defaultTitle,
          subtitle: customOptions?.subtitle || defaultSubtitle,
          showLogo,
          orientation: 'portrait',
          paperSize: 'a4',
          includeTimestamp: true,
          author: 'The Nyeri National Polytechnic',
          subject: customOptions?.title || defaultTitle,
          ...customOptions?.pdfOptions
        }

        if (enableToasts) {
          toast.loading(`Generating ${format.toUpperCase()} export...`, {
            id: 'export-loading'
          })
        }

        // Use setTimeout to allow the loading toast to show
        setTimeout(() => {
          try {
            exportData(format, data, columns, {
              fileName,
              pdfOptions: format === 'pdf' ? pdfOptions : undefined
            })

            if (enableToasts) {
              toast.success(`${format.toUpperCase()} export generated successfully`, {
                id: 'export-loading'
              })
            }
          } catch (error) {
            console.error('Export error:', error)
            if (enableToasts) {
              toast.error(`Failed to generate ${format.toUpperCase()} export`, {
                id: 'export-loading'
              })
            }
          }
        }, 100)

      } catch (error) {
        console.error('Export handler error:', error)
        if (enableToasts) {
          toast.error("An unexpected error occurred during export")
        }
      }
    },
    [defaultTitle, defaultSubtitle, showLogo, enableToasts]
  )

  return { handleExport }
}

// Hook for handling simple exports with manual data control
export const useSimpleExportHandler = (options: ExportHandlerOptions = {}) => {
  const {
    defaultTitle = "Data Export",
    defaultSubtitle,
    showLogo = true,
    enableToasts = true
  } = options

  const handleSimpleExport = React.useCallback(
    (
      format: 'csv' | 'excel' | 'pdf',
      data: Record<string, any>[],
      headers: string[],
      customOptions?: SimpleExportOptions
    ) => {
      try {
        if (!data || data.length === 0) {
          if (enableToasts) {
            toast.error("No data available to export")
          }
          return
        }

        if (!headers || headers.length === 0) {
          if (enableToasts) {
            toast.error("No headers specified for export")
          }
          return
        }

        const fileName = customOptions?.fileName || 
          `${defaultTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`

        const exportOptions: SimpleExportOptions = {
          fileName,
          title: customOptions?.title || defaultTitle,
          subtitle: customOptions?.subtitle || defaultSubtitle,
          orientation: customOptions?.orientation || 'portrait',
          showLogo: customOptions?.showLogo ?? showLogo,
        }

        if (enableToasts) {
          toast.loading(`Generating ${format.toUpperCase()} export...`, {
            id: 'export-loading'
          })
        }

        // Use setTimeout to allow the loading toast to show
        setTimeout(() => {
          try {
            exportSimpleData(format, data, headers, exportOptions)

            if (enableToasts) {
              toast.success(`${format.toUpperCase()} export generated successfully`, {
                id: 'export-loading'
              })
            }
          } catch (error) {
            console.error('Export error:', error)
            if (enableToasts) {
              toast.error(`Failed to generate ${format.toUpperCase()} export`, {
                id: 'export-loading'
              })
            }
          }
        }, 100)

      } catch (error) {
        console.error('Export handler error:', error)
        if (enableToasts) {
          toast.error("An unexpected error occurred during export")
        }
      }
    },
    [defaultTitle, defaultSubtitle, showLogo, enableToasts]
  )

  return { handleSimpleExport }
}

// Component wrapper for export functionality
interface ExportWrapperProps {
  children: React.ReactNode
  exportOptions?: ExportHandlerOptions
  onExportReady?: (exportHandler: (format: 'csv' | 'xlsx' | 'pdf', data: ListItemData[], columns: Column[]) => void) => void
}

export const ExportWrapper: React.FC<ExportWrapperProps> = ({
  children,
  exportOptions = {},
  onExportReady
}) => {
  const { handleExport } = useExportHandler(exportOptions)

  React.useEffect(() => {
    if (onExportReady) {
      onExportReady(handleExport)
    }
  }, [handleExport, onExportReady])

  return <>{children}</>
}

// Utility function for common export scenarios
export const createExportHandler = (options: ExportHandlerOptions = {}) => {
  const { handleExport } = useExportHandler(options)
  return handleExport
}

// Pre-configured export handlers for common use cases
export const createStudentExportHandler = () => 
  createExportHandler({
    defaultTitle: "Student Data Export",
    defaultSubtitle: "Comprehensive student information",
    showLogo: true,
    enableToasts: true
  })

export const createAttendanceExportHandler = () =>
  createExportHandler({
    defaultTitle: "Attendance Report",
    defaultSubtitle: "Attendance tracking data",
    showLogo: true,
    enableToasts: true
  })

export const createCourseExportHandler = () =>
  createExportHandler({
    defaultTitle: "Course Data Export",
    defaultSubtitle: "Course information and details",
    showLogo: true,
    enableToasts: true
  })

export const createTrainerExportHandler = () =>
  createExportHandler({
    defaultTitle: "Trainer Data Export",
    defaultSubtitle: "Trainer information and assignments",
    showLogo: true,
    enableToasts: true
  })

// Simple export utility functions for common use cases
export const createSimpleExportHandler = (options: ExportHandlerOptions = {}) => {
  const { handleSimpleExport } = useSimpleExportHandler(options)
  return handleSimpleExport
}

// Pre-configured simple export handlers
export const createSimpleStudentExportHandler = () => 
  createSimpleExportHandler({
    defaultTitle: "Student Data Export",
    defaultSubtitle: "Comprehensive student information",
    showLogo: true,
    enableToasts: true
  })

export const createSimpleAttendanceExportHandler = () =>
  createSimpleExportHandler({
    defaultTitle: "Attendance Report",
    defaultSubtitle: "Attendance tracking data",
    showLogo: true,
    enableToasts: true
  })

export const createSimpleSessionExportHandler = () =>
  createSimpleExportHandler({
    defaultTitle: "Session Data Export",
    defaultSubtitle: "Session information and details",
    showLogo: true,
    enableToasts: true
  })

// Helper function to convert ListItemData to simple format
export const convertListItemDataToSimple = (
  listData: ListItemData[], 
  fieldMapping: Record<string, string | ((item: ListItemData) => any)>
): Record<string, any>[] => {
  return listData.map(item => {
    const convertedItem: Record<string, any> = {}
    
    Object.entries(fieldMapping).forEach(([outputKey, accessor]) => {
      if (typeof accessor === 'string') {
        // Direct property access
        if (accessor in item) {
          convertedItem[outputKey] = item[accessor as keyof ListItemData]
        } else if (item.metadata && accessor in item.metadata) {
          convertedItem[outputKey] = item.metadata[accessor]
        } else {
          convertedItem[outputKey] = ''
        }
      } else if (typeof accessor === 'function') {
        // Custom accessor function
        convertedItem[outputKey] = accessor(item)
      }
    })
    
    return convertedItem
  })
}
