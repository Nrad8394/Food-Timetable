"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search, 
  SlidersHorizontal, 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Download, 
  FileDown, 
  X, 
  Trash2
} from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

// Types for our generic list component
export type FilterConfig = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'radio';
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: string | number | boolean;
  placeholder?: string;
}

export type ListItemData = {
  id: string | number
  title: string
  subtitle?: string
  description?: string
  image?: string
  icon?: React.ReactNode
  status?: string
  statusColor?: string
  metadata?: {
    [key: string]: string | number | boolean | null | undefined
  }
  actions?: React.ReactNode
  href?: string
  onClick?: () => void
}

export type Column = {
  id: string
  header: string | React.ReactNode
  accessorKey?: string  // Use this to access data directly from item.metadata or item[key]
  accessorFn?: (item: ListItemData) => React.ReactNode // Use this for custom rendering
  cell?: (item: ListItemData) => React.ReactNode
  sortable?: boolean
  align?: "left" | "center" | "right"
  width?: string // e.g. "30%", "200px"
}

export type ListProps = {
  data: ListItemData[]
  isLoading?: boolean
  emptyState?: React.ReactNode
  renderItem?: (item: ListItemData, index: number) => React.ReactNode
  className?: string
  onCreateClick?: () => void // Callback for "Create" button click
  variant?: "default" | "compact" | "grid" | "table"
  onItemClick?: (item: ListItemData) => void
  keyExtractor?: (item: ListItemData) => string | number
  
  // Search & filter functionality - controlled by parent
  searchable?: boolean | string[] // true for title/subtitle searching, string[] for specific fields
  searchTerm?: string
  onSearchChange?: (searchTerm: string) => void
  filterable?: boolean
  filters?: Record<string, string | string[]> // e.g. { status: "Active", role: ["trainer", "admin"] }
  onFiltersChange?: (filters: Record<string, string | string[]>) => void
  filterConfigs?: FilterConfig[] // Dynamic filter configurations
  
  // Sorting functionality - controlled by parent
  sortable?: boolean
  sortConfig?: {column: string; direction: "ascending" | "descending"} | null
  onSortChange?: (sortConfig: {column: string; direction: "ascending" | "descending"} | null) => void
  
  // Table specific props
  columns?: Column[]
  showHeader?: boolean
  selectable?: boolean
  selectedItems?: (string | number)[]
  onSelectionChange?: (selectedItems: (string | number)[]) => void

  // Pagination props
  paginated?: boolean
  pageSize?: number
  page?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]  // Export functionality
  exportable?: boolean
  onExport?: (format: 'csv' | 'xlsx' | 'pdf', data: ListItemData[], columns: Column[]) => void
  exportOptions?: {
    title?: string;
    subtitle?: string;
    showLogo?: boolean;
  }

  // Batch actions 
  batchActions?: React.ReactNode
  onBatchActionSelect?: (action: string, selectedItems: (string | number)[]) => void
}

// Skeleton loader for list items
const ListItemSkeleton = ({ variant = "default" }: { variant?: "default" | "compact" | "grid" | "table" }) => {
  if (variant === "table") {
    return (
      <tr>
        <td colSpan={1} className="p-2 w-14">
          <Skeleton className="h-5 w-5" />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <Skeleton className="h-4 w-[100px]" />
        </td>
        <td className="py-3 px-4">
          <Skeleton className="h-4 w-[80px]" />
        </td>
        <td className="py-3 px-4 text-right">
          <Skeleton className="h-8 w-20 ml-auto" />
        </td>
      </tr>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-4 p-4",
      variant === "compact" && "p-2",
      variant === "grid" && "flex-col items-start p-4"
    )}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full max-w-[250px]" />
        <Skeleton className="h-3 w-full max-w-[200px]" />
      </div>
    </div>
  )
}

