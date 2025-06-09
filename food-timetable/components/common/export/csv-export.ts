// Helper functions for CSV export

import React from 'react';
import { ListItemData, Column } from "../list/enhanced-reusable-list";

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
  const headerRow = columns.map(col => toCsvValue(col.header)).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return columns.map(column => {
      let value: any;
      
      if (column.accessorFn) {
        value = column.accessorFn(item);
      } else if (column.accessorKey) {
        if (column.accessorKey === 'title' || column.accessorKey === 'subtitle' || column.accessorKey === 'description' || column.accessorKey === 'status') {
          value = item[column.accessorKey as keyof ListItemData];
        } else if (item.metadata && column.accessorKey in item.metadata) {
          value = item.metadata[column.accessorKey];
        }
      }
      
      // For React nodes or complex objects, try to extract text content
      if (value && typeof value === 'object' && React.isValidElement(value)) {
        value = 'Complex value'; // Can't easily extract text from React elements
      }
      
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

// Convert data to Excel format (using CSV for simplicity)
export const exportToExcel = (
  data: ListItemData[],
  columns: Column[],
  fileName: string = 'export.xlsx'
): void => {
  // For now, just use CSV with an xlsx extension
  // In a production app, you might want to use a library like xlsx to create actual Excel files
  generateCsv(data, columns, fileName);
};
