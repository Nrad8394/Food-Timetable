import { Column, ListItemData } from "@/components/common/list/enhanced-reusable-list"

/**
 * Export utility functions for converting data to CSV and Excel formats
 */

/**
 * Converts data to CSV format and triggers download
 */
export const exportToCSV = (
  data: ListItemData[],
  columns: Column[],
  filename: string = "export"
) => {
  if (!data.length) {
    console.warn("No data to export")
    return
  }

  // Create CSV headers
  const headers = columns.map(col => {
    if (typeof col.header === 'string') {
      return col.header
    }
    return col.id // fallback to id if header is not a string
  })

  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = ""
      
      if (col.accessorFn) {
        // Use custom accessor function
        const cellValue = col.accessorFn(item)
        value = typeof cellValue === 'string' || typeof cellValue === 'number' 
          ? String(cellValue) 
          : ""
      } else if (col.accessorKey) {
        // Use accessor key to get value from item or item.metadata
        if (col.accessorKey in item) {
          value = String(item[col.accessorKey as keyof ListItemData] || "")
        } else if (item.metadata && col.accessorKey in item.metadata) {
          value = String(item.metadata[col.accessorKey] || "")
        }
      } else if (col.cell) {
        // Use custom cell renderer (fallback to string representation)
        const cellValue = col.cell(item)
        value = typeof cellValue === 'string' || typeof cellValue === 'number' 
          ? String(cellValue) 
          : ""
      }
      
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value.includes('"')) {
        value = value.replace(/"/g, '""')
      }
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`
      }
      
      return value
    })
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Converts data to Excel format and triggers download
 * Note: This is a simple implementation. For more complex Excel features,
 * consider using libraries like xlsx or exceljs
 */
export const exportToExcel = (
  data: ListItemData[],
  columns: Column[],
  filename: string = "export"
) => {
  if (!data.length) {
    console.warn("No data to export")
    return
  }

  // Create HTML table for Excel export
  const headers = columns.map(col => {
    if (typeof col.header === 'string') {
      return col.header
    }
    return col.id // fallback to id if header is not a string
  })

  const rows = data.map(item => {
    return columns.map(col => {
      let value = ""
      
      if (col.accessorFn) {
        // Use custom accessor function
        const cellValue = col.accessorFn(item)
        value = typeof cellValue === 'string' || typeof cellValue === 'number' 
          ? String(cellValue) 
          : ""
      } else if (col.accessorKey) {
        // Use accessor key to get value from item or item.metadata
        if (col.accessorKey in item) {
          value = String(item[col.accessorKey as keyof ListItemData] || "")
        } else if (item.metadata && col.accessorKey in item.metadata) {
          value = String(item.metadata[col.accessorKey] || "")
        }
      } else if (col.cell) {
        // Use custom cell renderer (fallback to string representation)
        const cellValue = col.cell(item)
        value = typeof cellValue === 'string' || typeof cellValue === 'number' 
          ? String(cellValue) 
          : ""
      }
      
      return value
    })
  })

  // Create HTML table
  const htmlTable = `
    <table border="1">
      <thead>
        <tr>
          ${headers.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => 
          `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('')}
      </tbody>
    </table>
  `

  // Create and trigger download
  const blob = new Blob([htmlTable], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Generic export handler that can be used by parent components
 */
export const createExportHandler = (filename: string = "export") => {
  return (format: 'csv' | 'xlsx', data: ListItemData[], columns: Column[]) => {
    if (format === 'csv') {
      exportToCSV(data, columns, filename)
    } else if (format === 'xlsx') {
      exportToExcel(data, columns, filename)
    }
  }
}

/**
 * Export handler specifically for department data
 */
export const exportDepartments = createExportHandler("departments")

/**
 * Export handler specifically for user data
 */
export const exportUsers = createExportHandler("users")

/**
 * Export handler specifically for staff data
 */
export const exportStaff = createExportHandler("staff")

/**
 * Export handler specifically for trainee data
 */
export const exportTrainees = createExportHandler("trainees")