// Default list item renderer
const DefaultListItem = ({ 
  item, 
  variant = "default", 
  onClick 
}: { 
  item: ListItemData
  variant?: "default" | "compact" | "grid" | "table" 
  onClick?: () => void 
}) => {
  const getStatusColor = () => {
    if (item.statusColor) return item.statusColor;
    
    if (item.status?.toLowerCase().includes('active') || 
        item.status?.toLowerCase().includes('present') ||
        item.status?.toLowerCase().includes('completed')) {
      return "bg-green-500";
    }
    
    if (item.status?.toLowerCase().includes('pending') ||
        item.status?.toLowerCase().includes('in progress') ||
        item.status?.toLowerCase().includes('late')) {
      return "bg-amber-500";
    }
    
    if (item.status?.toLowerCase().includes('inactive') || 
        item.status?.toLowerCase().includes('absent') ||
        item.status?.toLowerCase().includes('failed')) {
      return "bg-red-500";
    }
    
    return "bg-blue-500";
  };

  return (
    <div 
      className={cn(
        "flex gap-4 p-4 border-b last:border-0 hover:bg-muted/40 transition-colors",
        variant === "compact" && "p-2 gap-2", 
        variant === "grid" && "flex-col border rounded-lg border-border mb-0 h-full",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {(item.image || item.icon) && (
        <div className="flex-shrink-0">
          {item.image ? (
            <Avatar className={cn(
              "h-12 w-12",
              variant === "compact" && "h-8 w-8",
              variant === "grid" && "h-14 w-14"
            )}>
              <AvatarImage src={item.image} alt={item.title} />
              <AvatarFallback>
                {item.title.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={cn(
              "flex items-center justify-center h-12 w-12 rounded-full bg-muted",
              variant === "compact" && "h-8 w-8",
              variant === "grid" && "h-14 w-14"
            )}>
              {item.icon}
            </div>
          )}
        </div>
      )}
      
      <div className={cn(
        "flex flex-col flex-1 min-w-0",
        variant === "grid" && "w-full mt-2"
      )}>
        <div className={cn(
          "flex items-center justify-between gap-2",
          variant === "grid" && "flex-col items-start"
        )}>
          <div className="font-medium truncate">{item.title}</div>
          
          {item.status && (
            <Badge className={cn(getStatusColor(), "ml-auto")}>
              {item.status}
            </Badge>
          )}
        </div>
        
        {item.subtitle && (
          <div className="text-sm text-muted-foreground truncate">
            {item.subtitle}
          </div>
        )}
        
        {item.description && (
          <div className={cn(
            "text-sm text-muted-foreground mt-1 line-clamp-2",
            variant === "compact" && "line-clamp-1",
            variant === "grid" && "line-clamp-3"
          )}>
            {item.description}
          </div>
        )}
        
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div className="flex flex-wrap mt-2 gap-2">
            {Object.entries(item.metadata)
              .filter(([_, value]) => value !== undefined && value !== null)
              .map(([key, value]) => (
                <div key={key} className="text-xs flex items-center gap-1">
                  <span className="font-medium">{key}:</span>
                  <span className="text-muted-foreground">{value?.toString()}</span>
                </div>
              ))
            }
          </div>
        )}
        
        {item.actions && (
          <div className={cn(
            "mt-2 flex items-center gap-2",
            variant === "grid" && "mt-auto pt-2"
          )}>
            {item.actions}
          </div>
        )}
      </div>
    </div>
  )
}

export function EnhancedReusableList({
  data,
  isLoading = false,
  emptyState,
  renderItem,
  className,
  onCreateClick,
  variant = "default",
  onItemClick,
  keyExtractor,
  
  // Search & filter functionality - controlled by parent
  searchable = false,
  searchTerm = "",
  onSearchChange,
  filterable = false,
  filters = {},
  onFiltersChange,
  filterConfigs,
  
  // Sorting functionality - controlled by parent
  sortable = false,
  sortConfig = null,
  onSortChange,
  
  // Table specific props
  columns = [],
  showHeader = true,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  
  // Pagination props
  paginated = false,
  pageSize = 10,
  page = 1,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
    // Export functionality - controlled by parent
  exportable = false,
  onExport,
  
  // Batch actions
  batchActions,
  onBatchActionSelect
}: ListProps) {  // Only manage page size internally if not controlled by parent
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  
  // Update internal page size when parent prop changes
  useEffect(() => {
    setCurrentPageSize(pageSize);
  }, [pageSize]);
  
  // Use the data as provided by parent (already processed)
  const displayData = data;
    // Handle sort
  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;
    
    if (sortConfig?.column === columnKey) {
      if (sortConfig.direction === 'ascending') {
        onSortChange({ column: columnKey, direction: 'descending' });
      } else {
        onSortChange(null);
      }
    } else {
      onSortChange({ column: columnKey, direction: 'ascending' });
    }
  };
    // Handle filter change
  const handleFilterChange = (key: string, value: string | string[]) => {
    if (!onFiltersChange) return;
    
    const newFilters = { ...filters };
    
    if (key === 'name') {
        // Only set the name filter if there's a value
        if (value) {
            newFilters[key] = value;
        } else {
            delete newFilters[key];
        }
    } else {
        // Handle other filters
        newFilters[key] = value;
        if ((Array.isArray(value) && value.length === 0) || value === '') {
            delete newFilters[key];
        }
    }
    
    onFiltersChange(newFilters);
  };
    // Handle page change
  const handlePageChange = (newPage: number) => {
    if (!onPageChange) return;
    const totalPages = totalItems ? Math.ceil(totalItems / currentPageSize) : 1;
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };
  
  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setCurrentPageSize(newSize);
    onPageSizeChange?.(newSize);
  };  // Handle export
  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (!onExport) return;
    
    const tableColumns = columns.length > 0 ? columns : [
      { id: "title", header: "Name", accessorKey: "title" },
      { id: "subtitle", header: "Subtitle", accessorKey: "subtitle" },
      { id: "status", header: "Status", accessorKey: "status" }
    ];
    
    // Call parent's export handler with current data and columns
    onExport(format, displayData, tableColumns);
  };
  
  // Top actions bar
  const renderTopActions = () => {
    if (!exportable && !batchActions && !selectedItems.length && !onCreateClick) return null;
    
    return (
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onCreateClick && (
            <Button variant="default" size="sm" onClick={onCreateClick}>
              Create
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <>
              <Badge variant="outline" className="px-3 py-1">
                {selectedItems.length} selected
              </Badge>
              
              {batchActions && selectedItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Batch Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {React.Children.map(batchActions, (action, index) => (
                      <React.Fragment key={index}>{action}</React.Fragment>
                    ))}
                    
                    <DropdownMenuSeparator />                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => {
                        onBatchActionSelect?.('clear', []);
                        onSelectionChange?.([]);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Selection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
        
        {exportable && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    );
  };
  
  // Create search and filter UI
  const renderSearchAndFilters = () => {
    if (!searchable && !filterable) return null;
    
    return (
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {searchable && (
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          
          {filterable && (
            <div className="flex gap-2">
              <DropdownMenu modal={false}>                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger><DropdownMenuContent 
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  collisionPadding={8}
                  avoidCollisions={false}
                  className="w-[280px] fixed overflow-hidden"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  onFocusOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'INPUT' || target.closest('input') || target.closest('[role="dialog"]') || target.closest('.dropdown-menu-content')) {
                      e.preventDefault();
                    }
                  }}
                  onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'INPUT' || target.closest('input') || target.closest('[role="dialog"]') || target.closest('.dropdown-menu-content')) {
                      e.preventDefault();
                    }
                  }}
                >
                  {filterConfigs ? (
                    // Render dynamic filters based on configurations
                    filterConfigs.map((config) => (
                      <React.Fragment key={config.id}>
                        <DropdownMenuItem className="font-medium text-xs px-3 py-1.5 text-muted-foreground">
                          {config.label}
                        </DropdownMenuItem>                        
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-2">
                          <div className="flex flex-col w-full">                            {config.type === 'text' && (
                              <div onClick={(e) => e.stopPropagation()}>                                <Input
                                  id={`filter-${config.id}`}
                                  placeholder={config.placeholder}
                                  value={filters[config.id] || ''}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                  onPointerDown={(e) => {
                                    e.stopPropagation();
                                  }}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Escape') {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleFilterChange(config.id, e.target.value);
                                  }}
                                  className="w-full"
                                  autoComplete="off"
                                  autoFocus
                                />
                              </div>
                            )}
                            {config.type === 'select' && config.options && (
                              <Select
                                value={filters[config.id]?.toString()}
                                onValueChange={(value) => handleFilterChange(config.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={config.placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                  {config.options.map((option) => (
                                    <SelectItem key={option.value.toString()} value={option.value.toString()}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {(config.type === 'checkbox' || config.type === 'radio') && config.options && (
                              <div className="space-y-2">
                                {config.options.map((option) => (
                                  <div key={option.value.toString()} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`filter-${config.id}-${option.value}`}
                                      checked={
                                        config.type === 'radio'
                                          ? filters[config.id] === option.value.toString()
                                          : Array.isArray(filters[config.id]) && 
                                            filters[config.id].includes(option.value.toString())
                                      }
                                      onCheckedChange={(checked) => {
                                        if (config.type === 'radio') {
                                          handleFilterChange(config.id, checked ? option.value.toString() : '');
                                        } else {
                                          const currentValues = Array.isArray(filters[config.id]) 
                                            ? filters[config.id] as string[] 
                                            : [];
                                          handleFilterChange(
                                            config.id,
                                            checked
                                              ? [...currentValues, option.value.toString()]
                                              : currentValues.filter((v) => v !== option.value.toString())
                                          );
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor={`filter-${config.id}-${option.value}`}
                                      className="text-sm"
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </React.Fragment>
                    ))
                  ) : (
                    // Default filter UI if no configurations provided
                    <>                      <DropdownMenuItem className="font-medium text-xs px-3 py-1.5 text-muted-foreground">
                        Filter by Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-2">
                        <div 
                          className="flex flex-col w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            id="filter-name"
                            placeholder="Filter by name..."
                            value={filters.name || ''}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Escape') {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleFilterChange('name', e.target.value);
                            }}
                            className="w-full"
                            autoComplete="off"
                            autoFocus
                          />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* <DropdownMenuItem className="font-medium text-xs px-3 py-1.5 text-muted-foreground">
                    Status
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-active"
                        checked={filters.status === "Active"}
                        onCheckedChange={(checked) => {
                          handleFilterChange('status', checked ? 'Active' : '');
                        }}
                      />
                      <label htmlFor="filter-active" className="text-sm">Active</label>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-inactive"
                        checked={filters.status === "Inactive"}
                        onCheckedChange={(checked) => {
                          handleFilterChange('status', checked ? 'Inactive' : '');
                        }}
                      />
                      <label htmlFor="filter-inactive" className="text-sm">Inactive</label>
                    </div>
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {filters && Object.keys(filters).length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onFiltersChange?.({})}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>
          {/* Show active filters */}
        {filters && Object.keys(filters).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(filters).map(([key, value]) => (
              <Badge key={key} variant="outline" className="px-2 py-1">
                {key}: {Array.isArray(value) ? value.join(', ') : value}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFilterChange(key, Array.isArray(value) ? [] : '');
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Pagination component
  const renderPagination = () => {
    if (!paginated) return null;
    
    return (
      <div className="p-4 border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min((page - 1) * currentPageSize + 1, totalItems || 0)}-
            {Math.min(page * currentPageSize, totalItems || 0)} of {totalItems || 0}
          </span>
          
          <Select value={String(currentPageSize)} onValueChange={(value) => handlePageSizeChange(Number(value))}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(size => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
        <Pagination 
          currentPage={page} 
          itemsPerPage={currentPageSize}
          totalItems={totalItems || data.length}
          onPageChange={handlePageChange}
        />
      </div>
    );
  };  // Empty data handling - don't return early, let the layout handle empty state
  const hasData = data && data.length > 0;

  // Table layout
  if (variant === "table") {
    // Define default columns if none provided
    const tableColumns = columns.length > 0 ? columns : [
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
    ];
      
    return (
      <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
        {/* Top actions bar with export and batch actions */}
        {renderTopActions()}
        
        {/* Search and filter bar */}
        {(searchable || filterable) && renderSearchAndFilters()}
        
        {/* Table */}
        <Table>
          {showHeader && (
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-14">
                    <Checkbox 
                      checked={displayData.length > 0 && selectedItems.length === displayData.length}
                      onCheckedChange={(checked) => {
                        const newSelectedItems = checked 
                          ? displayData.map((item: ListItemData) => item.id)
                          : [];
                        onSelectionChange?.(newSelectedItems);
                      }}
                    />
                  </TableHead>
                )}
                
                {tableColumns.map((column) => (
                  <TableHead 
                    key={column.id}
                    className={cn(
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right",
                      column.sortable !== false && "cursor-pointer select-none",
                      column.width && `w-[${column.width}]`
                    )}
                    onClick={() => column.sortable !== false && handleSort(column.id || column.accessorKey || "")}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      
                      {column.sortable !== false && sortConfig?.column === (column.id ||column.accessorKey ) && (
                        sortConfig && sortConfig.direction === 'ascending' 
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
            <TableBody>
            {isLoading ? (
              // Show skeleton rows when loading
              [1, 2, 3, 4, 5].map((i) => (
                <ListItemSkeleton key={i} variant="table" />
              ))
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length + (selectable ? 1 : 0)}
                  className="text-center py-6"
                >
                  {emptyState || (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No items found</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((item: ListItemData) => {
                const key = keyExtractor ? keyExtractor(item) : item.id;
                const isSelected = selectedItems.includes(item.id);
                
                const handleRowClick = () => {
                  if (item.onClick) item.onClick();
                  if (onItemClick) onItemClick(item);
                };
                
                return (
                  <TableRow 
                    key={key}
                    className={cn(
                      "transition-colors",
                      isSelected && "bg-muted/70",
                      (onItemClick || item.onClick) && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={onItemClick || item.onClick ? handleRowClick : undefined}
                  >
                    {selectable && (
                      <TableCell className="w-14" onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (!onSelectionChange) return;
                            
                            const newSelectedItems = checked
                              ? [...selectedItems, item.id]
                              : selectedItems.filter(id => id !== item.id);
                            
                            onSelectionChange(newSelectedItems);
                          }}
                        />
                      </TableCell>
                    )}
                    
                    {tableColumns.map((column) => {
                      // Determine cell content based on column configuration
                      let cellContent: React.ReactNode = null;
                      
                      if (column.cell) {
                        // Use custom cell renderer if provided
                        cellContent = column.cell(item);
                      } else if (column.accessorFn) {
                        // Use accessor function if provided
                        cellContent = column.accessorFn(item);
                      } else if (column.accessorKey) {
                        // Special handling for primary fields
                        if (column.accessorKey === 'title') {
                          cellContent = (
                            <div className="flex items-center gap-3">
                              {(item.image || item.icon) && (
                                <div className="flex-shrink-0">
                                  {item.image ? (
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={item.image} alt={item.title} />
                                      <AvatarFallback>
                                        {item.title.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                                      {item.icon}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{item.title}</div>
                                {item.subtitle && (
                                  <div className="text-sm text-muted-foreground">
                                    {item.subtitle}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } else if (column.accessorKey === 'status' && item.status) {
                          // Status badge with color
                          const getStatusColor = () => {
                            if (item.statusColor) return item.statusColor;
                            
                            if (item.status?.toLowerCase().includes('active') || 
                                item.status?.toLowerCase().includes('present') ||
                                item.status?.toLowerCase().includes('completed')) {
                              return "bg-green-500";
                            }
                            
                            if (item.status?.toLowerCase().includes('pending') ||
                                item.status?.toLowerCase().includes('in progress') ||
                                item.status?.toLowerCase().includes('late')) {
                              return "bg-amber-500";
                            }
                            
                            if (item.status?.toLowerCase().includes('inactive') || 
                                item.status?.toLowerCase().includes('absent') ||
                                item.status?.toLowerCase().includes('failed')) {
                              return "bg-red-500";
                            }
                            
                            return "bg-blue-500";
                          };
                          
                          cellContent = (
                            <Badge className={getStatusColor()}>
                              {item.status}
                            </Badge>
                          );
                        } else if (column.accessorKey === 'actions' && item.actions) {
                          // Actions column
                          cellContent = item.actions;
                        } else if (column.accessorKey in item) {
                          // Direct item property
                          cellContent = (item as any)[column.accessorKey];
                        } else if (item.metadata && column.accessorKey in item.metadata) {
                          // Metadata field
                          cellContent = item.metadata[column.accessorKey]?.toString();
                        }
                      }
                      
                      return (
                        <TableCell 
                          key={column.id}
                          className={cn(
                            column.align === 'center' && "text-center",
                            column.align === 'right' && "text-right"
                          )}
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    );
  }
    // Grid layout
  if (variant === "grid") {
    return (
      <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
        {/* Top actions bar with export and batch actions */}
        {renderTopActions()}
        
        {/* Search and filter bar */}
        {(searchable || filterable) && renderSearchAndFilters()}          <div className="p-4">
          {isLoading ? (
            // Show skeleton cards when loading
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ListItemSkeleton key={i} variant="grid" />
              ))}
            </div>
          ) : !hasData ? (
            <div className="text-center py-8">
              {emptyState || (
                <div>
                  <p className="text-muted-foreground">No items found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayData.map((item: ListItemData) => {
                const key = keyExtractor ? keyExtractor(item) : item.id;
                
                return renderItem ? (
                  <React.Fragment key={key}>
                    {renderItem(item, displayData.indexOf(item))}
                  </React.Fragment>
                ) : (
                  <DefaultListItem 
                    key={key} 
                    item={item} 
                    variant="grid" 
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      if (onItemClick) onItemClick(item);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    );
  }
    // Default or compact layout
  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      {/* Top actions bar with export and batch actions */}
      {renderTopActions()}
      
      {/* Search and filter bar */}
      {(searchable || filterable) && renderSearchAndFilters()}        <div>
        {isLoading ? (
          // Show skeleton items when loading
          [1, 2, 3, 4, 5].map((i) => (
            <ListItemSkeleton key={i} variant={variant} />
          ))
        ) : !hasData ? (
          <div className="text-center py-8 px-4">
            {emptyState || (
              <div>
                <p className="text-muted-foreground">No items found</p>
              </div>
            )}
          </div>
        ) : (
          displayData.map((item: ListItemData) => {
            const key = keyExtractor ? keyExtractor(item) : item.id;
            
            return renderItem ? (
              <React.Fragment key={key}>
                {renderItem(item, displayData.indexOf(item))}
              </React.Fragment>
            ) : (
              <DefaultListItem 
                key={key} 
                item={item} 
                variant={variant} 
                onClick={() => {
                  if (item.onClick) item.onClick();
                  if (onItemClick) onItemClick(item);
                }}
              />
            );
          })
        )}
      </div>
      
      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
