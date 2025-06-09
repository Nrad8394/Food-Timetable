"use client"

import React from 'react'
import { EnhancedReusableList } from '@/components/common/list/enhanced-reusable-list'
import { useExportHandler } from '@/components/common/export/enhanced-export-handler'
import { ListItemData, Column } from '@/components/common/list/enhanced-reusable-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Example component demonstrating the enhanced export functionality
const ExportExampleComponent: React.FC = () => {
  // Sample data - replace with your actual data
  const [sampleData] = React.useState<ListItemData[]>([
    {
      id: '1',
      title: 'John Doe',
      subtitle: 'john.doe@student.nnp.ac.ke',
      description: 'Computer Science student',
      status: 'Active',
      statusColor: 'green',
      metadata: {
        department: 'Computer Science',
        program: 'Diploma in Information Technology',
        year: '2nd Year',
        enrollmentDate: '2023-09-01',
        gpa: '3.8',
        phoneNumber: '+254712345678'
      }
    },
    {
      id: '2',
      title: 'Jane Smith',
      subtitle: 'jane.smith@student.nnp.ac.ke',
      description: 'Business Administration student',
      status: 'Active',
      statusColor: 'green',
      metadata: {
        department: 'Business Studies',
        program: 'Diploma in Business Administration',
        year: '1st Year',
        enrollmentDate: '2024-01-15',
        gpa: '3.9',
        phoneNumber: '+254798765432'
      }
    },
    {
      id: '3',
      title: 'Mike Johnson',
      subtitle: 'mike.johnson@student.nnp.ac.ke',
      description: 'Electrical Engineering student',
      status: 'Suspended',
      statusColor: 'red',
      metadata: {
        department: 'Engineering',
        program: 'Diploma in Electrical Engineering',
        year: '3rd Year',
        enrollmentDate: '2022-09-01',
        gpa: '2.5',
        phoneNumber: '+254756123789'
      }
    }
  ])

  // Configure export handler
  const { handleExport } = useExportHandler({
    defaultTitle: "Student Data Export",
    defaultSubtitle: "Comprehensive student information from NNP Smart Attendance System",
    showLogo: true,
    enableToasts: true
  })

  // Define columns for export
  const columns: Column[] = [
    { id: "name", header: "Full Name", accessorKey: "title" },
    { id: "email", header: "Email Address", accessorKey: "subtitle" },
    { id: "department", header: "Department", accessorFn: (item) => item.metadata?.department || 'N/A' },
    { id: "program", header: "Program", accessorFn: (item) => item.metadata?.program || 'N/A' },
    { id: "year", header: "Year of Study", accessorFn: (item) => item.metadata?.year || 'N/A' },
    { id: "gpa", header: "GPA", accessorFn: (item) => item.metadata?.gpa || 'N/A' },
    { id: "phone", header: "Phone Number", accessorFn: (item) => item.metadata?.phoneNumber || 'N/A' },
    { id: "enrollment", header: "Enrollment Date", accessorFn: (item) => item.metadata?.enrollmentDate || 'N/A' },
    { id: "status", header: "Status", accessorKey: "status" }
  ]

  // Custom export handlers for demonstration
  const handleQuickCSVExport = () => {
    handleExport('csv', sampleData, columns, {
      fileName: `students-quick-export-${new Date().toISOString().split('T')[0]}.csv`
    })
  }

  const handleDetailedPDFExport = () => {
    handleExport('pdf', sampleData, columns, {
      title: "Student Registry Report",
      subtitle: "Detailed student information including academic and contact details",
      fileName: `student-registry-${new Date().toISOString().split('T')[0]}.pdf`,
      pdfOptions: {
        orientation: 'landscape', // Better for wide tables
        paperSize: 'a4',
        includeTimestamp: true,
        author: "NNP Academic Office",
        subject: "Student Registry and Contact Information"
      }
    })
  }

  const handleExcelExport = () => {
    handleExport('xlsx', sampleData, columns, {
      title: "Student Data Export",
      fileName: `student-data-${new Date().toISOString().split('T')[0]}.xlsx`
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Export Functionality Demo</CardTitle>
          <CardDescription>
            This component demonstrates the enhanced export capabilities including CSV, Excel, and PDF exports
            with professional formatting and institution branding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={handleQuickCSVExport} variant="outline">
              Quick CSV Export
            </Button>
            <Button onClick={handleExcelExport} variant="outline">
              Excel Export
            </Button>
            <Button onClick={handleDetailedPDFExport} variant="outline">
              Detailed PDF Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student List with Integrated Export</CardTitle>
          <CardDescription>
            This list component includes export functionality in the toolbar. 
            All three export formats (CSV, Excel, PDF) are available from the Export dropdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedReusableList
            data={sampleData}
            columns={columns}
            variant="table"
            exportable={true}
            onExport={handleExport}
            exportOptions={{
              title: "Student Records",
              subtitle: "Active student database export",
              showLogo: true
            }}
            searchable={true}
            sortable={true}
            paginated={true}
            selectable={true}
            showHeader={true}
            pageSize={10}
            emptyState={
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students found</p>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">CSV Export</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Simple comma-separated format</li>
                <li>• Compatible with Excel/Google Sheets</li>
                <li>• Fast and lightweight</li>
                <li>• Best for data transfer</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Excel Export</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Native .xlsx format</li>
                <li>• Preserves data types</li>
                <li>• Professional formatting</li>
                <li>• Advanced Excel features</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">PDF Export</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Professional document format</li>
                <li>• Institution logo and branding</li>
                <li>• Customizable headers</li>
                <li>• Perfect for reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExportExampleComponent
