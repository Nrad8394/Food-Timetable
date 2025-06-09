"use client"

import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export type FieldDefinition = {
  key: string
  label: string
  required?: boolean
  type: 'string' | 'number' | 'date' | 'boolean' | 'select'| 'array'
  fieldType?: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'switch'
  options?: { value: string | number; label: string }[]
  validationFn?: (value: any) => boolean | string
  helpText?: string
}

export type TemplateConfig = {
  entityName: string
  fields: FieldDefinition[]
  examples?: Record<string, any>[]
}

/**
 * Generate and download an Excel template based on config
 */
export const generateExcelTemplate = (config: TemplateConfig, fileName?: string) => {
  const { entityName, fields, examples = [] } = config
  const downloadName = fileName || `${entityName.toLowerCase()}-template.xlsx`
  
  // Create headers row
  const headers = fields.map(field => field.label)
  
  // Create required markers row
  const requiredMarkers = fields.map(field => field.required ? '(Required)' : '')
  
  // Create type info row
  const typeInfo = fields.map(field => {
    switch(field.type) {
      case 'date': return 'Date (YYYY-MM-DD)'
      case 'boolean': return 'True/False'
      case 'select': return field.options ? `Options: ${field.options.map(o => o.label).join(', ')}` : ''
      default: return ''
    }
  })
  
  // Create help text row
  const helpText = fields.map(field => field.helpText || '')
  
  // Generate example rows from provided examples or create a default example
  let exampleRows: any[][] = []
  
  if (examples.length > 0) {
    exampleRows = examples.map(example => {
      return fields.map(field => example[field.key] !== undefined ? example[field.key] : '')
    })
  } else {
    // Create a single example row with some sample data
    const sampleRow = fields.map(field => {
      switch(field.type) {
        case 'string': return `Sample ${field.label}`
        case 'number': return 42
        case 'date': return '2025-01-01'
        case 'boolean': return 'True'
        case 'select': return field.options && field.options.length > 0 ? field.options[0].value : ''
        default: return ''
      }
    })
    exampleRows.push(sampleRow)
  }
  
  // Create worksheet data
  const wsData = [
    headers,
    requiredMarkers,
    typeInfo,
    helpText,
    ...exampleRows
  ]
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  
  // Style configuration
  const headerCellStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'EFEFEF' } } }
  const instructionCellStyle = { font: { italic: true }, fill: { fgColor: { rgb: 'FFFFFF' } } }
  
  // Apply styles (XLSX-Style extension would be needed for advanced styling)
  
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  
  // Save and download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, downloadName)
}

/**
 * Parse Excel/CSV file and convert to array of objects
 */
export const parseExcelFile = async (
  file: File, 
  config: TemplateConfig
): Promise<{ data: Record<string, any>[]; errors: string[] }> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    const errors: string[] = []
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          errors.push('Failed to read file')
          resolve({ data: [], errors })
          return
        }
        
        const data = new Uint8Array(e.target.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', dateNF: 'yyyy-mm-dd' })
        
        // Get the first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        
        // Convert to JSON (skip first 3 rows which are headers, required markers, and type info)
        let jsonData = XLSX.utils.sheet_to_json(firstSheet, { range: 4 })
        
        // Map to our field keys
        const fieldNameToKey = new Map(
          config.fields.map(field => [field.label, field.key])
        )
        
        // Transform data to use our field keys
        const transformedData = jsonData.map((row: any, rowIndex: number) => {
          const newRow: Record<string, any> = {}
          
          // For each field in our config
          for (const field of config.fields) {
            const val = row[field.label]
            
            // Validate required fields
            if (field.required && (val === undefined || val === null || val === '')) {
              errors.push(`Row ${rowIndex + 1}: Missing required field "${field.label}"`)
              continue
            }
            
            // Type conversion and validation
            if (val !== undefined && val !== null && val !== '') {
              let convertedVal = val
              
              // Convert types
              switch (field.type) {
                case 'number':
                  convertedVal = Number(val)
                  if (isNaN(convertedVal)) {
                    errors.push(`Row ${rowIndex + 1}: "${field.label}" must be a number`)
                  }
                  break
                case 'date':
                  // Excel dates are already converted by XLSX
                  if (!(val instanceof Date) && typeof val !== 'string') {
                    errors.push(`Row ${rowIndex + 1}: "${field.label}" has invalid date format`)
                  }
                  break
                case 'boolean':
                  if (typeof val === 'string') {
                    const normalizedVal = val.toLowerCase().trim()
                    if (['true', 'yes', '1'].includes(normalizedVal)) {
                      convertedVal = true
                    } else if (['false', 'no', '0'].includes(normalizedVal)) {
                      convertedVal = false
                    } else {
                      errors.push(`Row ${rowIndex + 1}: "${field.label}" must be True or False`)
                    }
                  }
                  break
                case 'select':
                  if (field.options) {
                    const validOptions = field.options.map(o => o.value)
                    if (!validOptions.includes(convertedVal)) {
                      errors.push(
                        `Row ${rowIndex + 1}: "${field.label}" must be one of: ${field.options.map(o => o.label).join(', ')}`
                      )
                    }
                  }
                  break
              }
              
              // Run custom validation if provided
              if (field.validationFn) {
                const validationResult = field.validationFn(convertedVal)
                if (validationResult !== true) {
                  const errorMsg = typeof validationResult === 'string' 
                    ? validationResult
                    : `Row ${rowIndex + 1}: Invalid value for "${field.label}"`
                  
                  errors.push(errorMsg)
                }
              }
              
              newRow[field.key] = convertedVal
            }
          }
          
          return newRow
        })
        
        resolve({ 
          data: transformedData, 
          errors 
        })
      } catch (err) {
        console.error('Error parsing Excel file:', err)
        errors.push('Failed to parse file. Please make sure it is a valid Excel or CSV file.')
        resolve({ data: [], errors })
      }
    }
    
    reader.onerror = () => {
      errors.push('Error reading file')
      resolve({ data: [], errors })
    }
    
    reader.readAsArrayBuffer(file)
  })
}
