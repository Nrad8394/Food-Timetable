/**
 * Enhanced export utilities for the reports system
 * Supports CSV, Excel, and PDF exports
 */

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import type { 
  CourseReport, 
  TraineeReport, 
  ClassGroupReport, 
  TrainerReport,
  DepartmentReport,
  ProgrammeReport,
  SchoolReport,
  BaseWeeklyReport,
  BaseMonthlyReport,
  BaseTermReport
} from '@/types'

type ReportData = 
  | CourseReport 
  | TraineeReport 
  | ClassGroupReport 
  | TrainerReport
  | DepartmentReport
  | ProgrammeReport
  | SchoolReport
  | BaseWeeklyReport
  | BaseMonthlyReport
  | BaseTermReport

/**
 * Flatten complex objects for CSV/Excel export
 * @param data The data to flatten
 */
const flattenObject = (data: Record<string, any>, prefix = ''): Record<string, string | number> => {
  const result: Record<string, string | number> = {}

  Object.entries(data).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}_${key}` : key

    // Skip arrays and complex nested objects
    if (Array.isArray(value) || value === null) {
      return
    }
    
    if (typeof value === 'object' && value !== null) {
      // Recursively flatten objects, but only one level deep
      if (!prefix) {
        Object.assign(result, flattenObject(value, newKey))
      }
    } else {
      // Format dates
      if (key.includes('date') && typeof value === 'string' && value.includes('-')) {
        try {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            result[newKey] = format(date, 'MMM d, yyyy')
            return
          }
        } catch {}
      }
      
      // Format percentages
      if (key.includes('percentage') && typeof value === 'number') {
        result[newKey] = `${value.toFixed(1)}%`
        return
      }
      
      result[newKey] = value
    }
  })

  return result
}

/**
 * Convert data to CSV and trigger download
 * @param data Array of report objects
 * @param filename Filename for the CSV file
 */
export const exportToCSV = async (data: ReportData[], filename: string = 'report'): Promise<void> => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Flatten the data
  const flattenedData = data.map(item => flattenObject(item))

  // Get all possible headers
  const headers = Array.from(
    new Set(
      flattenedData.flatMap(item => Object.keys(item))
    )
  )

  // Create CSV rows
  const rows = flattenedData.map(item => {
    return headers.map(header => {
      let value = item[header] ?? ''
      
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && value.includes('"')) {
        value = value.toString().replace(/"/g, '""')
      }
      if (
        typeof value === 'string' && 
        (value.includes(',') || value.includes('"') || value.includes('\n'))
      ) {
        value = `"${value}"`
      }
      
      return value
    })
  })

  // Combine headers and rows
  const csvContent = [
    headers.map(h => h.replace('_', ' ')).join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename.endsWith('.csv') ? filename : filename + '.csv'}`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Convert data to Excel and trigger download
 * @param data Array of report objects
 * @param filename Filename for the Excel file
 */
export const exportToExcel = async (data: ReportData[], filename: string = 'report'): Promise<void> => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Flatten the data
  const flattenedData = data.map(item => flattenObject(item))

  // Get all headers
  const headers = Array.from(
    new Set(
      flattenedData.flatMap(item => Object.keys(item))
    )
  )

  // Format headers for display
  const formattedHeaders = headers.map(h => {
    return h.split('_').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  })

  // Create rows for the table
  const rows = flattenedData.map(item => {
    return headers.map(header => item[header] ?? '')
  })

  // Create HTML table for Excel export
  const htmlTable = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; font-weight: bold; text-align: left; }
          .report-header { background-color: #4f46e5; color: white; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr class="report-header">
              ${formattedHeaders.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => 
              `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  // Create and trigger download
  const blob = new Blob([htmlTable], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename.endsWith('.xlsx') ? filename : filename + '.xlsx'}`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Convert data to PDF and trigger download
 * @param data Array of report objects
 * @param filename Filename for the PDF file
 */
export const exportToPDF = async (data: ReportData[], filename: string = 'report'): Promise<void> => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'landscape'
  })

  // Flatten the data
  const flattenedData = data.map(item => flattenObject(item))

  // Get all possible headers
  const headers = Array.from(
    new Set(
      flattenedData.flatMap(item => Object.keys(item))
    )
  )

  // Format headers for display
  const formattedHeaders = headers.map(h => {
    return h.split('_').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  })

  // Create rows for the table
  const rows = flattenedData.map(item => {
    return headers.map(header => item[header] ?? '')
  })

  // Add title
  const reportTitle = `${filename.replace(/\.pdf$/, '')} - ${format(new Date(), 'MMMM d, yyyy')}`
  doc.setFontSize(18)
  doc.text(reportTitle, 14, 22)

  // Get report type and period from the first item
  const reportType = data[0].hasOwnProperty('course_name') ? 'Course' :
                    data[0].hasOwnProperty('trainee_name') ? 'Trainee' :
                    data[0].hasOwnProperty('trainer_name') ? 'Trainer' :
                    data[0].hasOwnProperty('class_group_name') ? 'Class Group' :
                    data[0].hasOwnProperty('programme_name') ? 'Programme' :
                    data[0].hasOwnProperty('department_name') ? 'Department' :
                    data[0].hasOwnProperty('school_name') ? 'School' : 'Attendance'

  // Add subtitle with report type
  doc.setFontSize(12)
  doc.text(`Report Type: ${reportType} | Total Records: ${data.length}`, 14, 30)

  // Add the table
  // @ts-ignore - jspdf-autotable types
  doc.autoTable({
    head: [formattedHeaders],
    body: rows,
    startY: 35,
    styles: { overflow: 'ellipsize' },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { top: 35 }
  })

  // Add footer with timestamp
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Generated on ${format(new Date(), 'MMMM d, yyyy h:mm a')} | Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Save the PDF
  doc.save(`${filename.endsWith('.pdf') ? filename : filename + '.pdf'}`)
}
