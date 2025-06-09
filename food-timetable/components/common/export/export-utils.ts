import { Column, ListItemData } from "../list/enhanced-reusable-list";
import * as React from "react";
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { schoolLogo } from "@/lib/constants";

// Convert a value to CSV-safe format
const toCsvValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If the value contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

// Create a CSV file from list data and columns
export const generateCsv = (
  data: ListItemData[], 
  columns: Column[],
  fileName: string = 'export.csv'
): void => {
  // Create header row
  const headerRow = columns.map(col => {
    if (typeof col.header === 'string') {
      return toCsvValue(col.header);
    }
    return toCsvValue(col.id);
  }).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return columns.map(column => {
      let value: any;
      
      if (column.accessorFn) {
        value = column.accessorFn(item);
      } else if (column.accessorKey) {
        // Handle ListItemData properties
        if (column.accessorKey === 'title' || column.accessorKey === 'subtitle' || 
            column.accessorKey === 'description' || column.accessorKey === 'status') {
          value = item[column.accessorKey as keyof ListItemData];
        } else if (item.metadata && column.accessorKey in item.metadata) {
          value = item.metadata[column.accessorKey];
        } else {
          // Try to find the value in the top-level item properties
          value = item[column.accessorKey as keyof ListItemData];
        }
      } else {
        // Fallback: try to use column.id to find the value
        if (column.id === 'title' || column.id === 'subtitle' || 
            column.id === 'description' || column.id === 'status') {
          value = item[column.id as keyof ListItemData];
        } else if (item.metadata && column.id in item.metadata) {
          value = item.metadata[column.id];
        }
      }
      
      // Extract text content from React elements or complex objects
      value = extractTextContent(value);
      
      return toCsvValue(value);
    }).join(',');
  });
  
  // Combine header and data rows
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a link to download the CSV file
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Convert data to Excel format using xlsx library
export const exportToExcel = (
  data: ListItemData[],
  columns: Column[],
  fileName: string = 'export.xlsx'
): void => {
  // Convert data to worksheet format
  const worksheet = XLSX.utils.json_to_sheet(
    data.map(item => {
      const row: any = {};
      columns.forEach(column => {
        let value: any;
        
        if (column.accessorFn) {
          value = column.accessorFn(item);
        } else if (column.accessorKey) {
          // Handle ListItemData properties
          if (column.accessorKey === 'title' || column.accessorKey === 'subtitle' || 
              column.accessorKey === 'description' || column.accessorKey === 'status') {
            value = item[column.accessorKey as keyof ListItemData];
          } else if (item.metadata && column.accessorKey in item.metadata) {
            value = item.metadata[column.accessorKey];
          } else {
            // Try to find the value in the top-level item properties
            value = item[column.accessorKey as keyof ListItemData];
          }
        } else {
          // Fallback: try to use column.id to find the value
          if (column.id === 'title' || column.id === 'subtitle' || 
              column.id === 'description' || column.id === 'status') {
            value = item[column.id as keyof ListItemData];
          } else if (item.metadata && column.id in item.metadata) {
            value = item.metadata[column.id];
          }
        }
        
        // Extract text content from React elements or complex objects
        value = extractTextContent(value);
        
        const header = typeof column.header === 'string' ? column.header : column.id;
        row[header] = value;
      });
      return row;
    })
  );
  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Generate and download Excel file with explicit book type
  XLSX.writeFile(workbook, fileName, { bookType: 'xlsx' });
};

// Enhanced PDF export functionality
export interface PDFExportOptions {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'a4' | 'letter' | 'legal';
  includeTimestamp?: boolean;
  author?: string;
  subject?: string;
}

