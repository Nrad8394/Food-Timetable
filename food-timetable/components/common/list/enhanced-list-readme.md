# Enhanced Reusable List Component

This component is an upgraded version of the original ReusableList component with several additional features aimed at improving usability, flexibility, and data management.

## New Features

1. **Pagination Support**
   - Server-side or client-side pagination
   - Configurable page size
   - Page size selector

2. **Data Export**
   - Export to CSV
   - Export to Excel (simplified implementation)
   - Customizable filename

3. **Batch Actions**
   - Selection of multiple items
   - Configurable batch actions menu
   - Action handlers

4. **Enhanced Filtering**
   - Improved filter UI
   - Support for custom filters
   - Filter state management

5. **Improved Responsiveness**
   - Better mobile support
   - Layout adjustments for different screen sizes

## Usage

The component maintains backward compatibility with the original ReusableList while adding new optional props:

```tsx
<EnhancedReusableList
  // Original props
  data={items}
  variant="table"
  searchable={true}
  filterable={true}
  columns={tableColumns}
  
  // New pagination props
  paginated={true}
  page={currentPage}
  pageSize={10}
  totalItems={totalCount}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[5, 10, 20, 50]}
  
  // New export props
  exportable={true}
  exportFileName="my-data-export"
  
  // New batch actions
  selectable={true}
  selectedItems={selectedIds}
  onSelectionChange={setSelectedIds}
  batchActions={
    <>
      <DropdownMenuItem onClick={() => handleBatchAction('email')}>
        <Mail className="h-4 w-4 mr-2" />
        Send Email
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleBatchAction('delete')}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Selected
      </DropdownMenuItem>
    </>
  }
  onBatchActionSelect={handleBatchAction}
/>
```

## Props Reference

| Prop | Type | Description |
|------|------|-------------|
| **Pagination** | | |
| `paginated` | boolean | Enable pagination |
| `page` | number | Current page number (1-based) |
| `pageSize` | number | Number of items per page |
| `totalItems` | number | Total number of items |
| `onPageChange` | function | Callback when page changes |
| `onPageSizeChange` | function | Callback when page size changes |
| `pageSizeOptions` | number[] | Available page size options |
| **Export** | | |
| `exportable` | boolean | Enable export functionality |
| `exportFileName` | string | Base filename for exports |
| **Batch Actions** | | |
| `batchActions` | ReactNode | Custom batch action menu items |
| `onBatchActionSelect` | function | Callback when batch action selected |

## Example

See the example implementation in:
`/app/dashboard/examples/advanced-list/page.tsx`

## Implementation Details

### Batch Actions

The batch actions feature allows users to perform operations on multiple selected items at once. This is particularly useful for administrative interfaces where bulk operations are common.

```tsx
// Define your batch actions as dropdown menu items
const batchActionElements = (
  <>
    <DropdownMenuItem onSelect={() => handleBatchAction("export", selectedItems)}>
      <Download className="mr-2 h-4 w-4" /> Export Selected
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => handleBatchAction("archive", selectedItems)}>
      <Archive className="mr-2 h-4 w-4" /> Archive Selected
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => handleBatchAction("delete", selectedItems)} className="text-destructive">
      <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
    </DropdownMenuItem>
  </>
)

// Handle the action when selected
const handleBatchAction = (action: string, selectedItems: (string | number)[]) => {
  switch(action) {
    case "delete":
      // Handle delete operation
      break;
    case "export":
      // Handle export operation
      break;
    // Handle other operations...
  }
}
```

### Export Functionality

The export feature uses the utility functions in `export-utils.ts` to export data in CSV or Excel format:

```typescript
// Generate CSV file from list data
generateCsv(data, columns, "filename.csv");

// Generate Excel file from list data
exportToExcel(data, columns, "filename.xlsx");
```

### Pagination

Pagination can be implemented in two ways:

1. **Client-side pagination**: Provide all data and the component will handle pagination internally.
2. **Server-side pagination**: Handle the data fetching yourself based on the page and pageSize, and just provide the current page's data.

Example of server-side pagination:

```tsx
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [totalItems, setTotalItems] = useState(0);
const [data, setData] = useState<ListItemData[]>([]);

useEffect(() => {
  // Fetch data based on page and pageSize
  fetchData(page, pageSize).then(result => {
    setData(result.data);
    setTotalItems(result.total);
  });
}, [page, pageSize]);

return (
  <EnhancedReusableList
    data={data}
    paginated={true}
    page={page}
    pageSize={pageSize}
    totalItems={totalItems}
    onPageChange={setPage}
    onPageSizeChange={setPageSize}
    // Other props...
  />
);
```

## Best Practices

1. **Pagination**: For large datasets (100+ items), always use pagination for better performance.
2. **Batch Actions**: Limit batch actions to common operations that make sense to perform on multiple items.
3. **Export**: Ensure that exported data includes all necessary fields, not just what's visible in the UI.
4. **Mobile Usage**: When used on mobile devices, consider switching to a more compact layout.
5. **Accessibility**: The component includes keyboard navigation support - maintain this in your implementations.
