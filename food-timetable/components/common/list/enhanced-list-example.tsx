"use client"

import React, { useState, useMemo } from "react"
import { EnhancedReusableList, ListItemData } from "./enhanced-reusable-list"

// Example usage showing how parent components should handle filtering, sorting, and searching
export function EnhancedListExample() {
  // Sample data
  const sampleData: ListItemData[] = [
    {
      id: 1,
      title: "John Doe",
      subtitle: "john.doe@example.com",
      status: "Active",
      description: "Software Engineer with 5 years experience",
      metadata: {
        department: "Engineering",
        role: "Senior Developer",
        joinDate: "2020-01-15"
      }
    },
    {
      id: 2,
      title: "Jane Smith",
      subtitle: "jane.smith@example.com",
      status: "Inactive",
      description: "Product Manager specializing in user experience",
      metadata: {
        department: "Product",
        role: "Product Manager", 
        joinDate: "2019-06-20"
      }
    },
    {
      id: 3,
      title: "Bob Johnson",
      subtitle: "bob.johnson@example.com",
      status: "Active",
      description: "Senior designer with expertise in UI/UX",
      metadata: {
        department: "Design",
        role: "UI/UX Designer",
        joinDate: "2021-03-10"
      }
    }
  ]
  // Parent-controlled state
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, string | string[]>>({})
  const [sortConfig, setSortConfig] = useState<{column: string; direction: "ascending" | "descending"} | null>(null)
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showEmptyState, setShowEmptyState] = useState(false)

  // Use empty array when demonstrating empty state, otherwise use sample data
  const currentData = showEmptyState ? [] : sampleData
  // Process data based on search, filters, and sort in parent component
  const processedData = useMemo(() => {
    let result = [...currentData]

    // Apply search
    if (searchTerm) {
      const searchFields = ['title', 'subtitle', 'description']
      result = result.filter(item => {
        return searchFields.some(field => {
          const fieldValue = item[field as keyof ListItemData]
          return typeof fieldValue === 'string' && 
            fieldValue.toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }

    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, filterValue]) => {
          if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
            return true
          }

          if (key === 'status' && item.status) {
            return Array.isArray(filterValue) 
              ? filterValue.includes(item.status)
              : item.status === filterValue
          }

          if (item.metadata && key in item.metadata) {
            const metadataValue = item.metadata[key]
            return Array.isArray(filterValue)
              ? filterValue.includes(metadataValue as string)
              : metadataValue === filterValue
          }

          return false
        })
      })
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = null
        let bValue: any = null

        const columnKey = sortConfig.column

        if (columnKey === 'title' || columnKey === 'subtitle' || columnKey === 'description' || columnKey === 'status') {
          aValue = a[columnKey as keyof ListItemData]
          bValue = b[columnKey as keyof ListItemData]
        } else if (a.metadata && b.metadata) {
          aValue = a.metadata[columnKey]
          bValue = b.metadata[columnKey]
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending'
            ? aValue - bValue
            : bValue - aValue
        }

        if (aValue === bValue) return 0
        if (aValue == null) return 1
        if (bValue == null) return -1

        return sortConfig.direction === 'ascending'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      })    }

    return result
  }, [currentData, searchTerm, filters, sortConfig])

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return processedData.slice(startIndex, startIndex + pageSize)
  }, [processedData, page, pageSize])

  const handleSortChange = (newSortConfig: {column: string; direction: "ascending" | "descending"} | null) => {
    setSortConfig(newSortConfig)
  }

  const handleFiltersChange = (newFilters: Record<string, string | string[]>) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setPage(1) // Reset to first page when search changes
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when page size changes
  }

  const columns = [
    {
      id: "title",
      header: "Name",
      accessorKey: "title",
      sortable: true
    },
    {
      id: "department",
      header: "Department", 
      accessorKey: "department",
      sortable: true
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      sortable: true
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true
    }
  ]

  return (
    <div className="space-y-6">      <div>
        <h2 className="text-2xl font-bold mb-4">Enhanced List Example</h2>
        <p className="text-muted-foreground mb-6">
          This example shows how to use the EnhancedReusableList component with parent-controlled 
          filtering, sorting, and searching. The parent component manages all the data processing logic.
        </p>
        
        <div className="mb-4">
          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showEmptyState ? 'Show Data' : 'Show Empty State'}
          </button>
          <p className="text-sm text-muted-foreground mt-2">
            Click to toggle between data and empty state to see how search/filter UI remains visible
          </p>
        </div>
      </div>

      <EnhancedReusableList
        data={paginatedData}
        variant="table"
        columns={columns}
        
        // Search functionality
        searchable={true}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        
        // Filter functionality  
        filterable={true}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        
        // Sorting functionality
        sortable={true}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        
        // Selection functionality
        selectable={true}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        
        // Pagination functionality
        paginated={true}
        page={page}
        pageSize={pageSize}
        totalItems={processedData.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        
        // Export functionality
        exportable={true}
        
        // Batch actions
        batchActions={
          <>
            <button onClick={() => console.log('Archive selected:', selectedItems)}>
              Archive Selected
            </button>
            <button onClick={() => console.log('Delete selected:', selectedItems)}>
              Delete Selected  
            </button>
          </>
        }
        onBatchActionSelect={(action, items) => {
          console.log(`Batch action ${action} on items:`, items)
        }}
      />
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Current State:</h3>
        <div className="space-y-1 text-sm">
          <div><strong>Search:</strong> "{searchTerm}"</div>
          <div><strong>Filters:</strong> {JSON.stringify(filters)}</div>
          <div><strong>Sort:</strong> {sortConfig ? `${sortConfig.column} (${sortConfig.direction})` : 'None'}</div>
          <div><strong>Selected:</strong> {selectedItems.join(', ') || 'None'}</div>          <div><strong>Page:</strong> {page} of {Math.ceil(processedData.length / pageSize)}</div>
          <div><strong>Total Items:</strong> {processedData.length} (filtered from {currentData.length})</div>
          <div><strong>Data Source:</strong> {showEmptyState ? 'Empty State' : 'Sample Data'}</div>
        </div>
      </div>
    </div>
  )
}