// Extract text content from React elements or complex values
const extractTextContent = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  // Handle React elements
  if (React.isValidElement(value)) {
    // Try to extract text from common component patterns
    const props = value.props as any;
    if (props && typeof props.children === 'string') {
      return props.children;
    }
    if (props && typeof props.children === 'number') {
      return String(props.children);
    }
    // For Badge components or other components with array children
    if (props && props.children && Array.isArray(props.children)) {
      return props.children.map((child: any) => extractTextContent(child)).join(' ');
    }
    // Try to extract from common patterns like Badge variant props
    if (props && props.variant && typeof props.variant === 'string') {
      return props.variant;
    }
    // For complex React elements, return a fallback
    return 'Complex Element';
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(extractTextContent).join(', ');
  }
  
  // Handle objects
  if (typeof value === 'object') {
    // Try common object patterns
    if (value.toString && typeof value.toString === 'function') {
      const str = value.toString();
      if (str !== '[object Object]') {
        return str;
      }
    }
    return 'Object';
  }
  
  return String(value);
};

// Convert data to format suitable for PDF table
const prepareDataForPDF = (data: ListItemData[], columns: Column[]) => {
  const headers = columns.map(column => {
    if (typeof column.header === 'string') {
      return column.header;
    }
    return column.id;
  });

  const rows = data.map(item => {
    return columns.map(column => {
      let value: any;
      
      if (column.accessorFn) {
        value = column.accessorFn(item);
      } else if (column.accessorKey) {
        // Handle ListItemData properties
        if (column.accessorKey === 'title' || column.accessorKey === 'subtitle' || 
            column.accessorKey === 'description' || column.accessorKey === 'status') {
          value = item[column.accessorKey as keyof ListItemData];
        } else if (item.metadata && column.accessorKey in item.metadata) {
          value = item.metadata[column.accessorKey];
        } else {
          // Try to find the value in the top-level item properties
          value = item[column.accessorKey as keyof ListItemData];
        }
      } else {
        // Fallback: try to use column.id to find the value
        if (column.id === 'title' || column.id === 'subtitle' || 
            column.id === 'description' || column.id === 'status') {
          value = item[column.id as keyof ListItemData];
        } else if (item.metadata && column.id in item.metadata) {
          value = item.metadata[column.id];
        }
      }
      
      return extractTextContent(value);
    });
  });

  return { headers, rows };
};

// Generate PDF from list data and columns
export const generatePDF = (
  data: ListItemData[],
  columns: Column[],
  options: PDFExportOptions = {},
  fileName: string = 'export.pdf'
): void => {
  try {
    const {
      title = 'Data Export',
      subtitle,
      showLogo = true,
      orientation = 'portrait',
      paperSize = 'a4',
      includeTimestamp = true,
      author = 'The Nyeri National Polytechnic',
      subject = 'Data Export'
    } = options;

    // Create new PDF document
    const doc = new jsPDF({
      orientation: orientation as any,
      unit: 'mm',
      format: paperSize
    });

    // Set document metadata
    doc.setProperties({
      title,
      subject,
      author,
      creator: 'Smart Attendance System'
    });

    // Get document dimensions
    const { width, height } = doc.internal.pageSize;
    const margin = 20;
    let yPos = margin;

    // Add header with logo and institution name
    if (showLogo && schoolLogo) {
      doc.addImage(schoolLogo, 'PNG', margin, yPos, 40, 20);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('THE NYERI NATIONAL POLYTECHNIC', margin + 50, yPos + 12, { align: 'left' });
      yPos += 25;
    } else {
      // Center the institution name if no logo
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('THE NYERI NATIONAL POLYTECHNIC', width / 2, yPos + 12, { align: 'center' });
      yPos += 25;
    }

    // Add title
    yPos += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, width / 2, yPos, { align: 'center' });

    // Add subtitle if provided
    if (subtitle) {
      yPos += 7;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, width / 2, yPos, { align: 'center' });
    }

    // Add timestamp if enabled
    if (includeTimestamp) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, margin, yPos);
    }

    // Add summary information
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPos);
    
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Records: ${data.length}`, margin, yPos);
    
    yPos += 6;
    doc.text(`Columns: ${columns.length}`, margin, yPos);

    // Prepare data for table
    const { headers, rows } = prepareDataForPDF(data, columns);

    // Add data table
    yPos += 15;
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPos,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [41, 128, 185], // Blue header
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Light gray alternate rows
      },
      columnStyles: {
        // Auto-adjust column widths based on content
      },
      margin: { top: margin, right: margin, bottom: margin, left: margin },
      didDrawPage: (data) => {
        // Add page numbers
        const pageCount = doc.getNumberOfPages();
        const currentPage = doc.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${currentPage} of ${pageCount}`,
          width - margin,
          height - 10,
          { align: 'right' }
        );
      }
    });

    // Save the PDF
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF export');
  }
};

// Comprehensive export handler that supports all formats
export const exportData = (
  format: 'csv' | 'xlsx' | 'pdf',
  data: ListItemData[],
  columns: Column[],
  options: {
    fileName?: string;
    pdfOptions?: PDFExportOptions;
  } = {}
): void => {
  const { fileName, pdfOptions } = options;
  
  switch (format) {
    case 'csv':
      generateCsv(data, columns, fileName || 'export.csv');
      break;
    case 'xlsx':
      exportToExcel(data, columns, fileName || 'export.xlsx');
      break;
    case 'pdf':
      generatePDF(data, columns, pdfOptions || {}, fileName || 'export.pdf');
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// ==== SIMPLIFIED EXPORT FUNCTIONS FOR MANUAL CONTROL ====

// Simple CSV export with manual data control
export const generateSimpleCsv = (
  data: Record<string, any>[],
  headers: string[],
  fileName: string = 'export.csv'
): void => {
  // Create header row
  const headerRow = headers.map(header => toCsvValue(header)).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header] ?? '';
      return toCsvValue(value);
    }).join(',');
  });
  
  // Combine header and data rows
  const csvContent = [headerRow, ...dataRows].join('\n');
  
  // Create and download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Simple Excel export with manual data control
export const generateSimpleExcel = (
  data: Record<string, any>[],
  headers: string[],
  fileName: string = 'export.xlsx'
): void => {
  // Create worksheet data with headers
  const worksheetData = [
    headers,
    ...data.map(item => headers.map(header => item[header] ?? ''))
  ];
  
  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Generate and download Excel file
  XLSX.writeFile(workbook, fileName, { bookType: 'xlsx' });
};

// Simple PDF export with manual data control
export const generateSimplePDF = (
  data: Record<string, any>[],
  headers: string[],
  options: {
    fileName?: string;
    title?: string;
    subtitle?: string;
    orientation?: 'portrait' | 'landscape';
    showLogo?: boolean;
  } = {}
): void => {
  const {
    fileName = 'export.pdf',
    title = 'Data Export',
    subtitle,
    orientation = 'portrait',
    showLogo = true
  } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  let yPosition = 20;

  // Add logo if requested
  if (showLogo && schoolLogo) {
    try {
      doc.addImage(schoolLogo, 'PNG', 20, yPosition, 30, 30);
      yPosition += 35;
    } catch (error) {
      console.warn('Could not add logo to PDF:', error);
    }
  }

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPosition);
  yPosition += 10;

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 20, yPosition);
    yPosition += 10;
  }

  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 20, yPosition);
  yPosition += 15;

  // Prepare table data
  const tableData = data.map(item => headers.map(header => String(item[header] ?? '')));

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: yPosition, right: 20, bottom: 20, left: 20 },
  });

  // Save the PDF
  doc.save(fileName);
};

// Universal simple export function
export const exportSimpleData = (
  format: 'csv' | 'excel' | 'pdf',
  data: Record<string, any>[],
  headers: string[],
  options: {
    fileName?: string;
    title?: string;
    subtitle?: string;
    orientation?: 'portrait' | 'landscape';
    showLogo?: boolean;
  } = {}
): void => {
  const { fileName, ...otherOptions } = options;
  const baseFileName = fileName || `export-${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'csv':
      generateSimpleCsv(data, headers, `${baseFileName}.csv`);
      break;
    case 'excel':
      generateSimpleExcel(data, headers, `${baseFileName}.xlsx`);
      break;
    case 'pdf':
      generateSimplePDF(data, headers, { fileName: `${baseFileName}.pdf`, ...otherOptions });
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};
