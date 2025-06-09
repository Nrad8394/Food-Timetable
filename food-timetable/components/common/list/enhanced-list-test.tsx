"use client"

import React, { useState } from "react"
import { EnhancedReusableList, ListItemData } from "./enhanced-reusable-list"

// Test component to verify search/filter UI visibility in empty state
export function EnhancedListTest() {
  const [variant, setVariant] = useState<"table" | "default" | "compact" | "grid">("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, string | string[]>>({})
  const [sortConfig, setSortConfig] = useState<{column: string; direction: "ascending" | "descending"} | null>(null)

  const columns = [
    {
      id: "title",
      header: "Name",
      accessorKey: "title",
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
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Empty State Test</h2>
        <p className="text-muted-foreground mb-4">
          This test shows that search and filter UI remains visible even when there are no data entries.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Layout Variant:</label>          <select 
            value={variant} 
            onChange={(e) => setVariant(e.target.value as any)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="table">Table</option>
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="grid">Grid</option>
          </select>
        </div>
      </div>

      {/* Empty data array to test empty state */}
      <EnhancedReusableList
        data={[]} // Always empty to test empty state
        variant={variant}
        columns={columns}
        
        // Search functionality - should remain visible
        searchable={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        
        // Filter functionality - should remain visible
        filterable={true}
        filters={filters}
        onFiltersChange={setFilters}
        
        // Sorting functionality
        sortable={true}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        
        // Custom empty state
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground text-lg">🔍 No items found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Notice that search and filter controls are still visible above
            </p>
          </div>
        }
      />
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="space-y-1 text-sm">
          <div><strong>Variant:</strong> {variant}</div>
          <div><strong>Search Term:</strong> "{searchTerm}"</div>
          <div><strong>Filters:</strong> {JSON.stringify(filters)}</div>
          <div><strong>Sort Config:</strong> {sortConfig ? `${sortConfig.column} (${sortConfig.direction})` : 'None'}</div>
          <div className="text-green-600 font-medium mt-2">
            ✅ Search and filter UI should be visible above the empty state message
          </div>
        </div>
      </div>
    </div>
  )
}
